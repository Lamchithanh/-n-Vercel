import "./Bannerone.scss";
import bannerone from "../../assets/img/BoostRiskSkills_Hero.webp";
import { useEffect } from "react";
import Aos from "aos";

const Banner = () => {
  useEffect(() => {
    Aos.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);
// cuộn trang đến phần tất cả khóa học
  const handleScrollToCourses = () => {
    const coursesSection = document.querySelector(".content_homepage");
    if (coursesSection) {
      coursesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="banner">
      <div className="banner_content" data-aos="fade-left">
        <p
          className="banner_subtitle"
          data-aos="fade-left"
          data-aos-delay="400"
        >
          Kiến thức là chìa khóa mở cánh cửa tương lai.
        </p>
        <h1 className="banner_title" data-aos="fade-left" data-aos-delay="600">
          Lập trình kỹ năng biến mơ hồ thành hiện thực, nơi logic gặp gỡ sáng
          tạo.
        </h1>
        <p
          className="banner_description"
          data-aos="fade-left"
          data-aos-delay="800"
        >
          Mã hóa là nghệ thuật tạo ra những kết nối, nơi mọi thứ có thể kết hợp
          và cùng nhau hoạt động.
        </p>
        <button
          className="banner_button"
          data-aos="fade-up"
          data-aos-delay="800"
          onClick={handleScrollToCourses}
        >
          LET'S GO
        </button>
      </div>
      <div className="banner_image" data-aos="fade-up" data-aos-delay="1000">
        <img src={bannerone} alt="Cybersecurity Banner" />
      </div>
    </div>
  );
};

export default Banner;
