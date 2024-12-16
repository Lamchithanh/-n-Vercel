import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Form, Input, Button, Select } from "antd";
import { register } from "../../../../server/src/Api/authAPI";
import AOS from "aos"; // Import AOS
import "aos/dist/aos.css"; // Import AOS styles
import { LeftOutlined } from "@ant-design/icons";

const { Option } = Select;

const Register = () => {
  const [username, setUsername] = useState(""); // Tên người dùng
  const [email, setEmail] = useState(""); // Địa chỉ email
  const [password, setPassword] = useState(""); // Mật khẩu
  const [confirmPassword, setConfirmPassword] = useState(""); // Xác nhận mật khẩu
  const [role, setRole] = useState("student"); // Giá trị mặc định cho vai trò
  const navigate = useNavigate(); // Để chuyển hướng

  useEffect(() => {
    AOS.init(); // Initialize AOS
  }, []);

  const handleSubmit = async (values) => {
    const { username, email, password, role } = values;

    let formattedEmail = email.trim(); // Xóa khoảng trắng thừa
    if (!formattedEmail.includes("@")) {
      formattedEmail += "@gmail.com";
    } else if (!formattedEmail.endsWith("@gmail.com")) {
      toast.error("Vui lòng sử dụng địa chỉ email hợp lệ với @gmail.com");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    try {
      await register({
        username,
        email: formattedEmail, // Sử dụng email đã được định dạng
        password,
        role,
      });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
    }
  };

  return (
    <div
      className="register-container container"
      style={{ display: "flex", alignItems: "center" }}
      data-aos="fade-up" // Add AOS animation to the container
      data-aos-duration="1000"
    >
      <div
        className="form-container"
        style={{ flex: "1", padding: "20px" }}
        data-aos="fade-left" // Add AOS animation to the form container
        data-aos-duration="1200"
      >
        <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          <LeftOutlined />
        </Button>
        <Form
          className="form-Register"
          onFinish={handleSubmit}
          layout="vertical"
          data-aos="fade-right" // Add AOS animation to the form
          data-aos-duration="1400"
        >
          <h2 className="title-Register">Tạo tài khoản</h2>
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên người dùng!" },
            ]}
          >
            <Input
              placeholder="Tên người dùng"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%" }} // Thay đổi chiều rộng
            />
          </Form.Item>
          <Form.Item
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select
              value={role}
              onChange={(value) => setRole(value)}
              style={{ width: "100%" }}
            >
              <Option value="student">1. Học viên</Option>
              <Option value="instructor">2. Giảng viên</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }} // Thay đổi chiều rộng
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }} // Thay đổi chiều rộng
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
          >
            <Input.Password
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: "100%" }} // Thay đổi chiều rộng
            />
          </Form.Item>
          <Form.Item>
            <Button
              className="btn-Register"
              type="primary"
              htmlType="submit"
              style={{
                width: "100%",
                backgroundColor: "#4caf50",
                borderColor: "#4caf50",
              }}
            >
              Đăng ký
            </Button>
          </Form.Item>
          <p>
            Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Register;
