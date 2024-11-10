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

const { Text } = Typography;

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const response = await login(values.email, values.password);

      // Xử lý đăng nhập thành công
      toast.success("Đăng nhập thành công!");
      localStorage.setItem("showSuccessToast", "true"); // Đặt biến trạng thái thông báo
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      // Chuyển hướng dựa vào role
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

      // Kiểm tra nếu là lỗi tài khoản bị khóa
      // Kiểm tra nếu là lỗi tài khoản bị khóa
      if (error.response?.status === 403 && error.response?.data?.lockInfo) {
        const { lockInfo } = error.response.data;

        // Format thời gian sang định dạng Việt Nam
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
            <h4 style={{ margin: "0 0 10px 0", color: "#e74c3c" }}>
              Tài khoản đã bị khóa
            </h4>
            <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
              <p style={{ margin: "5px 0" }}>
                <strong>Lý do:</strong> {lockInfo.reason}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Thời gian khóa:</strong>{" "}
                {formatDateTime(lockInfo.lockedAt)}
              </p>
              <p style={{ margin: "5px 0" }}>
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
            style: {
              minWidth: "320px",
              backgroundColor: "#fff",
              color: "#2c3e50",
            },
          }
        );
        return;
      }

      // Xử lý các lỗi khác
      const errorMessage =
        error.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.";
      toast.error(errorMessage);
    }
  };
  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        {/* Nút Quay lại */}
        <Button
          icon={<ArrowLeftOutlined />}
          type="link"
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            fontSize: "16px",
          }}
        >
          Quay lại
        </Button>

        {/* Card chứa form đăng nhập */}
        <Card
          style={{
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: "8px",
          }}
        >
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                <LoginOutlined style={{ marginRight: "8px" }} />
                Đăng nhập
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Đăng nhập vào tài khoản của bạn để tiếp tục
              </Text>
            </div>

            {/* Form Đăng nhập */}
            <Form
              name="login"
              onFinish={handleSubmit}
              size="large"
              layout="vertical"
            >
              {/* Trường email */}
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Nhập email"
                />
              </Form.Item>

              {/* Trường mật khẩu */}
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Nhập mật khẩu"
                />
              </Form.Item>

              {/* Nút Đăng nhập */}
              <Form.Item>
                <Button
                  htmlType="submit"
                  block
                  style={{
                    height: "40px",
                    backgroundColor: "rgb(76, 175, 80)",
                    color: "white",
                  }}
                >
                  <LoginOutlined /> Đăng nhập
                </Button>
              </Form.Item>

              {/* Các liên kết khác */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "16px",
                }}
              >
                <Button type="link" onClick={() => navigate("/register")}>
                  Tạo tài khoản mới
                </Button>
                <Button
                  type="link"
                  onClick={() => navigate("/forgot-password")}
                >
                  Quên mật khẩu?
                </Button>
              </div>
            </Form>
          </Space>
        </Card>
      </div>
    </>
  );
};
export default Login;
