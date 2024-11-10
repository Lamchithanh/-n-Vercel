import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeftOutlined,
  LockOutlined,
  LoginOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Form, Input, Button, Card, Space, Typography } from "antd";
import { login } from "../../../../server/src/Api/authAPI.js";
import Title from "antd/es/skeleton/Title.js";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import "./Login.scss";

const { Text } = Typography;

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleSubmit = async (values) => {
    try {
      const response = await login(values.email, values.password);
      toast.success("Đăng nhập thành công!");
      localStorage.setItem("showSuccessToast", "true");
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      switch (response.user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "instructor":
          navigate("/instructor");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 403 && error.response?.data?.lockInfo) {
        const { lockInfo } = error.response.data;

        const formatDateTime = (dateString) => {
          if (!dateString) return "Vĩnh viễn";
          return new Date(dateString).toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        };

        toast.error(
          <div className="lock-notification">
            <h4 className="lock-title">Tài khoản đã bị khóa</h4>
            <div className="lock-content">
              <p>
                <strong>Lý do:</strong> {lockInfo.reason}
              </p>
              <p>
                <strong>Thời gian khóa:</strong>{" "}
                {formatDateTime(lockInfo.lockedAt)}
              </p>
              <p>
                <strong>Thời gian mở khóa:</strong>{" "}
                {formatDateTime(lockInfo.lockedUntil)}
              </p>
            </div>
          </div>,
          {
            autoClose: false,
            closeButton: true,
            closeOnClick: false,
            draggable: false,
            className: "lock-toast",
          }
        );
        return;
      }

      const errorMessage =
        error.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <Button
        icon={<ArrowLeftOutlined />}
        type="link"
        onClick={() => navigate(-1)}
        className="back-button"
        data-aos="fade-right"
      >
        Quay lại
      </Button>

      <Card className="login-card" data-aos="zoom-in">
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <div
            className="login-header"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            <Title level={2} className="login-title">
              <LoginOutlined className="login-icon" />
              Đăng nhập
            </Title>
            <Text type="secondary" className="login-subtitle">
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </Text>
          </div>

          <Form
            name="login"
            onFinish={handleSubmit}
            size="large"
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <Input
                prefix={<UserOutlined className="form-icon" />}
                placeholder="Nhập email"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <Input.Password
                prefix={<LockOutlined className="form-icon" />}
                placeholder="Nhập mật khẩu"
                className="login-input"
              />
            </Form.Item>

            <Form.Item data-aos="fade-up" data-aos-delay="500">
              <Button htmlType="submit" block className="login-button">
                <LoginOutlined /> Đăng nhập
              </Button>
            </Form.Item>

            <div
              className="login-links"
              data-aos="fade-up"
              data-aos-delay="600"
            >
              <Button
                type="link"
                onClick={() => navigate("/register")}
                className="register-link"
              >
                Tạo tài khoản mới
              </Button>
              <Button
                type="link"
                onClick={() => navigate("/forgot-password")}
                className="forgot-password-link"
              >
                Quên mật khẩu?
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
