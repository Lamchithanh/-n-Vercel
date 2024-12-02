import { useState, useEffect } from "react";
import { Card, Form, Input, Button, Alert, message, Modal } from "antd";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./ChangePassword.scss";
const ChangePassword = () => {
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate(); // Hook để điều hướng

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser({ ...storedUser, token });
    } else {
      setError(
        "Không tìm thấy thông tin người dùng hoặc token. Vui lòng đăng nhập lại."
      );
    }
  }, []);

  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!user || !user.id || !user.token) {
      setError(
        "Không tìm thấy thông tin người dùng hoặc token. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:9000/api/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            newPassword,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        if (data.success) {
          setSuccess(true);
          message.success("Đổi mật khẩu thành công!");

          // Lưu mật khẩu mới vào localStorage
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...user,
              password_hash: newPassword,
            })
          );

          // Hiển thị modal sau khi đổi mật khẩu thành công
          setTimeout(() => {
            setIsModalVisible(true);
          }, 2000);
        } else {
          setError(data.message || "Không thể đổi mật khẩu. Vui lòng thử lại.");
        }
      } else {
        setError(data.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } catch (err) {
      console.error("Error in change password:", err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAgain = () => {
    // Xử lý khi người dùng chọn đăng nhập lại
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login"); // Chuyển hướng đến trang đăng nhập
  };

  const handleLater = () => {
    // Xử lý khi người dùng chọn để sau
    setIsModalVisible(false);
  };

  if (!user) {
    return (
      <Alert
        message="Vui lòng đăng nhập để đổi mật khẩu"
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="container ChangePassword_form ">
      <Card title="Đổi mật khẩu">
        <Button
          className="btn-back"
          onClick={() => navigate(-1)}
          style={{ margin: 10 }}
        >
          ← Quay lại
        </Button>
        {error && (
          <Alert message="Lỗi" description={error} type="error" showIcon />
        )}
        {success && (
          <Alert
            message="Thành công"
            description="Mật khẩu đã được đổi thành công!"
            type="success"
            showIcon
          />
        )}
        <Form layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
            ]}
          >
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" loading={loading}>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>

        {/* Modal yêu cầu đăng nhập lại */}
        <Modal
          title="Thông báo"
          visible={isModalVisible}
          onOk={handleLoginAgain}
          onCancel={handleLater}
          okText="Đăng nhập lại"
          cancelText="Để sau"
        >
          <p>
            Đổi mật khẩu thành công! Vui lòng đăng nhập lại để tiếp tục hoặc
            chọn "Để sau".
          </p>
        </Modal>
      </Card>
    </div>
  );
};

export default ChangePassword;
