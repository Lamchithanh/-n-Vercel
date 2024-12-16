import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Form, Input, Button, Typography } from "antd";
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
  googleLogin,
} from "../../../../server/src/Api/authAPI";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.scss";

const { Text } = Typography;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  // const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [token, setToken] = useState(null);

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
    formattedEmail = removeVietnameseTones(formattedEmail); // Xử lý bỏ dấu

    console.log("Email sau khi bỏ dấu: ", formattedEmail); // Kiểm tra email sau khi bỏ dấu

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

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const removeVietnameseTones = (str) => {
    const vietnameseTonesMap = {
      a: /á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g,
      e: /é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g,
      i: /í|ì|ỉ|ĩ|ị/g,
      o: /ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g,
      u: /ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g,
      y: /ý|ỳ|ỷ|ỹ|ỵ/g,
      d: /đ/g,
    };

    for (let letter in vietnameseTonesMap) {
      const regex = vietnameseTonesMap[letter];
      str = str.replace(regex, letter);
    }
    return str;
  };

  const handleLogin = async (values) => {
    setIsLoading(true);
    let formattedEmail = values.email.trim();
    formattedEmail = removeVietnameseTones(formattedEmail); // Xử lý bỏ dấu

    console.log("Email sau khi bỏ dấu: ", formattedEmail); // Kiểm tra email sau khi bỏ dấu

    try {
      const response = await login(formattedEmail, values.password);

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

        setUser(response.user);

        toast.success(`Chào mừng ${response.user.username || "bạn"}!`);

        // Luôn chuyển hướng ngay sau khi đăng nhập
        navigateBasedOnRole(response.user);
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

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await googleLogin(credentialResponse);
      toast.success("Đăng nhập Google thành công!");

      // Chuyển đổi is_first_login từ số sang boolean (nếu cần)
      if (response.user.is_first_login === 1) {
        response.user.is_first_login = true;
      } else if (response.user.is_first_login === 0) {
        response.user.is_first_login = false;
      }

      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      // Sử dụng hàm navigateBasedOnRole để xử lý điều hướng giống như đăng nhập thường
      navigateBasedOnRole(response.user);
    } catch (error) {
      toast.error("Đăng nhập Google thất bại. Vui lòng thử lại.");
      console.error("Google Login Error:", error);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Đăng nhập Google thất bại.");
  };

  const navigateBasedOnRole = (user) => {
    if (user.is_first_login === false) {
      navigate("/allcourses");
    } else if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "student") {
      navigate("/");
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card" data-aos="zoom-in">
          {" "}
          <Button
            icon={<ArrowLeftOutlined />}
            className="back-button"
            onClick={() => navigate(-1)}
            data-aos="fade-right"
          ></Button>
          <div className="login-header">
            {" "}
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
                  htmlType="submit"
                  loading={isLoading}
                  className="login-button"
                  block
                >
                  <LoginOutlined /> Đăng nhập
                </Button>
              </Form.Item>

              {isLogin && (
                <div className="google-login-container">
                  <div className="divider">
                    <span className="divider-text">Hoặc</span>
                  </div>

                  <div className="google-login-wrapper">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={handleGoogleLoginError}
                      type="standard"
                      size="large"
                      text="signin_with"
                      logo_alignment="center"
                      width="350"
                      className="custom-google-login"
                    />
                  </div>
                </div>
              )}
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
                <Input
                  className="login-input"
                  value="Học viên"
                  readOnly
                  style={{ background: "none", cursor: "not-allowed" }}
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
    </>
  );
};

export default Login;
