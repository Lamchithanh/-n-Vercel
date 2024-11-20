import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Select, message, DatePicker } from "antd";
import axios from "axios";
import { format, parseISO, isValid } from "date-fns";
import dayjs from "dayjs";
import CertificateRequired from "./CertificateRequired";

const CertificateManagement = ({ fetchUsers, fetchCourses }) => {
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, coursesData, certificatesData] = await Promise.all([
        fetchUsers(),
        fetchCourses(),
        fetchCertificates(),
      ]);
      setUsers(usersData);
      setCourses(coursesData);
      setCertificates(certificatesData);
    } catch (error) {
      message.error("Lấy dữ liệu thất bại");
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:9000/api/certificates",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy chứng chỉ:", error);
      throw error;
    }
  };

  const handleCreateCertificate = async (values) => {
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem("token");

      // Chuyển đổi giá trị form sang định dạng đúng
      const formData = {
        user_id: values.user_id,
        course_id: values.course_id,
        issued_at: values.issued_at.format("YYYY-MM-DD HH:mm:ss"),
      };

      const response = await axios.post(
        "http://localhost:9000/api/certificates",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        message.success("Tạo chứng chỉ thành công");
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error) {
      console.error("Lỗi tạo chứng chỉ:", error);
      message.error(error.response?.data?.message || "Tạo chứng chỉ thất bại");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCertificate = async () => {
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem("token");
      console.log("Đang xóa chứng chỉ với ID:", selectedCertificate?.id);

      await axios.delete(
        `http://localhost:9000/api/certificates/${selectedCertificate.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      message.success("Xóa chứng chỉ thành công");

      setIsDeleteModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Lỗi xóa chứng chỉ:", error);
      message.error(error.response?.data?.message || "Xóa chứng chỉ thất bại");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleViewRequests = () => {
    setIsRequestModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa biết";
    try {
      return dayjs(dateString).format("DD/MM/YYYY HH:mm:ss");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const columns = [
    {
      title: "Học viên",
      dataIndex: "user_id",
      key: "user_id",
      render: (userId) =>
        users.find((u) => u.id === userId)?.username || "Chưa biết",
    },
    {
      title: "Khóa học",
      dataIndex: "course_id",
      key: "course_id",
      render: (courseId) =>
        courses.find((c) => c.id === courseId)?.title || "Chưa biết",
    },
    {
      title: "Ngày cấp",
      dataIndex: "issued_at",
      key: "issued_at",
      render: (date) => formatDate(date),
    },
    {
      title: "URL Chứng chỉ",
      dataIndex: "certificate_url",
      key: "certificate_url",
      render: (url) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Xem Chứng chỉ
          </a>
        ) : (
          "Xem tại trang cá nhân của người ta"
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            onClick={() => {
              setSelectedCertificate(record);
              setIsDeleteModalVisible(true);
            }}
            className="bg-red-500 hover:bg-red-600"
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý chứng chỉ</h2>
        <Button
          onClick={() => setIsModalVisible(true)}
          className="bg-green-500 hover:bg-green-600 text-black"
          style={{ marginBottom: 15 }}
        >
          Cấp chứng chỉ mới
        </Button>
        <Button onClick={handleViewRequests} style={{ marginLeft: 5 }}>
          Xem yêu cầu
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={certificates}
        loading={loading}
        rowKey="id"
        className="shadow-lg"
      />

      <Modal
        title="Cấp chứng chỉ mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreateCertificate}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="user_id"
            label="Học viên"
            rules={[{ required: true, message: "Vui lòng chọn học viên" }]}
          >
            <Select placeholder="Chọn học viên">
              {users.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="course_id"
            label="Khóa học"
            rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
          >
            <Select placeholder="Chọn khóa học">
              {courses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="issued_at"
            label="Ngày cấp"
            rules={[{ required: true, message: "Vui lòng chọn ngày cấp" }]}
          >
            <DatePicker
              className="w-full"
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              htmlType="submit"
              style={{
                backgroundColor: "#4caf50",
                borderColor: "#4caf50",
                marginLeft: 15,
              }}
              type="primary"
              loading={submitLoading}
              className="bg-green-500 hover:bg-blue-600 text-white"
            >
              Tạo chứng chỉ
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title="Xóa chứng chỉ"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="delete"
            className="bg-red-500 hover:bg-red-600 "
            onClick={handleDeleteCertificate}
            loading={submitLoading}
          >
            Xóa
          </Button>,
        ]}
      >
        <p>
          Bạn có chắc chắn muốn xóa chứng chỉ của{" "}
          {selectedCertificate?.user_id
            ? users.find((u) => u.id === selectedCertificate.user_id)?.username
            : "Chưa biết"}{" "}
          trong{" "}
          {selectedCertificate?.course_id
            ? courses.find((c) => c.id === selectedCertificate.course_id)?.title
            : "Chưa biết"}{" "}
          khóa học này không?
        </p>
      </Modal>
      <Modal
        title="Yêu cầu chứng chỉ"
        open={isRequestModalVisible}
        onCancel={() => setIsRequestModalVisible(false)}
        footer={null}
      >
        <CertificateRequired />
      </Modal>
    </div>
  );
};

export default CertificateManagement;
