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
  Upload,
  DatePicker,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import styles from "./BlogManagement.module.scss";

const { TextArea } = Input;

// Custom error logger
const logError = (error, context) => {
  console.error(`[${context}] Error Details:`, {
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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  // Validate form data before submission
  const validateFormData = (formData) => {
    const errors = [];
    if (!formData.title?.trim()) errors.push("Title is required");
    if (!formData.excerpt?.trim()) errors.push("Excerpt is required");
    if (!formData.date) errors.push("Date is required");
    return errors;
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get("http://localhost:9000/api/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000, // 5 second timeout
      });

      console.log("Fetched posts response:", response.data);
      setPosts(response.data);
    } catch (error) {
      logError(error, "fetchPosts");

      let errorMessage = "Failed to fetch blog posts";
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Unauthorized access. Please login again.";
            break;
          case 403:
            errorMessage = "You don't have permission to access these posts.";
            break;
          case 404:
            errorMessage = "Blog posts not found.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Error: ${
              error.response.data.message || "Unknown error occurred"
            }`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }

      message.error(errorMessage);
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
        throw new Error("Authentication token not found");
      }

      // Prepare form data
      const formData = {
        title: values.title.trim(),
        excerpt: values.excerpt.trim(),
        date: values.date.format("YYYY-MM-DD"),
        image:
          values.image?.[0]?.response?.url || values.image?.[0]?.url || null,
      };

      // Validate form data
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      console.log("Submitting form data:", formData);

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
        console.log("Update response:", response.data);
        message.success("Blog post updated successfully");
      } else {
        response = await axios.post(
          "http://localhost:9000/api/posts",
          formData,
          config
        );
        console.log("Create response:", response.data);
        message.success("Blog post created successfully");
      }

      setModalVisible(false);
      form.resetFields();
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      logError(error, "handleSubmit");

      let errorMessage = "Failed to save blog post";
      if (error.response) {
        // Log detailed server response for debugging
        console.error("Server Error Response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });

        switch (error.response.status) {
          case 400:
            errorMessage = `Invalid data: ${
              error.response.data.message || "Please check your input"
            }`;
            break;
          case 401:
            errorMessage = "Session expired. Please login again.";
            break;
          case 413:
            errorMessage = "Image size too large. Please use a smaller image.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Error: ${
              error.response.data.message || "Unknown error occurred"
            }`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
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
        throw new Error("Authentication token not found");
      }

      console.log("Deleting post:", id);

      await axios.delete(`http://localhost:9000/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      message.success("Blog post deleted successfully");
      fetchPosts();
    } catch (error) {
      logError(error, "handleDelete");

      let errorMessage = "Failed to delete blog post";
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "Blog post not found";
            break;
          case 401:
            errorMessage = "Unauthorized. Please login again.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Error: ${
              error.response.data.message || "Unknown error occurred"
            }`;
        }
      }

      message.error(errorMessage);
    }
  };

  const handleEdit = (record) => {
    try {
      console.log("Editing post:", record);
      setEditingPost(record);
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
      });
      setModalVisible(true);
    } catch (error) {
      logError(error, "handleEdit");
      message.error("Error preparing post for edit");
    }
  };

  // Rest of your component remains the same
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "30%",
    },
    {
      title: "Excerpt",
      dataIndex: "excerpt",
      key: "excerpt",
      width: "40%",
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "15%",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this post?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.blogManagement}>
      <div className={styles.header}>
        <h2>Blog Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPost(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add New Post
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingPost ? "Edit Blog Post" : "Create New Blog Post"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingPost(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ date: dayjs() }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please input the title!" }]}
          >
            <Input placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item
            name="excerpt"
            label="Excerpt"
            rules={[{ required: true, message: "Please input the excerpt!" }]}
          >
            <TextArea
              placeholder="Enter blog excerpt"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Publish Date"
            rules={[{ required: true, message: "Please select the date!" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="image"
            label="Cover Image"
            rules={[{ required: false }]}
          >
            <Upload
              name="image"
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item className={styles.formActions}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingPost(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {editingPost ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogManagement;
