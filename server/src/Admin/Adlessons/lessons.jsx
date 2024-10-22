import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Button,
  Spin,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Select,
} from "antd";
import {
  fetchCoursesAPI,
  fetchLessonsAPI,
  addLessonAPI,
  updateLessonAPI,
  deleteLessonAPI,
} from "../../api";

const Lessons = () => {
  const [lessons, setLessons] = useState([]); // Initialize as empty array
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form] = Form.useForm();

  // Fetch courses first
  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const coursesData = await fetchCoursesAPI(token);
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
        if (coursesData.length > 0 && !selectedCourse) {
          setSelectedCourse(coursesData[0].id);
        }
      } else {
        console.error("Courses data is not an array:", coursesData);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Unable to load courses. Please try again later.");
      setCourses([]);
    }
  }, [selectedCourse]);

  // Fetch lessons for selected course
  const fetchLessons = useCallback(async () => {
    if (!selectedCourse) {
      setLessons([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const lessonsData = await fetchLessonsAPI(selectedCourse, token);

      if (Array.isArray(lessonsData)) {
        setLessons(lessonsData);
      } else {
        console.error("Lessons data is not an array:", lessonsData);
        setLessons([]);
        console.log("Lessons data:", lessonsData);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      message.error("Unable to load lessons. Please try again later.");
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons();
    }
  }, [selectedCourse, fetchLessons]);

  const handleAddOrUpdateLesson = async (values) => {
    if (!selectedCourse) {
      message.error("Please select a course first");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const lessonData = {
        ...values,
        course_id: selectedCourse,
      };

      if (editingLesson) {
        await updateLessonAPI(editingLesson.id, lessonData, token);
        message.success("Lesson updated successfully");
      } else {
        await addLessonAPI(lessonData, token);
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
    if (!selectedCourse) {
      message.error("Course information is missing");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await deleteLessonAPI(selectedCourse, lessonId, token);
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
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200, marginRight: 16 }}
          value={selectedCourse}
          onChange={setSelectedCourse}
          placeholder="Select a course"
        >
          {courses.map((course) => (
            <Select.Option key={course.id} value={course.id}>
              {course.title}
            </Select.Option>
          ))}
        </Select>

        <Button
          onClick={() => {
            if (!selectedCourse) {
              message.warning("Please select a course first");
              return;
            }
            setEditingLesson(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add New Lesson
        </Button>
      </div>

      <Row gutter={16}>
        {Array.isArray(lessons) &&
          lessons.map((lesson) => (
            <Col key={lesson.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                title={lesson.title}
                extra={
                  <>
                    <Button
                      onClick={() => {
                        setEditingLesson(lesson);
                        form.setFieldsValue(lesson);
                        setModalVisible(true);
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </Button>
                    <Button onClick={() => handleDeleteLesson(lesson.id)}>
                      Delete
                    </Button>
                  </>
                }
              >
                <p>{lesson.description}</p>
                <p>
                  <strong>Content:</strong> {lesson.content}
                </p>
                <p>
                  <strong>Video URL:</strong> {lesson.video_url}
                </p>
                <p>
                  <strong>Order Index:</strong>{" "}
                  {lesson.order_index || "Not set"}
                </p>
              </Card>
            </Col>
          ))}
      </Row>

      <Modal
        title={editingLesson ? "Edit Lesson" : "Add New Lesson"}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdateLesson}>
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
            name="content"
            label="Content"
            rules={[
              { required: true, message: "Please input the lesson content!" },
            ]}
          >
            <Input.TextArea />
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
            name="video_url"
            label="Video URL"
            rules={[
              { required: true, message: "Please input the lesson video URL!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="order_index"
            label="Order Index"
            rules={[
              { required: true, message: "Please input the order index!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default Lessons;
