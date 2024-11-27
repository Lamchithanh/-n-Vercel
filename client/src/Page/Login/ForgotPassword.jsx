import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography } from "antd";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  MailOutlined,
  ArrowLeftOutlined,
  LockOutlined,
} from "@ant-design/icons";
import "./Login.scss"; // Sử dụng lại stylesheet của login

const { Text } = Typography;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: false });
  }, []);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:9000/api/forgot-password", {
        email: values.email,
      });
      toast.success(
        "Nếu tài khoản với email đó tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu."
      );
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card" data-aos="zoom-in">
        <Button
          icon={<ArrowLeftOutlined />}
          className="back-button"
          onClick={() => navigate(-1)}
          data-aos="fade-right"
        ></Button>
        <div className="login-header">
          <h2 className="login-title">
            <LockOutlined className="login-icon" /> Quên Mật Khẩu
          </h2>
          <Text className="login-subtitle">
            Nhập email để khôi phục mật khẩu
          </Text>
        </div>

        <Form
          name="forgot-password"
          onFinish={handleSubmit}
          layout="vertical"
          className="login-form"
          data-aos="fade-up"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="form-icon" />}
              placeholder="Nhập địa chỉ email của bạn"
              className="login-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="login-button"
              block
            >
              Đặt lại Mật Khẩu
            </Button>
          </Form.Item>

          <div className="login-links">
            <Button
              type="link"
              onClick={() => navigate("/login")}
              className="register-link"
            >
              Nhớ mật khẩu? Đăng nhập
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
