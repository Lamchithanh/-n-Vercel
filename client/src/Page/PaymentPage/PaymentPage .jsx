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
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const PaymentPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);

        // Fetch modules
        const modulesData = await fetchModulesAPI(courseId);
        setModules(modulesData);

        // Fetch lessons for each module and calculate totals
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

  const handleConfirmPayment = () => {
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
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}p`;
  };

  if (loading) return <Loader />;
  if (!course) return <div>Không tìm thấy khóa học</div>;

  return (
    <div
      className="container"
      style={{
        padding: "40px 20px",
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

      <Row gutter={24}>
        <Col span={16}>
          <Card
            title={<Title level={3}>Thông tin thanh toán</Title>}
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ padding: "20px" }}>
              <Row gutter={24} align="middle" style={{ marginBottom: "30px" }}>
                <Col span={8}>
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
                <Col span={16}>
                  <Title
                    level={4}
                    style={{ marginBottom: "16px", color: "#1890ff" }}
                  >
                    {course.title}
                  </Title>
                  <Text
                    style={{
                      fontSize: "16px",
                      color: "#595959",
                      display: "block",
                      marginBottom: "20px",
                    }}
                  >
                    {course.description}
                  </Text>

                  <Row gutter={24}>
                    <Col span={8}>
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
                    <Col span={8}>
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
                    <Col span={8}>
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
                  <Text strong style={{ fontSize: "16px" }}>
                    Giá khóa học:
                  </Text>
                  <Text strong style={{ color: "#ff4d4f", fontSize: "16px" }}>
                    {course.price} VND
                  </Text>
                </Row>
                <Row justify="space-between">
                  <Text strong style={{ fontSize: "18px" }}>
                    Tổng thanh toán:
                  </Text>
                  <Text strong style={{ color: "#ff4d4f", fontSize: "24px" }}>
                    {course.price} VND
                  </Text>
                </Row>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title={<Title level={4}>Xác nhận thanh toán</Title>}
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              position: "sticky",
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

              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>Truy cập không giới hạn</Text>
                </div>
                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>Chứng chỉ hoàn thành</Text>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text>Hỗ trợ trọn đời</Text>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleConfirmPayment}
                style={{
                  height: "50px",
                  fontSize: "18px",
                  borderRadius: "8px",
                  background: "#ff4d4f",
                  border: "none",
                }}
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
