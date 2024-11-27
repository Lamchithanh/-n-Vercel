import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Form, Input, Button, Select, Typography } from "antd";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  SwapOutlined,
  ArrowLeftOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  login,
  register,
  // updateFirstLogin,
} from "../../../../server/src/Api/authAPI";
import "./Login.scss";
import FirstLoginHandler from "./NewMemberWelcomeModal";

const { Text } = Typography;
const { Option } = Select;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: false });
  }, []);

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    let formattedEmail = values.email.trim();
    if (!formattedEmail.includes("@")) {
      formattedEmail += "@gmail.com";
    }

    setIsLoading(true);
    try {
      await register({
        username: values.username,
        email: formattedEmail,
        password: values.password,
        role: values.role || "student",
      });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      setIsLogin(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Đăng ký thất bại");
    }
    setIsLoading(false);
  };

  // const updateFirstLoginStatus = async (userId) => {
  //   try {
  //     await updateFirstLogin(userId);
  //     setShowFirstLoginModal(false);

  //     // Chuyển hướng sau khi cập nhật trạng thái first login
  //     navigateBasedOnRole(user);
  //   } catch (error) {
  //     console.error("Error updating first login status:", error);
  //     toast.error("Có lỗi xảy ra khi cập nhật trạng thái đăng nhập đầu tiên");
  //   }
  // };

  const handleLogin = async (values) => {
    setIsLoading(true);
    try {
      const response = await login(values.email, values.password);

      if (response && response.user && response.token) {
        // Chuyển đổi is_first_login từ số sang boolean
        if (response.user.is_first_login === 1) {
          response.user.is_first_login = true;
        } else if (response.user.is_first_login === 0) {
          response.user.is_first_login = false;
        }

        // Lưu thông tin vào localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);

        // Hiển thị modal cho các tài khoản first login
        setUser(response.user);

        // Chỉ hiển thị modal nếu là lần đăng nhập đầu tiên
        if (response.user.is_first_login === true) {
          setShowFirstLoginModal(true);
        }

        toast.success(`Chào mừng ${response.user.username || "bạn"}!`);

        // Chuyển hướng dựa trên vai trò nếu không phải first login
        if (response.user.is_first_login !== true) {
          navigateBasedOnRole(response.user);
        }
      } else {
        toast.error("Dữ liệu phản hồi không hợp lệ từ máy chủ.");
      }
    } catch (error) {
      // Phần xử lý lỗi giữ nguyên như ban đầu
      if (error.response?.status === 403 && error.response?.data?.lockInfo) {
        const { lockInfo } = error.response.data;
        const formatDateTime = (dateString) => {
          if (!dateString) return "Vĩnh viễn";
          return new Date(dateString).toLocaleString("vi-VN");
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
          { autoClose: 5000 }
        );
      } else {
        toast.error(error.response?.data?.error || "Đăng nhập thất bại");
      }
    }
    setIsLoading(false);
  };

  const navigateBasedOnRole = (user) => {
    if (user.role === "instructor") {
      navigate("/instructor");
    } else if (user.role === "student") {
      navigate("/");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="login-container">
      {showFirstLoginModal && user && (
        <FirstLoginHandler
          user={user}
          token={localStorage.getItem("token")}
          onUpdateFirstLogin={() => {
            setShowFirstLoginModal(false);
            navigateBasedOnRole(user);
          }}
        />
      )}
      <Button
        icon={<ArrowLeftOutlined />}
        className="back-button"
        onClick={() => navigate(-1)}
        data-aos="fade-right"
      >
        Quay lại
      </Button>

      <div className="login-card" data-aos="zoom-in">
        <div className="login-header">
          <h2 className="login-title">
            {isLogin ? (
              <>
                <LoginOutlined className="login-icon" /> Đăng nhập
              </>
            ) : (
              <>
                <UserAddOutlined className="login-icon" /> Đăng ký
              </>
            )}
          </h2>
          <Text className="login-subtitle">
            {isLogin ? "Chào mừng bạn trở lại!" : "Tạo tài khoản để bắt đầu"}
          </Text>
        </div>

        {isLogin ? (
          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            className="login-form"
            data-aos="fade-up"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="form-icon" />}
                placeholder="Email"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="form-icon" />}
                placeholder="Mật khẩu"
                className="login-input"
              />
            </Form.Item>

            <div className="login-links">
              <Button
                type="link"
                onClick={() => setIsLogin(false)}
                className="register-link"
              >
                Chưa có tài khoản?
              </Button>
              <Button
                type="link"
                onClick={() => navigate("/forgot-password")}
                className="forgot-password-link"
              >
                Quên mật khẩu?
              </Button>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="login-button"
                block
              >
                <LoginOutlined /> Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form
            name="register"
            onFinish={handleRegister}
            layout="vertical"
            className="login-form"
            data-aos="fade-up"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input
                prefix={<UserOutlined className="form-icon" />}
                placeholder="Tên người dùng"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="form-icon" />}
                placeholder="Email"
                className="login-input"
              />
            </Form.Item>

            <Form.Item name="role" initialValue="student">
              <Select className="login-input">
                <Option value="student">Học viên</Option>
                <Option value="instructor" disabled>
                  Giảng viên
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="form-icon" />}
                placeholder="Mật khẩu"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="form-icon" />}
                placeholder="Xác nhận mật khẩu"
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
                <UserAddOutlined /> Đăng ký
              </Button>
            </Form.Item>

            <div className="login-links">
              <Button
                type="link"
                onClick={() => setIsLogin(true)}
                className="register-link"
              >
                <SwapOutlined /> Đã có tài khoản? Đăng nhập
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default Login;
