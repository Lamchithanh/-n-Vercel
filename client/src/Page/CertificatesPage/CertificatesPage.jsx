import { useEffect, useState } from "react";
import { Typography, Spin, message, Button } from "antd";
import axios from "axios";
import "./CertificatesPage.scss";
import Loader from "../../context/Loader";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { LeftOutlined } from "@ant-design/icons";

const { Text } = Typography;

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate("/allcourses"); // Điều hướng đến trang đăng nhập
  };

  useEffect(() => {
    AOS.init({ duration: 1000 }); // Thiết lập thời gian hiệu ứng
  }, []);

  useEffect(() => {
    // Cuộn lên đầu trang mỗi khi URL thay đổi
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const fetchUserCertificates = async () => {
      try {
        // Lấy thông tin người dùng hiện tại từ localStorage
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        setCurrentUser(loggedInUser);

        // Lấy chứng chỉ của người dùng hiện tại
        const certificatesResponse = await axios.get(
          `http://localhost:9000/api/certificates?userId=${loggedInUser.id}`
        );
        const userCertificates = certificatesResponse.data.filter(
          (cert) => cert.user_id === loggedInUser.id
        );
        setCertificates(userCertificates);
      } catch (err) {
        // Thay đổi lỗi thành cảnh báo, dẫn đến đăng nhập khi người dùng nhấp vào
        message.warning({
          content: "Đăng nhập để sở hữu các chứng chỉ xuất sắc nhé!",
        });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCertificates();
  }, []);

  if (loading) {
    return (
      <div className="certificates-loading">
        <Spin size="large" />
        <p>
          <Loader />
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificates-error">
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <div className="certificates-scroll-view container">
      <Button
        className="btn-back"
        onClick={() => navigate(-1)}
        style={{ margin: 10 }}
      >
        <LeftOutlined />
      </Button>
      <div className="certificates-content-container">
        {certificates.length > 0 ? (
          certificates.map((cert) => (
            <form
              key={cert.id}
              className="form-certificates"
              data-aos="zoom-in"
            >
              <div className="certificates-header">
                <div className="certificates-course"></div>
                <div className="certificates-time"></div>
              </div>
              <div className="certificates-content">
                <div className="certificates-username">
                  {currentUser.username}
                </div>
              </div>
              <div className="certificates-footer">
                <div className="signature-section">
                  <div className="certificates-course">
                    <span className="value">{cert.course_title}</span>
                  </div>
                  <div className="signature">Đặng Lâm Chi Thành</div>
                </div>
                <div className="signature-section">
                  <span className="value">
                    {new Date(cert.issued_at).toLocaleDateString("vi-VN")}
                  </span>
                  <div className="signature">Võ Ngọc Quỳnh</div>
                </div>
              </div>
            </form>
          ))
        ) : (
          <div className="no-certificates">
            <p>Bạn chưa ghi danh hoàn thành khóa học nào! </p>
            <p>
              Hãy tham gia khóa học năng tầm cuộc sống củng cố kiến thức, kinh
              nghiệm và trãi nghiệm ngay nào.
            </p>
            <button onClick={handleJoinClick}> Tham gia </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
