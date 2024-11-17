import { Card, Button, Row, Col, Typography, message, Divider } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCourseById } from "../../../../server/src/Api/courseApi";
import { fetchModulesAPI } from "../../../../server/src/Api/moduleApi";
import { fetchLessonsAPI } from "../../../../server/src/Api/lessonApi";
import defaultImage from "../../assets/img/sach.png";
import Loader from "../../context/Loader";
import {
  ClockCircleOutlined,
  BookOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
// import PaymentMethodSelector from "./PaymentMethodSelector";
import { useMediaQuery } from "react-responsive";
import PaymentMethodSelector from "./PaymentMethodSelector";

const { Title, Text } = Typography;

const PaymentPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);

        const modulesData = await fetchModulesAPI(courseId);
        setModules(modulesData);

        let lessonCount = 0;
        let duration = 0;

        for (const module of modulesData) {
          const lessonsData = await fetchLessonsAPI(module.id);
          lessonCount += lessonsData.length;
          duration += lessonsData.reduce(
            (total, lesson) => total + (lesson.duration || 0),
            0
          );
        }

        setTotalLessons(lessonCount);
        setTotalDuration(duration);
      } catch (error) {
        message.error("Không thể tải thông tin khóa học");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const validateSelection = () => {
    if (!paymentMethod) {
      message.error("Vui lòng chọn phương thức thanh toán!");
      return false;
    }
    return true;
  };

  const handleConfirmPayment = () => {
    if (!validateSelection()) {
      return;
    }

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

  const convertMinutesToHMS = (totalMinutes) => {
    if (!totalMinutes) return "0h 0p";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h${minutes}p`;
  };

  if (loading) return <Loader />;
  if (!course) return <div>Không tìm thấy khóa học</div>;

  const getResponsiveLayout = () => {
    if (isMobile) {
      return { mainCol: 24, sideCol: 24, imageCol: 24, infoCol: 24 };
    }
    if (isTablet) {
      return { mainCol: 16, sideCol: 8, imageCol: 12, infoCol: 12 };
    }
    return { mainCol: 16, sideCol: 8, imageCol: 8, infoCol: 16 };
  };

  const layout = getResponsiveLayout();

  return (
    <div
      className="container"
      style={{
        padding: isMobile ? "20px 10px" : "40px 20px",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "20px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        ← Quay lại
      </Button>

      <Row gutter={[24, 24]}>
        <Col span={layout.mainCol}>
          <Card
            title={
              <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
                Thông tin thanh toán
              </Title>
            }
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ padding: isMobile ? "10px" : "20px" }}>
              <Row
                gutter={[24, 24]}
                align="middle"
                style={{ marginBottom: "30px" }}
              >
                <Col span={layout.imageCol}>
                  <img
                    src={course.image || defaultImage}
                    alt={course.title}
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </Col>
                <Col span={layout.infoCol}>
                  <Title
                    level={4}
                    style={{ marginBottom: "16px", color: "#1890ff" }}
                  >
                    {course.title}
                  </Title>
                  <Text
                    style={{
                      fontSize: isMobile ? "14px" : "16px",
                      color: "#595959",
                      display: "block",
                      marginBottom: "20px",
                    }}
                  >
                    {course.description}
                  </Text>

                  <Row gutter={[12, 12]}>
                    <Col span={isMobile ? 24 : 8}>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "12px",
                          background: "#f0f7ff",
                          borderRadius: "8px",
                        }}
                      >
                        <BookOutlined
                          style={{
                            fontSize: "24px",
                            color: "#1890ff",
                            marginBottom: "8px",
                          }}
                        />
                        <div style={{ fontWeight: "bold" }}>
                          {modules.length} chương
                        </div>
                      </div>
                    </Col>
                    <Col span={isMobile ? 24 : 8}>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "12px",
                          background: "#f6ffed",
                          borderRadius: "8px",
                        }}
                      >
                        <VideoCameraOutlined
                          style={{
                            fontSize: "24px",
                            color: "#52c41a",
                            marginBottom: "8px",
                          }}
                        />
                        <div style={{ fontWeight: "bold" }}>
                          {totalLessons} bài học
                        </div>
                      </div>
                    </Col>
                    <Col span={isMobile ? 24 : 8}>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "12px",
                          background: "#fff7e6",
                          borderRadius: "8px",
                        }}
                      >
                        <ClockCircleOutlined
                          style={{
                            fontSize: "24px",
                            color: "#fa8c16",
                            marginBottom: "8px",
                          }}
                        />
                        <div style={{ fontWeight: "bold" }}>
                          {convertMinutesToHMS(totalDuration)}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Divider style={{ margin: "24px 0" }} />

              <div
                style={{
                  background: "#fafafa",
                  padding: "20px",
                  borderRadius: "8px",
                }}
              >
                <Row justify="space-between" style={{ marginBottom: "12px" }}>
                  <Text strong style={{ fontSize: isMobile ? "14px" : "16px" }}>
                    Giá khóa học:
                  </Text>
                  <Text
                    strong
                    style={{
                      color: "#ff4d4f",
                      fontSize: isMobile ? "14px" : "16px",
                    }}
                  >
                    {course.price} VND
                  </Text>
                </Row>
                <Row justify="space-between">
                  <Text strong style={{ fontSize: isMobile ? "16px" : "18px" }}>
                    Tổng thanh toán:
                  </Text>
                  <Text
                    strong
                    style={{
                      color: "#ff4d4f",
                      fontSize: isMobile ? "20px" : "24px",
                    }}
                  >
                    {course.price} VND
                  </Text>
                </Row>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={layout.sideCol}>
          <Card
            title={<Title level={4}>Xác nhận thanh toán</Title>}
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              position: isMobile ? "relative" : "sticky",
              top: "20px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Title
                level={2}
                style={{ color: "#ff4d4f", marginBottom: "24px" }}
              >
                {course.price} VND
              </Title>

              <PaymentMethodSelector
                onMethodSelect={handlePaymentMethodSelect}
              />

              <Button
                type="primary"
                size="large"
                block
                onClick={handleConfirmPayment}
                style={{
                  borderRadius: "8px",
                  background: "#52c41a",
                  marginTop: "20px",
                }}
              >
                Thanh toán
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentPage;
