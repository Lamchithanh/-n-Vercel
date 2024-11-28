import { useState, useEffect } from "react";
import { ToTopOutlined } from "@ant-design/icons";
import "./BackToTop.scss"; // Import file SCSS cho styling

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Khi người dùng cuộn trang, kiểm tra vị trí và cập nhật trạng thái của nút
    const handleScroll = () => {
      if (window.scrollY > 2000) {
        setIsVisible(true); // Hiển thị nút khi cuộn xuống dưới 200px
      } else {
        setIsVisible(false); // Ẩn nút khi cuộn lên trên
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Cuộn trang một cách mượt mà
    });
  };

  return (
    <div
      className={`back-to-top ${isVisible ? "visible" : ""}`}
      onClick={handleBackToTop}
    >
      {isVisible && (
        <button shape="circle" size="large" className="back-to-top-btn">
          <ToTopOutlined style={{ fontWeight: "800", fontSize: 18 }} />
        </button>
      )}
    </div>
  );
};

export default BackToTop;
