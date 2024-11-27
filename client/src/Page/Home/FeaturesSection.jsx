import { useEffect } from "react";
import { Row, Col } from "antd";
import AOS from "aos";
import "aos/dist/aos.css"; // Import CSS của AOS
import "./FeaturesSection.scss";

const FeaturesSection = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Khởi tạo AOS với thời gian hiệu ứng 1000ms
  }, []);

  const features = [
    {
      icon: "⏰",
      title: "Học theo dòng thời gian của riêng bạn",
    },
    {
      icon: "✔️",
      title: "Làm chủ nghề của bạn",
    },
    {
      icon: "🎓",
      title: "Theo kịp xu hướng mới nổi",
    },
  ];

  return (
    <div className="features-section">
      <Row justify="center" gutter={[32, 32]}>
        {features.map((feature, index) => (
          <Col
            key={index}
            xs={24}
            sm={8}
            className="feature-item"
            data-aos="fade-up" // Thêm hiệu ứng AOS
          >
            <div className="icon">{feature.icon}</div>
            <div className="title">{feature.title}</div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FeaturesSection;
