import React, { useState, useCallback, useEffect } from "react";
import {
  Table,
  Button,
  Spin,
  Modal,
  Form,
  Input,
  message,
  Card,
  Select,
} from "antd";
import {
  fetchLessonsAPI,
  fetchCoursesAPI,
  addLessonAPI,
  updateLessonAPI,
  deleteLessonAPI,
} from "../../api"; // Import các hàm API

const Lessons = ({ courseId }) => {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]); // State cho danh sách khóa học
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [form] = Form.useForm();

  // Lấy danh sách bài học theo courseId
  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const lessonsData = await fetchLessonsAPI(courseId, token); // Gọi hàm API
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      message.error("Unable to load lessons. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Lấy danh sách tất cả khóa học
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const coursesData = await fetchCoursesAPI(token); // Gọi hàm API
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Unable to load courses. Please try again later.");
    }
  };

  useEffect(() => {
    fetchLessons();
    fetchCourses();
  }, [fetchLessons]);

  const handleAddOrUpdateLesson = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (editingLesson) {
        await updateLessonAPI(editingLesson.id, values, token); // Gọi hàm API update
        message.success("Lesson updated successfully");
      } else {
        await addLessonAPI({ ...values, courseId: values.courseId }, token); // Gọi hàm API add
        message.success("Lesson added successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchLessons();
    } catch (error) {
      console.error("Error adding/updating lesson:", error);
      message.error("Unable to add/update lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await deleteLessonAPI(lessonId, token); // Gọi hàm API delete
      message.success("Lesson deleted successfully");
      fetchLessons();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      message.error("Unable to delete lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Button
        onClick={() => {
          setEditingLesson(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add New Lesson
      </Button>

      {/* Hiển thị các bài học dưới dạng thẻ (Card) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {lessons.map((lesson) => (
          <Card
            key={lesson.id}
            title={lesson.title}
            extra={
              <>
                <Button
                  onClick={() => {
                    setEditingLesson(lesson);
                    form.setFieldsValue(lesson);
                    setModalVisible(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  style={{ marginLeft: 8 }}
                >
                  Delete
                </Button>
              </>
            }
            style={{ width: 300 }}
          >
            <p>{lesson.description}</p>
            <p>{lesson.content}</p>
            <p>{lesson.video_url}</p>
          </Card>
        ))}
      </div>

      {/* Modal để thêm/chỉnh sửa bài học */}
      <Modal
        title={editingLesson ? "Edit Lesson" : "Add New Lesson"}
        visible={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdateLesson}>
          <Form.Item
            name="courseId" // Thêm khóa học vào bài học
            label="Course"
            rules={[{ required: true, message: "Please select a course!" }]}
          >
            <Select placeholder="Select a course">
              {courses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please input the lesson title!" },
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
                message: "Please input the lesson description!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[
              { required: true, message: "Please input the lesson content!" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="video_url" label="Video URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default Lessons;
