import { useEffect, useState } from "react";
import {
  Layout,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Timeline,
  Spin,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  TrophyOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "./Introduce.module.scss";
import { useNavigate } from "react-router-dom";
import { fetchdashboardAPI } from "../../../../server/src/Api/IntroduceAPI";
import { getAuthHeader } from "../../../../server/src/Api/authAPI";
import CertificateNotification from "../CertificatesPage/CertificateNotification";

const { Content } = Layout;

const Introduce = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthHeader();
        const data = await fetchdashboardAPI(token);
        setDashboardData(data); // Update the data if present
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData(null); // Ensure value is null if an error occurs
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchData();
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleOnclick = () => {
    navigate("allcourses");
  };

  return (
    <Layout className={styles.layout}>
      <CertificateNotification
        currentUser={JSON.parse(localStorage.getItem("user"))}
      />
      <Content>
        <section className={styles.hero} id="home">
          <div className={styles.heroContent} data-aos="fade-up">
            <h1>Nền tảng học trực tuyến hàng đầu</h1>
            <p>
              Khám phá hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng
              đầu
            </p>
            <Button
              style={{ background: "#539B47" }}
              type="primary"
              size="large"
              onClick={handleOnclick}
            >
              Bắt đầu học ngay
            </Button>
          </div>
        </section>

        <section className={styles.stats}>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={6}>
              <Card data-aos="zoom-in">
                {loading ? (
                  <Spin size="small" />
                ) : (
                  <Statistic
                    title="Học viên"
                    value={dashboardData?.total_users || 0}
                    prefix={<TeamOutlined />}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card data-aos="zoom-in" data-aos-delay="100">
                {loading ? (
                  <Spin size="small" />
                ) : (
                  <Statistic
                    title="Khóa học"
                    value={dashboardData?.total_courses || 0}
                    prefix={<BookOutlined />}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card data-aos="zoom-in" data-aos-delay="200">
                {loading ? (
                  <Spin size="small" />
                ) : (
                  <Statistic
                    title="Chứng chỉ"
                    value={dashboardData?.total_certificates || 0}
                    prefix={<TrophyOutlined />}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </section>

        <section className={styles.features} id="features">
          <h2 data-aos="fade-up">Tại sao chọn chúng tôi?</h2>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className={styles.featureCard} data-aos="fade-right">
                <RocketOutlined className={styles.featureIcon} />
                <h3>Học linh hoạt</h3>
                <p>Học mọi lúc mọi nơi với nội dung được cá nhân hóa</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.featureCard} data-aos="fade-up">
                <TeamOutlined className={styles.featureIcon} />
                <h3>Cộng đồng hỗ trợ</h3>
                <p>Kết nối với giảng viên và học viên khác 24/7</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.featureCard} data-aos="fade-left">
                <TrophyOutlined className={styles.featureIcon} />
                <h3>Chứng chỉ công nhận</h3>
                <p>Nhận chứng chỉ có giá trị sau khi hoàn thành khóa học</p>
              </div>
            </Col>
          </Row>
        </section>

        <section className={styles.learningPath}>
          <h2 data-aos="fade-up">Lộ trình học tập</h2>
          <Timeline mode="alternate" className={styles.timeline}>
            <Timeline.Item data-aos="fade-right">
              <h3>Bắt đầu hành trình</h3>
              <p>Đăng ký tài khoản và khám phá khóa học phù hợp</p>
            </Timeline.Item>
            <Timeline.Item data-aos="fade-left">
              <h3>Học tập linh hoạt</h3>
              <p>Truy cập nội dung học tập mọi lúc mọi nơi</p>
            </Timeline.Item>
            <Timeline.Item data-aos="fade-right">
              <h3>Thực hành dự án</h3>
              <p>Áp dụng kiến thức vào các dự án thực tế</p>
            </Timeline.Item>
            <Timeline.Item data-aos="fade-left">
              <h3>Nhận chứng chỉ</h3>
              <p>Hoàn thành khóa học và nhận chứng chỉ</p>
            </Timeline.Item>
          </Timeline>
        </section>
      </Content>
    </Layout>
  );
};

export default Introduce;
