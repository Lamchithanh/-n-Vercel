import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, notification } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import axios from "axios";
import PropTypes from "prop-types";

const CertificateNotification = ({ currentUser }) => {
  const [newCertificates, setNewCertificates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const navigate = useNavigate();

  // Hiển thị chứng chỉ tiếp theo
  const showNextCertificate = (cert) => {
    setCurrentCertificate(cert);
    setIsModalVisible(true);
  };

  // Thêm thông báo chứng chỉ mới
  const addToGeneralNotifications = (certificates) => {
    const existingNotifications = JSON.parse(
      localStorage.getItem("courseNotifications") || "[]"
    );
    const newNotifications = certificates.map((cert) => ({
      id: Date.now() + Math.random(),
      type: "certificate",
      courseId: cert.course_id,
      title: "Chứng chỉ mới",
      message: `Chúc mừng bạn đã nhận được chứng chỉ khóa học ${cert.course_title}`,
      timestamp: new Date().toISOString(),
      read: false,
      important: true,
    }));

    const updatedNotifications = [
      ...newNotifications,
      ...existingNotifications,
    ];
    localStorage.setItem(
      "courseNotifications",
      JSON.stringify(updatedNotifications)
    );
  };

  // Đóng modal và hiển thị chứng chỉ tiếp theo nếu có
  const handleModalClose = () => {
    setIsModalVisible(false);
    const remainingCerts = newCertificates.filter(
      (cert) => cert.id !== currentCertificate.id
    );
    if (remainingCerts.length > 0) {
      setTimeout(() => {
        showNextCertificate(remainingCerts[0]);
        setNewCertificates(remainingCerts);
      }, 500);
    }
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!currentUser?.id) return;
      try {
        const response = await axios.get(
          `http://localhost:9000/api/certificates?userId=${currentUser.id}`
        );
        const notifiedCertificates = JSON.parse(
          localStorage.getItem("notifiedCertificates") || "[]"
        );
        const newCerts = response.data.filter(
          (cert) => !notifiedCertificates.includes(cert.id)
        );

        // Nếu có chứng chỉ mới cho tài khoản hiện tại
        if (newCerts.length > 0) {
          setNewCertificates(newCerts);
          showNextCertificate(newCerts[0]);
          const updatedNotifiedCerts = [
            ...notifiedCertificates,
            ...newCerts.map((cert) => cert.id),
          ];
          localStorage.setItem(
            "notifiedCertificates",
            JSON.stringify(updatedNotifiedCerts)
          );

          // Chỉ thông báo khi chứng chỉ đã được cấp
          notification.success({
            message: "Chứng chỉ mới",
            description: "Bạn đã nhận được chứng chỉ mới. Kiểm tra ngay!",
            icon: <TrophyOutlined style={{ color: "#fadb14" }} />,
            duration: 5,
          });
          addToGeneralNotifications(newCerts);
        }
      } catch (error) {
        console.error("Error checking for new certificates:", error);
      }
    };

    fetchCertificates();
    const interval = setInterval(fetchCertificates, 300000);
    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <Modal
      title={
        <div style={{ textAlign: "center", color: "#fadb14" }}>
          <TrophyOutlined style={{ fontSize: 32, marginRight: 8 }} />
          Chúc mừng thành tích mới!
        </div>
      }
      open={isModalVisible}
      onCancel={handleModalClose}
      footer={[
        <Button
          key="close"
          type="primary"
          onClick={() => {
            handleModalClose();
            navigate("/certificates");
          }}
        >
          Xem chứng chỉ của tôi
        </Button>,
      ]}
      centered
      width={600}
    >
      {currentCertificate && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <h2>Chúc mừng {currentUser?.username}!</h2>
          <p style={{ fontSize: 18, margin: "20px 0" }}>
            Bạn đã hoàn thành xuất sắc khóa học:
          </p>
          <h3 style={{ color: "#1890ff" }}>
            {currentCertificate.course_title}
          </h3>
          <p style={{ margin: "20px 0" }}>
            Chứng chỉ đã được cấp ngày:{" "}
            {new Date(currentCertificate.issued_at).toLocaleDateString("vi-VN")}
          </p>
          <p>
            Hãy tiếp tục phát huy và khám phá thêm nhiều khóa học thú vị khác
            nhé!
          </p>
        </div>
      )}
    </Modal>
  );
};

CertificateNotification.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string,
  }),
};

export default CertificateNotification;
