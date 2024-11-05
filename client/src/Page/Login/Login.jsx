import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Form, Input, Button } from "antd"; // Import các thành phần từ antd
import { login } from "../../../../server/src/Api/authAPI.js"; // Import hàm login từ api
// import "./Login.scss"; // Đảm bảo bạn đã tạo file này để định kiểu

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Hàm xử lý sự kiện khi người dùng gửi form
  const handleSubmit = async (values) => {
    const { email, password } = values; // Lấy giá trị từ form
    try {
      console.log("Sending login request..."); // Log trước khi gửi yêu cầu
      const response = await login(email, password);
      console.log("Response received:", response); // Log phản hồi từ API

      toast.success("Đăng nhập thành công!");

      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      if (response.user.role === "admin") {
        navigate("/admin");
      } else if (response.user.role === "instructor") {
        navigate("/instructor");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error); // Log lỗi nếu xảy ra
      toast.error(
        error.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
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
          <Input
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button style={{ backgroundColor: '#4caf50', borderColor: '#4caf50' }} className="btn-signin" type="primary" htmlType="submit">
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
