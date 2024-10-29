import { useParams } from "react-router-dom";
import { Card, Col, Row, Typography, message, Collapse } from "antd";
import {
  fetchCourseById,
  fetchModulesAPI,
  fetchLessonsAPI,
} from "../../../../server/src/api";
import { useEffect, useState } from "react";
import defaultImage from "../../assets/img/sach.png";

const { Title, Paragraph } = Typography;

const CourseDetail = () => {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const data = await fetchCourseById(courseId);
        setCourse(data);

        const modulesData = await fetchModulesAPI(courseId);
        setModules(modulesData);
      } catch (err) {
        console.error("Lỗi khi tải thông tin khóa học:", err);
        setError("Lỗi khi tải thông tin khóa học. Vui lòng thử lại sau.");
        message.error("Lỗi khi tải thông tin khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const loadLessons = async (moduleId) => {
    if (lessons[moduleId]) return;

    try {
      const lessonsData = await fetchLessonsAPI(courseId, moduleId, token);

      if (Array.isArray(lessonsData)) {
        setLessons((prevLessons) => ({
          ...prevLessons,
          [moduleId]: lessonsData,
        }));
      } else {
        throw new Error("Dữ liệu bài học không hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi khi tải bài học:", err);
      message.error("Không thể tải bài học cho module này.");
    }
  };

  // Hàm chuyển đổi URL YouTube thành embed URL
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
    setSelectedLesson(lesson);
  };

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
    onExpand: () => loadLessons(module.id),
  }));

  if (loading) return <p>Loading...</p>;
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
            <Paragraph>{course.description || "Chưa có mô tả."}</Paragraph>

            <Title level={5}>Các Modules</Title>
            <Collapse
              accordion
              items={moduleItems}
              onChange={(key) => {
                if (key) {
                  loadLessons(key);
                }
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title="Thông tin khóa học"
            style={{ marginBottom: "20px", borderRadius: "8px" }}
          >
            <p>
              <strong>Giá:</strong>{" "}
              {course.isFree
                ? "Miễn phí"
                : `${course.price.toLocaleString()} VND`}
            </p>
            <p>
              <strong>Tổng số bài học:</strong>{" "}
              {course.totalLessons || "Chưa có thông tin."}
            </p>
            <p>
              <strong>Thời gian:</strong>{" "}
              {course.duration || "Chưa có thông tin."}
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CourseDetail;
