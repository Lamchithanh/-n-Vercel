import { useParams } from "react-router-dom";
import { Card, Col, Row, Typography, Button, message } from "antd";
import { fetchCourseById } from "../../../../server/src/api"; // Đường dẫn tới file API
import defaultImage from "../../assets/img/sach.png"; // Đường dẫn tới ảnh mặc định
import "./CourseDetail.scss"; // Đường dẫn tới file CSS cho styling
import { useEffect, useState } from "react";

const { Title, Paragraph } = Typography;

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const data = await fetchCourseById(id);
        setCourse(data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin khóa học:", err);
        setError("Lỗi khi tải thông tin khóa học. Vui lòng thử lại sau.");
        message.error("Lỗi khi tải thông tin khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (!course) {
    return <p>Không tìm thấy khóa học.</p>;
  }

  return (
    <div className="course-detail container">
      <Row gutter={16}>
        <Col span={18}>
          <Card
            title={course.title}
            style={{ marginBottom: "20px", borderRadius: "8px" }}
          >
            <img
              alt={course.title}
              src={course.image || defaultImage}
              style={{
                width: "300px",
                height: "auto",
                borderRadius: "8px",
              }}
            />
            <Title level={4}>Nội dung khóa học</Title>
            <Paragraph>{course.description || "Chưa có mô tả."}</Paragraph>

            <Title level={5}>Bạn sẽ học được gì?</Title>
            <div className="course-content">
              {Array.isArray(course.content) && course.content.length > 0 ? (
                <ul>
                  {course.content.map((item, index) => (
                    <li key={index}>{item || "Chưa có thông tin."}</li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có nội dung khóa học.</p>
              )}
            </div>
            <Button type="primary" style={{ marginTop: "10px" }}>
              Đăng ký học
            </Button>
          </Card>

          <Card
            title="Kiến Thức Nhập Môn IT"
            style={{ marginBottom: "10px", borderRadius: "8px" }}
          >
            <Paragraph>
              Để có cái nhìn tổng quan về ngành IT - Lập trình web, các bạn nên
              xem các videos tại khóa này trước nhé.
            </Paragraph>
            <Title level={6}>Bạn sẽ học được gì?</Title>
            <ul>
              <li>Các kiến thức cơ bản, nền móng của ngành IT</li>
              <li>Các mô hình, kiến trúc cơ bản khi triển khai ứng dụng</li>
              <li>Các khái niệm, thuật ngữ cốt lõi khi triển khai ứng dụng</li>
              <li>Hiểu hơn về cách internet và máy vi tính hoạt động</li>
            </ul>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title="Video Giới Thiệu"
            style={{ marginBottom: "20px", borderRadius: "8px" }}
          >
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
              }}
            >
              <iframe
                src="https://player.vimeo.com/video/YOUR_VIDEO_ID" // Thay thế bằng ID video của bạn
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </Card>

          <Card
            title="Thông tin khóa học"
            style={{ marginBottom: "20px", borderRadius: "8px" }}
          >
            <p>
              <strong>Giá:</strong>{" "}
              {course.isFree ? "Miễn phí" : `${course.price} VND`}
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
          <Card
            title="Danh sách video"
            bordered={false}
            style={{ borderRadius: "8px" }}
          >
            {course.totalVideos > 0 ? (
              <ul>
                {course.videos.map((video, index) => (
                  <li key={index}>{video.title || "Video chưa có tiêu đề."}</li>
                ))}
              </ul>
            ) : (
              <div>
                <p>Video chưa được cập nhật.</p>
                <img
                  src={defaultImage}
                  alt="Ảnh minh họa"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CourseDetail;
