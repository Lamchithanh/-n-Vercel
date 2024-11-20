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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GripVertical } from "lucide-react";
import { fetchCoursesAPI } from "../../Api/courseApi";
import { fetchLessonsAPI } from "../../Api/lessonApi";
import { fetchModulesAPI } from "../../Api/moduleApi";
import { addModuleAPI } from "../../Api/moduleApi";
import { deleteModuleAPI } from "../../Api/moduleApi";
import { addLessonAPI } from "../../Api/lessonApi";
import { updateLessonAPI } from "../../Api/lessonApi";
import { deleteLessonAPI } from "../../Api/lessonApi";

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
    } finally {
      setInitialLoading(false);
    }
  }, [selectedCourse]);

  const reorderLessons = async (lessons, startIndex, endIndex) => {
    const newLessons = Array.from(lessons);
    const [removed] = newLessons.splice(startIndex, 1);
    newLessons.splice(endIndex, 0, removed);

    // Cập nhật lại order_index cho tất cả các bài học
    const updatedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order_index: index,
    }));

    return updatedLessons;
  };
  const updateMultipleLessons = async (updatedLessons) => {
    const token = localStorage.getItem("token");
    const updatePromises = updatedLessons.map((lesson) =>
      updateLessonAPI(lesson.id, lesson, token)
    );
    await Promise.all(updatePromises);
  };
  // Fetch lessons
  const fetchLessons = useCallback(async () => {
    if (!selectedCourse) {
      setLessons([]);
      return;
    }

    try {
      setLoading(true);
      const lessonsData = await fetchLessonsAPI(
        selectedModule || "all",
        selectedCourse
      );
      setLessons(lessonsData || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      message.error("Unable to load lessons. Please try again later.");
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [selectedModule, selectedCourse]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    try {
      const updatedLessons = await reorderLessons(
        lessons,
        result.source.index,
        result.destination.index
      );

      setLessons(updatedLessons);
      await updateMultipleLessons(updatedLessons);
      message.success("Lesson order updated successfully");
    } catch (error) {
      console.error("Error updating lesson order:", error);
      message.error("Failed to update lesson order");
      fetchLessons(); // Rollback by refetching
    }
  };

  // Fetch modules
  const fetchModules = useCallback(async () => {
    if (!selectedCourse) {
      setModules([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const modulesData = await fetchModulesAPI(selectedCourse, token);
      setModules(modulesData || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
      message.error("Unable to load modules. Please try again later.");
      setModules([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules();
    }
  }, [selectedCourse, fetchModules]);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons();
    }
  }, [selectedCourse, selectedModule, fetchLessons]);

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedModule(null);
    setLessons([]);
  };

  const handleModuleChange = (moduleId) => {
    setSelectedModule(moduleId);
  };

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

      // Xử lý tạo module mới nếu cần
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

      const targetOrderIndex = parseInt(values.order_index);
      let currentLessons = [...lessons];

      // Xử lý khi thêm mới
      if (!editingLesson) {
        const newLesson = {
          ...values,
          course_id: selectedCourse,
          module_id: finalModuleId,
          order_index: targetOrderIndex,
        };

        // Tạo bài học mới
        const addedLesson = await addLessonAPI(newLesson, token);

        // Chèn bài học mới vào vị trí mong muốn
        currentLessons = [
          ...currentLessons.slice(0, targetOrderIndex),
          addedLesson,
          ...currentLessons.slice(targetOrderIndex),
        ];
      } else {
        // Xử lý khi cập nhật
        const currentIndex = currentLessons.findIndex(
          (lesson) => lesson.id === editingLesson.id
        );

        // Xóa bài học hiện tại khỏi mảng
        currentLessons.splice(currentIndex, 1);

        // Cập nhật thông tin bài học
        const updatedLesson = {
          ...editingLesson,
          ...values,
          course_id: selectedCourse,
          module_id: finalModuleId,
          order_index: targetOrderIndex,
        };

        // Chèn bài học đã cập nhật vào vị trí mới
        currentLessons.splice(targetOrderIndex, 0, updatedLesson);

        // Cập nhật bài học
        await updateLessonAPI(editingLesson.id, updatedLesson, token);
      }

      // Cập nhật order_index cho tất cả các bài học
      const finalLessons = currentLessons.map((lesson, index) => ({
        ...lesson,
        order_index: index,
      }));

      // Cập nhật tất cả các bài học bị ảnh hưởng
      await updateMultipleLessons(finalLessons);

      message.success(
        editingLesson
          ? "Lesson updated successfully"
          : "Lesson added successfully"
      );

      setModalVisible(false);
      form.resetFields();
      setNewModuleName("");
      setSelectedModule(null);
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

  const handleDeleteModule = async (moduleId) => {
    if (!selectedCourse) {
      message.error("Course information is missing");
      return;
    }

    Modal.confirm({
      title: "Bạn có thật sự muốn xóa chương này?",
      content: "Các bài học của chương sẽ được xóa theo và không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          await deleteModuleAPI(moduleId, token);
          message.success("Module deleted successfully!");
          fetchModules();
          fetchLessons();
        } catch (error) {
          console.error("Error deleting module:", error);
          message.error("Failed to delete module. Please try again.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Spin spinning={initialLoading || loading}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 16,
          marginRight: 16,
        }}
      >
        <Select
          style={{ width: 200, marginRight: 16 }}
          value={selectedCourse}
          onChange={handleCourseChange}
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
          Thêm bài học
        </Button>

        <Select
          style={{ width: 200, marginRight: 16, marginLeft: 16 }}
          value={selectedModule}
          onChange={handleModuleChange}
          placeholder="Select a module"
        >
          <Select.Option value={null}>Tất cả chương</Select.Option>
          {modules.map((module) => (
            <Select.Option key={module.id} value={module.id}>
              {module.title}
            </Select.Option>
          ))}
        </Select>

        <Button
          onClick={() => {
            if (!selectedModule) {
              message.error("Please select a module to delete");
              return;
            }
            handleDeleteModule(selectedModule);
          }}
          danger
        >
          Xóa chương
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lessons">
          {(provided) => (
            <Row
              gutter={16}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {!initialLoading && !loading && lessons.length === 0 ? (
                <Col span={24}>
                  <Card>Bài học không có sẳn</Card>
                </Col>
              ) : (
                lessons.map((lesson, index) => (
                  <Draggable
                    key={lesson.id}
                    draggableId={String(lesson.id)}
                    index={index}
                  >
                    {(provided) => (
                      <Col
                        xs={24}
                        sm={12}
                        md={8}
                        lg={6}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Card
                          title={
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                {...provided.dragHandleProps}
                                style={{ marginRight: 8 }}
                              >
                                <GripVertical size={16} />
                              </div>
                              {lesson.title}
                            </div>
                          }
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
                                Sửa
                              </Button>
                              <Button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                danger
                              >
                                Xóa
                              </Button>
                            </>
                          }
                        >
                          <p>
                            <strong>Chương:</strong> {lesson.module_name}
                          </p>
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
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </Row>
          )}
        </Droppable>
      </DragDropContext>

      <Modal
        title={editingLesson ? "Chỉnh sửa bài học" : "Thêm bài học"}
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
            label="Tiêu đề"
            placeholder="Nhập tên bài học"
            rules={[
              { required: true, message: "Vui lòng Nhập đầy đủ (bắt buộc)" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Miêu tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            placeholder="Thêm nội dung của bạn"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="video_url"
            label="Video URL"
            placeholder="Thêm Video bạn vào đây"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="order_index"
            label="Thứ tự 0 - > N"
            placeholder="..."
            rules={[
              { required: true, message: "Vui lòng thêm thứ tự (bắt buộc)" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item name="module_id" label="Chương">
            <Select
              value={selectedModule}
              onChange={setSelectedModule}
              placeholder="Chọn chương OR thêm mới"
            >
              {modules.map((module) => (
                <Select.Option key={module.id} value={module.id}>
                  {module.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Chương mới (nếu cần)">
            <Input
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              placeholder="Nhập tên chương (không bắt buộc)"
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
            label="Tên chương"
            rules={[
              { required: true, message: "Please enter the module name" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="order_index" label="Thứ tự">
            <Input type="number" placeholder="Số thứ tự (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default Lessons;
