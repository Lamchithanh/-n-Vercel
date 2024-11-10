import { useState, useEffect } from "react";
import { Button } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import "./BackToTop.scss"; // Import file SCSS cho styling

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Khi người dùng cuộn trang, kiểm tra vị trí và cập nhật trạng thái của nút
    const handleScroll = () => {
      if (window.scrollY > 200) {
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
        <Button
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined />}
          size="large"
          className="back-to-top-btn"
        />
      )}
    </div>
  );
};

export default BackToTop;
