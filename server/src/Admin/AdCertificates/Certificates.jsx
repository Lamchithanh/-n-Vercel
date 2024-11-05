import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Select, message, DatePicker } from "antd";
import axios from "axios";
import { format, parseISO, isValid } from "date-fns";
import dayjs from "dayjs"; // Thêm import dayjs

const Certificates = ({ fetchUsers, fetchCourses }) => {
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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
      message.error("Failed to fetch data");
      console.error("Fetch error:", error);
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
      console.error("Fetch certificates error:", error);
      throw error;
    }
  };

  const handleCreateCertificate = async (values) => {
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem("token");

      // Convert form values to correct format
      const formData = {
        user_id: values.user_id,
        course_id: values.course_id,
        issued_at: values.issued_at.format("YYYY-MM-DD HH:mm:ss"), // Format datetime
      };

      const response = await axios.post(
        "http://localhost:9000/api/certificates",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        message.success("Certificate created successfully");
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error) {
      console.error("Create certificate error:", error);
      message.error(
        error.response?.data?.message || "Failed to create certificate"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return dayjs(dateString).format("DD/MM/YYYY HH:mm:ss");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:9000/api/certificates/${certificate.id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Check if the response is valid
      if (response.status !== 200) {
        throw new Error("Failed to download certificate");
      }

      // Create blob URL and trigger download
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `certificate-${certificate.user_id}-${certificate.course_id}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      message.error("Failed to download certificate");
    }
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "user_id",
      key: "user_id",
      render: (userId) =>
        users.find((u) => u.id === userId)?.username || "Unknown",
    },
    {
      title: "Course",
      dataIndex: "course_id",
      key: "course_id",
      render: (courseId) =>
        courses.find((c) => c.id === courseId)?.title || "Unknown",
    },
    {
      title: "Issue Date",
      dataIndex: "issued_at",
      key: "issued_at",
      render: (date) => formatDate(date),
    },
    {
      title: "Certificate URL",
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
            View Certificate
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          onClick={() => handleDownloadCertificate(record)}
          className="bg-blue-500 hover:bg-blue-600 text-black"
        >
          Download
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Certificate Management</h2>
        <Button
          onClick={() => setIsModalVisible(true)}
          className="bg-green-500 hover:bg-green-600 text-black"
          style={{ marginBottom: 15 }}
        >
          Issue New Certificate
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
        title="Issue New Certificate"
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
            label="Student"
            rules={[{ required: true, message: "Please select a student" }]}
          >
            <Select placeholder="Select student">
              {users.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="course_id"
            label="Course"
            rules={[{ required: true, message: "Please select a course" }]}
          >
            <Select placeholder="Select course">
              {courses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="issued_at"
            label="Issue Date"
            rules={[{ required: true, message: "Please select issue date" }]}
          >
            <DatePicker
              className="w-full"
              showTime // Enable time selection
              format="YYYY-MM-DD HH:mm:ss" // Display format
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
            >
              Cancel
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
              Create Certificate
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Certificates;
