import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./AIFutureTechArticle.scss";
import { Bot, Brain, Globe, BookOpenText, Cpu, Target } from "lucide-react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const AIFutureTechArticle = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const sections = [
    {
      Icon: Bot,
      title: "Sự Chuyển Đổi Công Nghệ",
      color: "#EE5928",
      content:
        "Trong 10 năm tới, AI sẽ trở thành xương sống của các hệ thống công nghệ thông tin. Các giải pháp học máy và trí tuệ nhân tạo sẽ tự động hóa hoàn toàn các quy trình phức tạp, từ phát triển phần mềm đến phân tích dữ liệu và ra quyết định chiến lược.",
    },
    {
      Icon: Brain,
      title: "Trí Tuệ Nhân Tạo Nâng Cao",
      color: "#E7005E",
      content:
        "Các mô hình AI thế hệ mới sẽ có khả năng nhận thức và sáng tạo vượt trội, giải quyết các vấn đề phức tạp với độ chính xác và hiệu quả chưa từng có. Con người và máy móc sẽ hợp tác một cách liền mạch trong các dự án công nghệ.",
    },
    {
      Icon: Globe,
      title: "Kết Nối Toàn Cầu",
      color: "#242145",
      content:
        "Công nghệ AI sẽ xóa nhòa hoàn toàn ranh giới địa lý trong phát triển phần mềm. Các nhóm toàn cầu có thể cộng tác dễ dàng thông qua các nền tảng AI hỗ trợ dịch thuật và giao tiếp thời gian thực.",
    },
    {
      Icon: BookOpenText,
      title: "Đào Tạo và Phát Triển",
      color: "#EE5928",
      content:
        "Giáo dục CNTT sẽ chuyển đổi hoàn toàn, tập trung vào việc phát triển kỹ năng làm việc hiệu quả với hệ thống AI. Các chương trình đào tạo mới sẽ được thiết kế để tối đa hóa năng lực con người kết hợp với trí tuệ nhân tạo.",
    },
    {
      Icon: Cpu,
      title: "Công Nghệ Sinh Trắc Học",
      color: "#E7005E",
      content:
        "Các hệ thống AI sẽ tích hợp sâu rộng các công nghệ sinh trắc học, mang lại trải nghiệm bảo mật và cá nhân hóa chưa từng có. Nhận dạng khuôn mặt, giọng nói và cử chỉ sẽ trở thành tiêu chuẩn mới.",
    },
    {
      Icon: Target,
      title: "Dự Báo và Phân Tích",
      color: "#242145",
      content:
        "Các thuật toán AI tiên tiến sẽ cung cấp khả năng dự báo và phân tích dữ liệu với độ chính xác phi thường. Từ dự đoán xu hướng kinh doanh đến phân tích rủi ro, AI sẽ trở thành trợ thủ đắc lực của các nhà quản lý.",
    },
  ];

  return (
    <div className="ai-future-tech-article">
      <div className="container">
        <header className="headerr" data-aos="fade-down">
          <h1 className="header__title">Tương Lai Công Nghệ Thông Tin</h1>
          <h2 className="header__subtitle">Kỷ Nguyên Trí Tuệ Nhân Tạo</h2>
          <Button
            icon={<ArrowLeftOutlined />}
            className="back-button"
            onClick={() => navigate(-1)}
            data-aos="fade-right"
          ></Button>
        </header>

        <article className="article">
          {sections.map((section, index) => (
            <div
              key={section.title}
              data-aos={`fade-${index % 2 === 0 ? "right" : "left"}`}
              className="article__section"
            >
              <div className="article__section-header">
                <section.Icon
                  color={section.color}
                  className="article__section-icon"
                />
                <h3 className="article__section-title">{section.title}</h3>
              </div>
              <p className="article__section-content">{section.content}</p>
            </div>
          ))}
        </article>

        <footer className="footer" data-aos="fade-up">
          <blockquote className="footer__quote">
            "Tương lai của công nghệ không phải là AI thay thế con người, mà là
            AI trao quyền cho con người phát triển phi thường."
          </blockquote>
        </footer>
      </div>
    </div>
  );
};

export default AIFutureTechArticle;
