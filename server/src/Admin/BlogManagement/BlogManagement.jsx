import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  DatePicker,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import styles from "./BlogManagement.module.scss";

const { TextArea } = Input;

// Logger lỗi tùy chỉnh
const logError = (error, context) => {
  console.error(`[${context}] Chi tiết lỗi:`, {
    message: error.message,
    stack: error.stack,
    response: error.response?.data,
    status: error.response?.status,
    headers: error.response?.headers,
    config: {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
    },
  });
};

const BlogManagement = () => {
  const [posts, setPosts] = useState([]); // Danh sách bài viết
  const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
  const [modalVisible, setModalVisible] = useState(false); // Trạng thái hiển thị modal
  const [editingPost, setEditingPost] = useState(null); // Bài viết đang chỉnh sửa
  const [form] = Form.useForm(); // Form sử dụng trong modal
  const [submitLoading, setSubmitLoading] = useState(false); // Trạng thái khi gửi form

  // Xác thực dữ liệu form trước khi gửi
  const validateFormData = (formData) => {
    const errors = [];
    if (!formData.title?.trim()) errors.push("Tiêu đề là bắt buộc");
    if (!formData.excerpt?.trim()) errors.push("Tóm tắt là bắt buộc");
    if (!formData.date) errors.push("Ngày là bắt buộc");
    return errors;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Kiểm tra token chi tiết hơn
      if (!token || token.trim() === "") {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const response = await axios.get("http://localhost:9000/api/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000, // Giới hạn thời gian chờ
      });

      // Kiểm tra dữ liệu trả về
      if (response.data && Array.isArray(response.data)) {
        console.log("Danh sách bài viết:", response.data);
        setPosts(response.data);
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMap = {
          401: "Truy cập không được ủy quyền. Vui lòng đăng nhập lại.",
          403: "Bạn không có quyền truy cập các bài đăng này.",
          404: "Không tìm thấy bài đăng.",
          500: "Lỗi máy chủ. Vui lòng thử lại sau.",
        };

        const errorMessage =
          errorMap[status] ||
          `Lỗi: ${
            error.response?.data?.message || "Đã xảy ra lỗi không xác định"
          }`;

        message.error(errorMessage);
      } else if (error.request) {
        message.error(
          "Không có phản hồi từ máy chủ. Vui lòng kiểm tra kết nối."
        );
      } else {
        message.error("Lỗi không xác định khi tải bài viết");
      }

      logError(error, "fetchPosts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token xác thực không tìm thấy");
      }

      // Chuẩn bị dữ liệu form
      const formData = {
        title: values.title.trim(),
        excerpt: values.excerpt.trim(),
        date: values.date.format("YYYY-MM-DD"),
        image: values.image || editingPost?.image || null, // Giữ lại URL cũ nếu không có thay đổi
      };

      // Xác thực dữ liệu form
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        throw new Error(
          `Xác thực không thành công: ${validationErrors.join(", ")}`
        );
      }

      console.log("Đang gửi dữ liệu form:", formData);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      };

      let response;
      if (editingPost) {
        response = await axios.put(
          `http://localhost:9000/api/posts/${editingPost.id}`,
          formData,
          config
        );
        console.log("Phản hồi khi cập nhật:", response.data);
        message.success("Cập nhật bài viết thành công");
      } else {
        response = await axios.post(
          "http://localhost:9000/api/posts",
          formData,
          config
        );
        console.log("Phản hồi khi tạo mới:", response.data);
        message.success("Tạo bài viết mới thành công");
      }

      setModalVisible(false);
      form.resetFields();
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      logError(error, "handleSubmit");

      let errorMessage = "Lỗi khi lưu bài viết";
      if (error.response) {
        console.error("Phản hồi lỗi từ server:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });

        switch (error.response.status) {
          case 400:
            errorMessage = `Dữ liệu không hợp lệ: ${
              error.response.data.message ||
              "Vui lòng kiểm tra lại dữ liệu nhập"
            }`;
            break;
          case 401:
            errorMessage = "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.";
            break;
          case 413:
            errorMessage =
              "Kích thước ảnh quá lớn. Vui lòng sử dụng ảnh có kích thước nhỏ hơn.";
            break;
          case 500:
            errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau.";
            break;
          default:
            errorMessage = `Lỗi: ${
              error.response.data.message || "Lỗi không xác định"
            }`;
        }
      } else if (error.request) {
        errorMessage =
          "Không có phản hồi từ máy chủ. Vui lòng kiểm tra kết nối.";
      } else if (error.message.includes("Validation failed")) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token xác thực không tìm thấy");
      }

      console.log("Đang xóa bài viết:", id);

      await axios.delete(`http://localhost:9000/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      message.success("Xóa bài viết thành công");
      fetchPosts();
    } catch (error) {
      logError(error, "handleDelete");

      let errorMessage = "Lỗi khi xóa bài viết";
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "Bài viết không tìm thấy";
            break;
          case 401:
            errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại.";
            break;
          case 500:
            errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau.";
            break;
          default:
            errorMessage = `Lỗi: ${
              error.response.data.message || "Lỗi không xác định"
            }`;
        }
      }

      message.error(errorMessage);
    }
  };

  const handleEdit = (record) => {
    try {
      console.log("Chỉnh sửa bài viết:", record);
      setEditingPost(record);
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
      });
      setModalVisible(true);
    } catch (error) {
      logError(error, "handleEdit");
      message.error("Lỗi khi chuẩn bị bài viết để chỉnh sửa");
    }
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: "30%",
    },
    {
      title: "Tóm tắt",
      dataIndex: "excerpt",
      key: "excerpt",
      width: "40%",
      ellipsis: true,
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: "15%",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài viết này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} type="danger" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}
      >
        Thêm mới bài viết
      </Button>
      <Table
        dataSource={posts}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
      <Modal
        title={editingPost ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={editingPost || {}}
        >
          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}>
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
          <Form.Item
            label="Tóm tắt"
            name="excerpt"
            rules={[{ required: true }]}
          >
            <TextArea placeholder="Nhập tóm tắt" rows={4} />
          </Form.Item>
          <Form.Item label="Ngày" name="date" rules={[{ required: true }]}>
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              defaultValue={editingPost ? dayjs(editingPost.date) : undefined}
            />
          </Form.Item>
          <Form.Item label="Ảnh" name="image" rules={[{ required: false }]}>
            <Input placeholder="Nhập URL ảnh" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitLoading}
            >
              {editingPost ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogManagement;
