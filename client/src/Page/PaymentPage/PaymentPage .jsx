import { Card, Button, Row, Col, Typography, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCourseById } from "../../../../server/src/Api/courseApi";
import defaultImage from "../../assets/img/sach.png";

const { Title, Text } = Typography;

const PaymentPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);
      } catch (error) {
        message.error("Không thể tải thông tin khóa học");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const handleConfirmPayment = () => {
    // Lưu trạng thái thanh toán vào localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      message.error("Vui lòng đăng nhập để thanh toán");
      return;
    }

    const paidCourses = JSON.parse(localStorage.getItem("paidCourses")) || {};
    if (!paidCourses[user.id]) {
      paidCourses[user.id] = [];
    }
    paidCourses[user.id].push(courseId);
    localStorage.setItem("paidCourses", JSON.stringify(paidCourses));

    message.success("Thanh toán thành công!");
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!course) {
    return <div>Không tìm thấy khóa học</div>;
  }

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>
        Quay lại
      </Button>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="Thông tin thanh toán" bordered={false}>
            <div style={{ padding: "20px" }}>
              <Title level={4}>Chi tiết đơn hàng</Title>
              <Row gutter={16} align="middle" style={{ marginBottom: "20px" }}>
                <Col span={8}>
                  <img
                    src={course.image || defaultImage}
                    alt={course.title}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Col>
                <Col span={16}>
                  <Title level={5}>{course.title}</Title>
                  <Text>{course.description}</Text>
                </Col>
              </Row>

              <div
                style={{ borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}
              >
                <Row justify="space-between" style={{ marginBottom: "10px" }}>
                  <Text strong>Giá khóa học:</Text>
                  <Text strong style={{ color: "#ff4d4f" }}>
                    {course.price} VND
                  </Text>
                </Row>
                <Row justify="space-between">
                  <Text strong>Tổng thanh toán:</Text>
                  <Text strong style={{ color: "#ff4d4f", fontSize: "18px" }}>
                    {course.price} VND
                  </Text>
                </Row>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Xác nhận thanh toán" bordered={false}>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ color: "#ff4d4f" }}>
                {course.price} VND
              </Title>
              <Button
                type="primary"
                size="large"
                block
                onClick={handleConfirmPayment}
                style={{ marginTop: "20px" }}
              >
                Xác nhận thanh toán
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentPage;
