import { useEffect, useState } from "react";
import { Typography, Spin, message, Button } from "antd";
import axios from "axios";
import "./CertificatesPage.scss";
import Loader from "../../context/Loader";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleJoinClick = () => {
    navigate("/login"); // Điều hướng đến trang đăng nhập
  };

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
    <div className="certificates-scroll-view">
      <div className="certificates-content-container">
        {certificates.length > 0 ? (
          certificates.map((cert) => (
            <form key={cert.id} className="form-certificates">
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
              Hãy tham gia khóa học năng tầm cuộc sống cũng cố kiến thức, kinh
              nghiệm và trãi nghiệm ngay nào.
            </p>
            <Button
              onClick={handleJoinClick}
              style={{ border: "1px #11bd23 solid" }}
            >
              {" "}
              Tham gia{" "}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
