import React, { useState, useCallback, useEffect } from "react";
import { Table, Button, Spin, Modal, Form, Input, Select, message } from "antd";
import axios from "axios";

const { Option } = Select;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [priceRequired, setPriceRequired] = useState(true);
  const [form] = Form.useForm();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:9000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Không thể tải khóa học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddOrUpdateCourse = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = editingCourse
        ? `http://localhost:9000/api/courses/${editingCourse.id}`
        : "http://localhost:9000/api/courses";

      const method = editingCourse ? "put" : "post";

      const courseData = {
        ...values,
        price: values.priceOption === "free" ? "0" : values.price.toString(),
        image: editingCourse ? editingCourse.image : values.imageUrl || "",
      };

      await axios[method](apiUrl, courseData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(
        `Khóa học ${
          editingCourse ? "đã được cập nhật" : "đã được thêm"
        } thành công`
      );

      setModalVisible(false);
      form.resetFields();
      await fetchCourses();
    } catch (error) {
      console.error("Error adding/updating course:", error);
      message.error("Không thể thêm/cập nhật khóa học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (courseId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa khóa học này?",
      onOk: () => handleDeleteCourse(courseId),
    });
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:9000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Khóa học đã được xóa thành công");
      await fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      message.error("Không thể xóa khóa học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Tiêu Đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <>
          {text}
          {record.price && record.price !== "0" && record.price !== "0.00" && (
            <span> (PRO)</span>
          )}
        </>
      ),
    },
    { title: "Mô Tả", dataIndex: "description", key: "description" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (text, record) =>
        record.price === "0" || record.price === "0.00"
          ? "Miễn phí"
          : `${record.price} vnd`,
    },
    { title: "Cấp Độ", dataIndex: "level", key: "level" },
    { title: "Danh Mục", dataIndex: "category", key: "category" },
    {
      title: "Tổng Số Bài Học",
      dataIndex: "total_lessons",
      key: "total_lessons",
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => {
        if (!image) {
          return <span>Không có ảnh</span>;
        }
        return (
          <img
            src={image}
            alt="Khóa học"
            style={{
              width: 100,
              height: 100,
              objectFit: "cover",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-image.png";
            }}
          />
        );
      },
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            onClick={() => {
              setEditingCourse(record);
              form.setFieldsValue({
                ...record,
                priceOption:
                  record.price === "0" || record.price === "0.00"
                    ? "free"
                    : "paid",
              });
              setPriceRequired(record.price !== "0");
              setModalVisible(true);
            }}
          >
            Chỉnh Sửa
          </Button>

          <Button
            onClick={() => confirmDelete(record.id)}
            style={{ marginLeft: 8 }}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Button
        onClick={() => {
          setEditingCourse(null);
          form.resetFields();
          setPriceRequired(true);
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm Khóa Học Mới
      </Button>

      <Table columns={columns} dataSource={courses} rowKey="id" />

      <Modal
        title={editingCourse ? "Chỉnh Sửa Khóa Học" : "Thêm Khóa Học Mới"}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdateCourse}>
          <Form.Item
            name="title"
            label="Tiêu Đề"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề khóa học!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả khóa học!" },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="priceOption"
            label="Tùy Chọn Giá"
            rules={[
              { required: true, message: "Vui lòng chọn một tùy chọn giá!" },
            ]}
          >
            <Select
              onChange={(value) => {
                setPriceRequired(value !== "free");
                if (value === "free") form.setFieldsValue({ price: "0" });
              }}
            >
              <Option value="free">Miễn Phí</Option>
              <Option value="paid">Có Phí</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
            rules={[
              {
                required: priceRequired,
                message: "Vui lòng nhập giá khóa học!",
              },
            ]}
          >
            <Input type="number" min={0} disabled={!priceRequired} />
          </Form.Item>
          <Form.Item
            name="level"
            label="Cấp Độ"
            rules={[
              { required: true, message: "Vui lòng nhập cấp độ khóa học!" },
            ]}
          >
            <Select>
              <Option value="beginner">Người Mới Bắt Đầu</Option>
              <Option value="intermediate">Trung Cấp</Option>
              <Option value="advanced">Nâng Cao</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="Danh Mục"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn hoặc nhập danh mục khóa học!",
              },
            ]}
          >
            <Select
              placeholder="Chọn hoặc nhập danh mục"
              allowClear
              showSearch // Cho phép người dùng nhập để tìm kiếm hoặc nhập mới
            >
              <Option value="theory">Lý Thuyết</Option>
              <Option value="practice">Thực Hành</Option>
              <Option value="review">Ôn Tập</Option>
              <Option value="exam_preparation">Luyện Thi</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item name="imageUrl" label="URL Ảnh">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default Courses;
