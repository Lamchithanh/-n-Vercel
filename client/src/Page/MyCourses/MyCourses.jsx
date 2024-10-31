import { useState, useEffect } from "react";
import { Card, Row, Col } from "antd";
import { getEnrolledCoursesAPI } from "../../../../server/src/api.js";
import defaultImage from "../../assets/img/sach.png";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMyCourses = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const enrollments = await getEnrolledCoursesAPI(userId);
        setCourses(enrollments.map((enrollment) => enrollment.course));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMyCourses();
  }, []);

  return (
    <div>
      <h2>Khóa học của tôi</h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : courses.length > 0 ? (
        <Row gutter={[16, 16]}>
          {courses.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
              <Card
                hoverable
                cover={
                  <img alt={course.title} src={course.image || defaultImage} />
                }
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <Card.Meta
                  title={course.title}
                  description={course.description}
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>Bạn chưa đăng ký khóa học nào.</p>
      )}
    </div>
  );
};

export default MyCourses;
