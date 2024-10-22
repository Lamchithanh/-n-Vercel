import React, { useState, useCallback, useEffect } from "react";
import { Table, Button, Spin, Modal, Form, Input, Select, message } from "antd";
import axios from "axios";

const { Option } = Select;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:9000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data); // Kiểm tra dữ liệu trả về từ API
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Unable to load courses. Please try again later.");
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
      let response;
      if (editingCourse) {
        response = await axios.put(
          `http://localhost:9000/api/courses/${editingCourse.id}`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        message.success("Course updated successfully");
      } else {
        response = await axios.post(
          "http://localhost:9000/api/courses",
          values,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        message.success("Course added successfully");
      }
      console.log(response); // Kiểm tra response trả về
      setModalVisible(false);
      form.resetFields();
      fetchCourses();
    } catch (error) {
      console.error("Error adding/updating course:", error);
      message.error("Unable to add/update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:9000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      message.error("Unable to delete course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Title",
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
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <>
          {record.price === "0" || record.price === "0.00"
            ? "Miễn phí"
            : `${record.price} vnd`}
        </>
      ),
    },
    { title: "Level", dataIndex: "level", key: "level" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            onClick={() => {
              setEditingCourse(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            onClick={() => handleDeleteCourse(record.id)}
            style={{ marginLeft: 8 }}
          >
            Delete
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
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add New Course
      </Button>

      <Table columns={columns} dataSource={courses} rowKey="id" />

      <Modal
        title={editingCourse ? "Edit Course" : "Add New Course"}
        visible={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdateCourse}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: "Please input the course title!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message: "Please input the course description!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="priceOption"
            label="Price Option"
            rules={[
              {
                required: true,
                message: "Please select a price option!",
              },
            ]}
          >
            <Select
              onChange={(value) => {
                if (value === "free") {
                  form.setFieldsValue({ price: "0" });
                } else {
                  form.setFieldsValue({ price: "" });
                }
              }}
            >
              <Option value="free">Miễn phí</Option>
              <Option value="paid">Nhập số tiền</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="price"
            label="Price Amount"
            rules={[
              {
                required: true,
                message: "Please input the course price!",
                validator: (_, value) => {
                  const priceOption = form.getFieldValue("priceOption");
                  if (priceOption === "paid" && !value) {
                    return Promise.reject(
                      new Error("Please input the course price!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number" placeholder="Nhập số tiền" />
          </Form.Item>
          <Form.Item
            name="level"
            label="Level"
            rules={[
              {
                required: true,
                message: "Please select the course level!",
              },
            ]}
          >
            <Select>
              <Option value="beginner">Beginner</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="advanced">Advanced</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[
              {
                required: true,
                message: "Please input the course category!",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default Courses;
