import { useState, useEffect } from "react";
import { Modal, Button, Typography, Alert, message } from "antd";
import { GiftOutlined, HeartOutlined, StarOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import axios from "axios";
import { API_URL } from "../../../../server/src/config/config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const FirstLoginHandler = ({
  user,
  token,
  onUpdateFirstLogin,
  setUser: setUserProp,
}) => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCouponClaimed, setIsCouponClaimed] = useState(false);
  const [coupon, setCoupon] = useState(null); // Lưu thông tin mã giảm giá

  useEffect(() => {
    const isFirstLogin =
      user.is_first_login === 1 || user.is_first_login === true;

    if (!isFirstLogin) {
      navigate("/");
      return;
    }

    setIsModalVisible(true);
    const fetchRandomCoupon = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9000/api/users/coupons/random"
        );
        console.log("Mã giảm giá ngẫu nhiên:", response.data);
        setCoupon(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy mã giảm giá:", error);
        message.error("Lỗi khi lấy mã giảm giá");
      }
    };

    fetchRandomCoupon();
  }, [token, user, navigate]);

  const handleClaimCoupon = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/mycoupons/claim`,
        {
          user_id: user.id,
          coupon_id: coupon?.id,
          course_id: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.message) {
        message.success(response.data.message);
        setIsCouponClaimed(true);

        // Close the modal and navigate after 1 second
        setTimeout(() => {
          setIsModalVisible(false);
          navigate("/");
        }, 1000);
      } else {
        message.error("Lỗi khi nhận mã giảm giá.");
      }
    } catch (error) {
      console.error("Error claiming coupon:", error);
      message.error("Không thể nhận mã giảm giá.");
    }
  };

  const handleClose = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/update-first-login`,
        { userId: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update local storage to reflect the new first login status
        const storedUser = JSON.parse(localStorage.getItem("user"));
        storedUser.is_first_login = false;
        localStorage.setItem("user", JSON.stringify(storedUser));

        // Update the user state using the prop
        setUserProp((prevUser) => ({ ...prevUser, is_first_login: false }));

        onUpdateFirstLogin && onUpdateFirstLogin();
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Update first login error:", error);
      toast.error("Không thể cập nhật trạng thái đăng nhập");
    }
  };

  return (
    <Modal
      centered
      width={500}
      title={null}
      open={isModalVisible}
      onCancel={handleClose}
      footer={null}
      bodyStyle={{
        padding: "30px",
        backgroundColor: "#f0f4ff",
        borderRadius: "20px",
        textAlign: "center",
      }}
      style={{
        overflow: "hidden",
        borderRadius: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
            borderRadius: "50%",
            width: "100px",
            height: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 10px 20px rgba(37, 117, 252, 0.3)",
          }}
        >
          <GiftOutlined
            style={{
              color: "white",
              fontSize: "48px",
            }}
          />
        </div>

        <Typography.Title
          level={2}
          style={{
            color: "#2575fc",
            marginBottom: 0,
            textAlign: "center",
          }}
        >
          Chào Mừng {user.username}!
        </Typography.Title>

        <Typography.Paragraph
          style={{
            color: "#5a6b7c",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          <HeartOutlined style={{ color: "#ff4d4f", marginRight: "8px" }} />
          Chúc mừng bạn đã gia nhập cộng đồng của chúng tôi! Để chào đón bạn,
          chúng tôi có một mã giảm giá đặc biệt.
        </Typography.Paragraph>

        {coupon && (
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography.Text
              strong
              style={{
                fontSize: "20px",
                color: "#2575fc",
                letterSpacing: "2px",
              }}
            >
              {coupon.code}
            </Typography.Text>

            <Button
              type="primary"
              onClick={handleClaimCoupon}
              disabled={isCouponClaimed}
            >
              {isCouponClaimed ? "Đã Nhận" : "Nhận"}
            </Button>
          </div>
        )}

        {isCouponClaimed && (
          <Alert
            message="Bạn đã nhận mã giảm giá thành công!"
            type="success"
            showIcon
            style={{ width: "100%" }}
          />
        )}

        <Typography.Paragraph
          type="secondary"
          style={{
            fontSize: "14px",
            textAlign: "center",
            color: "#8c98a4",
          }}
        >
          <StarOutlined style={{ color: "#fadb14", marginRight: "8px" }} />
          Áp dụng ngay để nhận ưu đãi giảm giá đặc biệt cho lần đầu tiên.
        </Typography.Paragraph>
      </div>
    </Modal>
  );
};

FirstLoginHandler.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    is_first_login: PropTypes.bool.isRequired,
  }).isRequired,
  token: PropTypes.string.isRequired,
  onUpdateFirstLogin: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
};

export default FirstLoginHandler;
