import "./Bannertwo.scss";
import bannertwo from "../../assets/img/browse-software-developer.webp";
import { useEffect } from "react";
import Aos from "aos";
const Bannertwo = () => {
  useEffect(() => {
    Aos.init({
      duration: 1000, // Thời gian hiệu ứng
      easing: "ease-in-out", // Phương thức easing
      once: true, // Chỉ chạy hiệu ứng một lần khi cuộn
    });
  }, []);

  return (
    <div className="bannertwo">
      <div className="bannertwo_content" data-aos="fade-up">
        <p
          className="bannertwo_subtitle"
          data-aos="fade-up"
          data-aos-delay="200"
        ></p>
        <h1 className="bannertwo_title" data-aos="fade-up" data-aos-delay="400">
          Phát triển kỹ năng phát triển phần mềm của bạn
        </h1>
        <p
          className="bannertwo_description"
          data-aos="fade-up"
          data-aos-delay="600"
        >
          Nâng cao kỹ năng lập trình viên của bạn lên một tầm cao mới với các
          khóa học về các ngôn ngữ lập trình, công cụ dành cho nhà phát triển,
          phương pháp thực hành phần mềm và nền tảng phát triển ứng dụng phổ
          biến nhất. Có được sự hiểu biết sâu sắc về cách xây dựng, triển khai,
          bảo mật và mở rộng mọi thứ từ ứng dụng web đến ứng dụng di động bằng
          C#, Java, Angular, JavaScript, v.v. Luôn cập nhật về bối cảnh luôn
          thay đổi của các công cụ và kỹ thuật phát triển phần mềm mới nổi.
        </p>
      </div>
      <div className="bannertwo_image" data-aos="fade-up" data-aos-delay="1000">
        <img src={bannertwo} alt="Cybersecurity Banner" />
      </div>
    </div>
  );
};

export default Bannertwo;
