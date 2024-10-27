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
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form] = Form.useForm();

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const coursesData = await fetchCoursesAPI(token);
      console.log("Fetched courses data:", coursesData);
      setCourses(coursesData);
      if (coursesData.length > 0 && !selectedCourse) {
        setSelectedCourse(coursesData[0].id);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Unable to load courses. Please try again later.");
      setCourses([]);
    }
  }, [selectedCourse]);

  const fetchLessons = useCallback(async () => {
    if (!selectedCourse) {
      setLessons([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const lessonsData = await fetchLessonsAPI(selectedCourse, token);
      console.log("Fetched lessons data:", lessonsData);
      setLessons(lessonsData); // Kiểm tra xem dữ liệu có đúng không
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
      console.log("Selected course ID:", selectedCourse); // Kiểm tra ID khóa học đã chọn
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
        course_id: selectedCourse, // Thêm course_id theo bảng lessons
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
          placeholder="Chọn khóa học"
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
          Thêm Bài Học Mới
        </Button>
      </div>

      <Row gutter={16}>
        {lessons.length > 0 ? (
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
                      Chỉnh sửa
                    </Button>
                    <Button onClick={() => handleDeleteLesson(lesson.id)}>
                      Xóa
                    </Button>
                  </>
                }
              >
                <p>{lesson.description}</p>
                <p>
                  <strong>Nội dung:</strong> {lesson.content}
                </p>
                <p>
                  <strong>Video URL:</strong> {lesson.video_url}
                </p>
                <p>
                  <strong>Thứ tự:</strong> {lesson.order_index}
                </p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card>
              <p>Không có bài học nào được tìm thấy.</p>
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        title={editingLesson ? "Chỉnh Sửa Bài Học" : "Thêm Bài Học Mới"}
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
            label="Tiêu đề"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề bài học!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung bài học!" },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả bài học!" },
            ]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="video_url"
            label="Video URL"
            rules={[{ required: true, message: "Vui lòng nhập URL video!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="order_index"
            label="Thứ tự"
            rules={[
              { required: true, message: "Vui lòng nhập thứ tự bài học!" },
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
