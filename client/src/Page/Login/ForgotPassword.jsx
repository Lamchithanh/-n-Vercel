import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Form, Input, Button } from "antd"; // Import các thành phần của Ant Design

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // Khởi tạo useNavigate

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post(
        "http://localhost:9000/api/forgot-password",
        { email: values.email }
      );
      toast.success(
        "Nếu tài khoản với email đó tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu."
      );
      // Có thể điều hướng đến một trang khác hoặc reset form nếu cần
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container">
      <Button className="btn-signin" onClick={() => navigate(-1)}>
        Quay lại
      </Button>
      <Form
        className="form-forgot-password"
        onFinish={handleSubmit}
        layout="vertical"
        style={{ maxWidth: 400, margin: "auto" }} // Đặt chiều rộng và căn giữa
      >
        <h2>Quên Mật Khẩu</h2>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input
            placeholder="Nhập địa chỉ email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Đặt lại Mật Khẩu
          </Button>
        </Form.Item>
        <p>
          Nhớ mật khẩu? <a href="/login">Đăng nhập</a>
        </p>
      </Form>
    </div>
  );
};

export default ForgotPassword;
