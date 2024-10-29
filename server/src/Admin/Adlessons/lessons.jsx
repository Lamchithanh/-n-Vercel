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
  fetchModulesAPI,
  addLessonAPI,
  updateLessonAPI,
  deleteLessonAPI,
  addModuleAPI,
} from "../../api";

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [moduleModalVisible, setModuleModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [newModuleName, setNewModuleName] = useState("");
  const [form] = Form.useForm();
  const [moduleForm] = Form.useForm();

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const coursesData = await fetchCoursesAPI(token);
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

  // Fetch lessons
  const fetchLessons = useCallback(async () => {
    if (!selectedCourse) {
      setLessons([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const lessonsData = await fetchLessonsAPI(selectedCourse, token);
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      message.error("Unable to load lessons. Please try again later.");
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  // Fetch modules
  const fetchModules = useCallback(async () => {
    if (!selectedCourse) return;
    try {
      const modulesData = await fetchModulesAPI(selectedCourse);
      setModules(modulesData);
      if (modulesData.length > 0 && !selectedModule) {
        setSelectedModule(modulesData[0].id);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      message.error("Unable to load modules. Please try again later.");
      setModules([]);
    }
  }, [selectedCourse]);

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch lessons and modules when selected course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchLessons();
      fetchModules();
    }
  }, [selectedCourse, fetchLessons, fetchModules]);

  const handleAddOrUpdateLesson = async (values) => {
    if (!selectedCourse) {
      message.error("Please select a course first");
      return;
    }

    if (!selectedModule && !newModuleName) {
      message.error(
        "Please enter a new module name or select an existing module"
      );
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Create a new module if needed
      let finalModuleId = selectedModule;
      if (newModuleName) {
        const moduleData = {
          title: newModuleName,
          course_id: selectedCourse,
          order_index: 0,
        };
        const newModule = await addModuleAPI(moduleData, token);
        finalModuleId = newModule.id;
      }

      const lessonData = {
        ...values,
        course_id: selectedCourse,
        module_id: finalModuleId,
      };

      const conflictingLesson = lessons.find(
        (lesson) =>
          lesson.order_index === lessonData.order_index &&
          (!editingLesson || lesson.id !== editingLesson.id)
      );

      if (conflictingLesson) {
        conflictingLesson.order_index = editingLesson
          ? editingLesson.order_index
          : lessonData.order_index;

        await updateLessonAPI(conflictingLesson.id, conflictingLesson, token);
      }

      if (editingLesson) {
        await updateLessonAPI(editingLesson.id, lessonData, token);
        message.success("Lesson updated successfully");
      } else {
        await addLessonAPI(lessonData, token);
        message.success("Lesson added successfully");
      }

      setModalVisible(false);
      form.resetFields();
      setNewModuleName("");
      setSelectedModule(null);
      fetchLessons();
      fetchModules();
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

    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa bài học này?",
      content: "Thao tác này không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          await deleteLessonAPI(selectedCourse, lessonId, token);
          message.success("Xóa bài học thành công!");
          fetchLessons();
        } catch (error) {
          console.error("Error deleting lesson:", error);
          message.error("Không thể xóa bài học. Vui lòng thử lại.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleAddModule = async (values) => {
    if (!selectedCourse) {
      message.error("Please select a course first");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const moduleData = {
        title: values.title,
        course_id: selectedCourse,
        order_index: values.order_index || 0,
      };

      await addModuleAPI(moduleData, token);
      message.success("Module added successfully");
      setModuleModalVisible(false);
      moduleForm.resetFields();
      fetchModules();
    } catch (error) {
      console.error("Error adding module:", error);
      message.error("Failed to add module. Please try again.");
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
            setNewModuleName("");
            setModalVisible(true);
          }}
        >
          Add New Lesson
        </Button>

        {/* Phần lọc chương */}
        <Select
          style={{ width: 200, marginLeft: 16 }}
          value={selectedModule}
          onChange={setSelectedModule}
          placeholder="Select a module"
        >
          <Select.Option value={null}>All Lessons</Select.Option>
          {modules.map((module) => (
            <Select.Option key={module.id} value={module.id}>
              {module.title}
            </Select.Option>
          ))}
        </Select>
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
                        setSelectedModule(lesson.module_id);
                        setModalVisible(true);
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      danger
                    >
                      Delete
                    </Button>
                  </>
                }
              >
                <p>
                  <strong>Module:</strong> {lesson.module_name}
                </p>
                <p>{lesson.description}</p>
                <p>
                  <strong>Content:</strong> {lesson.content}
                </p>
                <p>
                  <strong>Video URL:</strong> {lesson.video_url}
                </p>
                <p>
                  <strong>Order:</strong> {lesson.order_index}
                </p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card>No lessons available</Card>
          </Col>
        )}
      </Row>

      <Modal
        title={editingLesson ? "Edit Lesson" : "Add New Lesson"}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setNewModuleName("");
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAddOrUpdateLesson}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter the lesson title" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="content" label="Content">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="video_url" label="Video URL">
            <Input />
          </Form.Item>
          <Form.Item
            name="order_index"
            label="Order"
            rules={[{ required: true, message: "Please enter the order" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item name="module_id" label="Select Module">
            <Select
              value={selectedModule}
              onChange={setSelectedModule}
              placeholder="Choose a module or add new"
            >
              {modules.map((module) => (
                <Select.Option key={module.id} value={module.id}>
                  {module.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="New Module Name (Optional)">
            <Input
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              placeholder="Enter a new module name"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Module"
        visible={moduleModalVisible}
        onCancel={() => setModuleModalVisible(false)}
        onOk={() => moduleForm.submit()}
      >
        <Form form={moduleForm} onFinish={handleAddModule}>
          <Form.Item
            name="title"
            label="Module Name"
            rules={[
              { required: true, message: "Please enter the module name" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="order_index" label="Order">
            <Input type="number" placeholder="Enter order number (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default Lessons;
