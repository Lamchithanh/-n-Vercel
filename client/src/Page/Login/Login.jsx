import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Form, Input, Button } from "antd";
import { login } from "../../../../server/src/Api/authAPI.js";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const response = await login(values.email, values.password);

      // Xử lý đăng nhập thành công
      toast.success("Đăng nhập thành công!");
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
    <div className="container">
      <Button
        className="btn-back"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Form className="form-signin" onFinish={handleSubmit}>
        <h2 className="title-signin">Đăng nhập vào tài khoản của bạn</h2>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button
            style={{ backgroundColor: "#4caf50", borderColor: "#4caf50" }}
            className="btn-signin"
            type="primary"
            htmlType="submit"
          >
            Đăng nhập
          </Button>
        </Form.Item>

        <p>
          <Link to="/register">Tạo tài khoản mới</Link> |{" "}
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </p>
      </Form>
      <ToastContainer />
    </div>
  );
};

export default Login;
