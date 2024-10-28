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

    // Kiểm tra xem đã chọn module hay chưa
    if (!selectedModule && !newModuleName) {
      message.error(
        "Please enter a new module name or select an existing module"
      );
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Xử lý tạo module mới nếu có
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
        module_id: finalModuleId, // Sử dụng module_id mới hoặc đã chọn
      };

      // Xử lý trùng order_index
      const conflictingLesson = lessons.find(
        (lesson) =>
          lesson.order_index === lessonData.order_index &&
          (!editingLesson || lesson.id !== editingLesson.id)
      );

      if (conflictingLesson) {
        const tempOrderIndex = conflictingLesson.order_index;
        conflictingLesson.order_index = editingLesson
          ? editingLesson.order_index
          : lessonData.order_index;

        await updateLessonAPI(conflictingLesson.id, conflictingLesson, token);
      }

      if (editingLesson) {
        // Đảm bảo cập nhật module_id khi edit
        await updateLessonAPI(
          editingLesson.id,
          {
            ...lessonData,
            module_id: finalModuleId,
          },
          token
        );
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

  // Add new module
  const handleAddModule = async (values) => {
    if (!selectedCourse) {
      message.error("Please select a course first");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to add a module");
        return;
      }

      // Prepare module data
      const moduleData = {
        title: values.title,
        course_id: selectedCourse,
        order_index: values.order_index || 0, // Default order index if not provided
      };

      await addModuleAPI(moduleData, token);
      message.success("Module added successfully");
      setModuleModalVisible(false);
      moduleForm.resetFields();
      fetchModules(); // Refresh module list after adding
    } catch (error) {
      console.error("Error adding module:", error);
      if (error.response) {
        console.error("Response:", error.response);
        message.error(error.response.data?.message || "Failed to add module");
      } else {
        message.error("Network error. Please try again.");
      }
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

        <Button
          style={{ marginLeft: 16 }}
          onClick={() => {
            if (!selectedCourse) {
              message.warning("Please select a course first");
              return;
            }
            setModuleModalVisible(true);
            moduleForm.resetFields();
          }}
        >
          Add New Module
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
                        setSelectedModule(lesson.module_id);
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
                  <strong>Order:</strong> {lesson.order_index}
                </p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card>
              <p>No lessons found.</p>
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        title={editingLesson ? "Edit Lesson" : "Add Lesson"}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedModule(null);
          setNewModuleName("");
          form.resetFields();
        }}
        onOk={form.submit}
      >
        <Form
          form={form}
          onFinish={handleAddOrUpdateLesson}
          initialValues={editingLesson}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Video URL"
            name="video_url"
            rules={[{ required: true, message: "Please enter Video URL" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Order"
            name="order_index"
            rules={[{ required: true, message: "Please enter order" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Module">
            <Select
              value={selectedModule}
              onChange={(value) => {
                setSelectedModule(value);
                setNewModuleName(""); // Clear new module name when selecting existing module
              }}
              style={{ width: "100%", marginBottom: 8 }}
              allowClear
              placeholder="Select existing module"
            >
              {modules.map((module) => (
                <Select.Option key={module.id} value={module.id}>
                  {module.title}
                </Select.Option>
              ))}
            </Select>
            <Input
              placeholder="Or enter new module name"
              value={newModuleName}
              onChange={(e) => {
                setNewModuleName(e.target.value);
                setSelectedModule(null); // Clear selected module when entering new name
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Module"
        visible={moduleModalVisible}
        onCancel={() => setModuleModalVisible(false)}
        onOk={moduleForm.submit}
      >
        <Form form={moduleForm} onFinish={handleAddModule}>
          <Form.Item
            label="Course"
            name="course_id"
            initialValue={selectedCourse}
            rules={[{ required: true, message: "Please select course" }]}
          >
            <Select
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
          </Form.Item>

          <Form.Item
            label="Module Name"
            name="title"
            rules={[{ required: true, message: "Please enter module name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Order"
            name="order_index"
            initialValue={0}
            rules={[{ required: true, message: "Please enter order" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default Lessons;
