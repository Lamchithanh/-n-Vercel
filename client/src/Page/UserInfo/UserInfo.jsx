import { useEffect, useState } from "react";
import { Card, Alert, Button, Avatar, Typography, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchUserProfile } from "../../../../server/src/Api/authAPI";
import Loader from "../../context/Loader";
import avatarDefault from "../../assets/img/avarta.png";
import banner from "../../assets/img/BoostRiskSkills_Hero.webp";
import "./UserInfo.scss";
import PropTypes from "prop-types";
import { LeftOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const CoursePreviewCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      className={`card-container ${
        course.level === "Intermediate" ? "intermediate" : ""
      }`}
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="card-image-container">
        <img src={course.image || "/placeholder.png"} alt={course.title} />
      </div>
      <div className="card-body">
        <Title level={4} className="course-title">
          {course.title}
        </Title>
        <Paragraph className="course-description">
          {course.description}
        </Paragraph>
        <Paragraph className="course-level">Cấp độ: {course.level}</Paragraph>
      </div>
    </Card>
  );
};

CoursePreviewCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    level: PropTypes.string.isRequired,
    shortTitle: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
};

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserInfoAndCourses = async () => {
      try {
        // Fetch user profile
        const userData = await fetchUserProfile();
        setUser(userData);

        // Fetch user courses
        const coursesResponse = await axios.get(
          `http://localhost:9000/api/my-courses/${userData.id}`
        );
        setCourses(coursesResponse.data);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setError(error.message || "Không thể tải thông tin người dùng");
        }
        setLoading(false);
      }
    };
    getUserInfoAndCourses();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date || date === "Invalid Date") {
      return "Không rõ";
    }
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <p>
        <Loader />
      </p>
    );
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  if (!user) {
    return (
      <Alert
        message="Thông báo"
        description="Không tìm thấy thông tin người dùng. Vui lòng kiểm tra lại kết nối hoặc liên hệ hỗ trợ."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="container form_infouser">
      <Button
        className="btn-back"
        onClick={() => navigate(-1)}
        style={{ margin: 10 }}
      >
        <LeftOutlined />
      </Button>
      <Card style={{ borderRadius: 8, overflow: "hidden", margin: 30 }}>
        {/* Header với hình nền */}
        <div
          className="background_avatar"
          style={{
            height: "300px",
            position: "relative",
          }}
        >
          <Avatar
            size={100}
            src={user.avatar || avatarDefault}
            style={{
              position: "absolute",
              bottom: -50,
              left: 20,
              border: "4px solid white",
            }}
          />
          <img
            className="background_avatar_img"
            src={banner}
            alt="Cybersecurity Banner"
          />
        </div>

        {/* Phần thông tin chính */}
        <div style={{ marginTop: 60, padding: "0 20px" }}>
          <Title level={3}>
            <h2 style={{ textAlign: "left" }}>{user.username}</h2>
          </Title>
          <Paragraph>
            <p className="date_user user_role">
              {user.role === "admin"
                ? "Quản trị viên"
                : user.role === "instructor"
                ? "Giảng viên"
                : "Học viên"}{" "}
            </p>
            <p className="date_user">Gia nhập: {formatDate(user.created_at)}</p>
          </Paragraph>
        </div>

        {courses.length > 0 && (
          <div style={{ padding: "0 20px", marginBottom: "20px" }}>
            <Paragraph className="date_user">
              Tổng số khóa học: {courses.length}
              <Button type="link" onClick={() => navigate("/my-courses")}>
                Xem tất cả
              </Button>
            </Paragraph>
          </div>
        )}

        {/* Các khóa học đã tham gia */}
        {courses.length > 0 ? (
          <Row
            gutter={[16, 16]}
            style={{ margin: "20px 0", padding: "0 20px" }}
          >
            {courses.slice(0, 3).map((course) => (
              <Col key={course.id} span={8}>
                <CoursePreviewCard course={course} />
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <Paragraph>Bạn chưa đăng ký khóa học nào</Paragraph>
            <Button type="primary" onClick={() => navigate("/allcourses")}>
              Khám phá khóa học
            </Button>
          </div>
        )}

        {/* Hiển thị tổng số khóa học */}

        {/* Các nút chức năng */}
        <Row justify="start" style={{ padding: "0 20px" }}>
          <Button type="default" onClick={() => navigate("/change-password")}>
            Đổi mật khẩu
          </Button>
          <Button
            type="default"
            style={{ marginLeft: 8 }}
            onClick={() => navigate("/account-settings")}
          >
            Cài đặt tài khoản
          </Button>
        </Row>
      </Card>
    </div>
  );
};

export default UserInfo;
