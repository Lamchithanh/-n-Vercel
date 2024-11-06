import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Form, Input, Button } from "antd";
import { login } from "../../../../server/src/Api/authAPI.js";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const response = await login(values.email, values.password);

      if (response.error === "Tài khoản bị khóa" && response.lockInfo) {
        // Hiển thị thông tin khóa tài khoản
        const lockUntilDate = response.lockInfo.lockedUntil
          ? new Date(response.lockInfo.lockedUntil).toLocaleString()
          : "vĩnh viễn";

        toast.error(
          <div>
            <strong>Tài khoản đã bị khóa</strong>
            <p>Lý do: {response.lockInfo.reason}</p>
            <p>Thời gian mở khóa: {lockUntilDate}</p>
          </div>,
          { autoClose: false }
        );
        return;
      }

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
      const errorMessage =
        error.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.";

      // Hiển thị thông báo lỗi
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
