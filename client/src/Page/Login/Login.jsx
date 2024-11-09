import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Form, Input, Button } from "antd";
import { login } from "../../../../server/src/Api/authAPI.js";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const response = await login(values.email, values.password);

      // Kiểm tra nếu response là lỗi
      if (response.error) {
        // Kiểm tra nếu tài khoản bị khóa
        if (response.error === "Tài khoản bị khóa" && response.lockInfo) {
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

        // Hiển thị lỗi khác
        toast.error(response.error);
        return;
      }

      // Xử lý đăng nhập thành công
      toast.success("Đăng nhập thành công!");

      // Kiểm tra lại một lần nữa trạng thái khóa trước khi lưu và chuyển hướng
      if (response.user.isLocked) {
        toast.error("Tài khoản đang bị khóa!");
        return;
      }

      // Lưu thông tin user
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
