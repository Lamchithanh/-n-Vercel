import { Row, Col } from "antd";
import AOS from "aos";
import "aos/dist/aos.css";
import "./FeaturesWith.scss";
import { useEffect } from "react";

const FeaturesWith = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Khởi tạo AOS với thời gian hiệu ứng 1000ms
  }, []);
  const features = [
    {
      icon: "📍", // Icon placeholder, có thể thay thế bằng SVG
      title: "Pluralsight IQ",
      description:
        "Xác thực trình độ kỹ năng bằng các bài đánh giá kéo dài 5 phút hoặc ít hơn.",
    },
    {
      icon: "📡",
      title: "Channels",
      description:
        "Chọn lọc và chia sẻ nội dung Pluralsight để đạt được mục tiêu học tập của bạn nhanh hơn.",
    },
    {
      icon: "🖱️",
      title: "Hands-on learning",
      description:
        "Thực hành và áp dụng kiến ​​thức nhanh hơn vào các tình huống thực tế thông qua các dự án và khóa học tương tác.",
    },
    {
      icon: "🎥",
      title: "Thousands of courses",
      description:
        "Bắt kịp tốc độ thay đổi với các khóa học chuyên sâu do chuyên gia hướng dẫn.",
    },
  ];

  return (
    <div className="features-aos-section">
      <h2 className="section-title" data-aos="fade-up">
        Nền tảng Kỹ năng Công nghệ
      </h2>
      <Row justify="center" gutter={[32, 32]}>
        {features.map((feature, index) => (
          <Col
            key={index}
            xs={24}
            sm={12}
            md={6}
            className="feature-item"
            data-aos="fade-up"
            data-aos-delay={`${index * 100}`} // Hiệu ứng chậm dần cho từng mục
          >
            <div className="icon">{feature.icon}</div>
            <div className="title">{feature.title}</div>
            <div className="description">{feature.description}</div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FeaturesWith;
