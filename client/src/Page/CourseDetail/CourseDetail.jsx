import { useParams } from "react-router-dom";
import { Card, Col, Row, Typography, message, Collapse, Button } from "antd";
import {
  fetchCourseById,
  fetchModulesAPI,
  fetchLessonsAPI,
  enrollCourseAPI,
} from "../../../../server/src/api";
import { useEffect, useState } from "react";
import defaultImage from "../../assets/img/sach.png";
import Loader from "../../context/Loader";

const { Title, Paragraph } = Typography;

const CourseDetail = () => {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false); // Thêm state để theo dõi việc đã đăng ký

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const data = await fetchCourseById(courseId);
        setCourse(data);
        console.log("[Debug] Fetched course data:", data);

        const modulesData = await fetchModulesAPI(courseId);
        console.log("[Debug] Fetched modules data:", modulesData);
        setModules(modulesData);

        // Load lessons for each module
        for (const module of modulesData) {
          console.log(
            `[Debug] Loading initial lessons for module ${module.id}`
          );
          await loadLessons(module.id);
        }
      } catch (err) {
        console.error("[Debug] Error in fetchCourseData:", err);
        setError("Lỗi khi tải thông tin khóa học. Vui lòng thử lại sau.");
        message.error("Lỗi khi tải thông tin khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleEnroll = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
      message.error("Bạn cần đăng nhập để đăng ký khóa học.");
      return;
    }

    const userId = user.id;

    try {
      const response = await enrollCourseAPI({ userId, courseId });
      message.success(response.message || "Đăng ký khóa học thành công!");
      setIsEnrolled(true); // Cập nhật trạng thái đã đăng ký
    } catch (err) {
      console.error("Lỗi khi đăng ký khóa học:", err);
      message.error("Đăng ký khóa học thất bại. Vui lòng thử lại sau.");
    }
  };

  const loadLessons = async (moduleId) => {
    console.log(`[Debug] Loading lessons for moduleId: ${moduleId}`);
    try {
      const lessonsData = await fetchLessonsAPI(moduleId);
      console.log(
        `[Debug] Received lessons for module ${moduleId}:`,
        lessonsData
      );

      if (Array.isArray(lessonsData)) {
        setLessons((prevLessons) => {
          const updatedLessons = {
            ...prevLessons,
            [moduleId]: lessonsData,
          };
          console.log(
            `[Debug] Updated lessons state for module ${moduleId}:`,
            updatedLessons
          );
          return updatedLessons;
        });
      } else {
        console.error(
          `[Debug] Invalid lessons data format for module ${moduleId}:`,
          lessonsData
        );
        message.error(`Dữ liệu bài học không hợp lệ cho module ${moduleId}`);
      }
    } catch (err) {
      console.error(
        `[Debug] Error loading lessons for module ${moduleId}:`,
        err
      );
      message.error(
        `Không thể tải bài học cho module ${moduleId}. Lỗi: ${err.message}`
      );
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const handleLessonClick = (lesson) => {
    console.log("Selected lesson:", lesson);
    setSelectedLesson(lesson);
  };

  useEffect(() => {
    console.log("Current modules:", modules);
    console.log("Current lessons:", lessons);
  }, [modules, lessons]);

  const moduleItems = modules.map((module) => ({
    key: module.id.toString(),
    label: (
      <div className="module-header">
        <span>{module.title}</span>
        {lessons[module.id]?.length > 0 && (
          <span className="lesson-count">
            ({lessons[module.id].length} bài học)
          </span>
        )}
      </div>
    ),
    children: (
      <ul className="lesson-list">
        {lessons[module.id]?.map((lesson) => (
          <li
            key={lesson.id}
            className={`lesson-item ${
              selectedLesson?.id === lesson.id ? "active" : ""
            }`}
            onClick={() => handleLessonClick(lesson)}
            style={{
              cursor: "pointer",
              padding: "8px",
              backgroundColor:
                selectedLesson?.id === lesson.id ? "#f0f0f0" : "transparent",
              borderRadius: "4px",
              marginBottom: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="lesson-title">{lesson.title}</span>
            {lesson.duration && (
              <span className="lesson-duration">{lesson.duration}</span>
            )}
          </li>
        ))}
      </ul>
    ),
    onExpand: () => {
      console.log(`[Debug] Module ${module.id} expanded`);
      loadLessons(module.id);
    },
  }));

  if (loading) return <Loader />;
  if (error) return <p>{error}</p>;
  if (!course) return <p>Không tìm thấy khóa học.</p>;

  return (
    <div className="course-detail container">
      <Row gutter={16}>
        <Col span={18}>
          <Card
            title={course.title}
            style={{ marginBottom: "20px", borderRadius: "8px" }}
          >
            {/* Video Section */}
            <div className="video-section" style={{ marginBottom: "20px" }}>
              {selectedLesson ? (
                <>
                  <Title level={4}>{selectedLesson.title}</Title>
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "56.25%",
                      height: 0,
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      src={getYoutubeEmbedUrl(selectedLesson.video_url)}
                      allowFullScreen
                      title={selectedLesson.title}
                    />
                  </div>
                  <Paragraph style={{ marginTop: "16px" }}>
                    {selectedLesson.description ||
                      "Chưa có mô tả cho bài học này."}
                  </Paragraph>
                </>
              ) : course.intro_video_url ? (
                <>
                  <Title level={4}>Giới thiệu khóa học</Title>
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "56.25%",
                      height: 0,
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      src={getYoutubeEmbedUrl(course.intro_video_url)}
                      allowFullScreen
                      title="Giới thiệu khóa học"
                    />
                  </div>
                </>
              ) : (
                <img
                  alt={course.title}
                  src={course.image || defaultImage}
                  style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                />
              )}
            </div>

            <Title level={4}>Nội dung khóa học</Title>
            <Collapse items={moduleItems} />
          </Card>
        </Col>

        <Col span={6}>
          <Card title="Thông tin khóa học">
            <p>
              <strong>Giá:</strong> {course.price} VND
            </p>
            <p>
              <strong>Giảng viên:</strong> {course.instructor_name}
            </p>
            <p>
              <strong>Thời gian:</strong> {course.duration} phút
            </p>
            <p>
              <strong>Số bài học:</strong> {course.total_lessons}
            </p>
            <p>
              <strong>Mô tả:</strong> {course.description}
            </p>
            {/* Nút đăng ký khóa học */}
            {!isEnrolled && (
              <Button type="primary" onClick={handleEnroll}>
                Đăng ký khóa học
              </Button>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CourseDetail;
