import { useState, useEffect } from "react";
import { Card, Form, Input, Button, Alert, message } from "antd";

const ChangePassword = () => {
  const [user, setUser] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
            oldPassword: user.password_hash, // Sử dụng mật khẩu lưu trong localStorage
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
        } else {
          setError(data.message || "Không thể đổi mật khẩu. Vui lòng thử lại.");
        }
      } else {
        setError(data.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } catch (err) {
      console.error("Error in change password:", err);
      if (err.response && err.response.status === 401) {
        setError("Mật khẩu cũ không chính xác. Vui lòng thử lại.");
      } else {
        setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
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
    <Card title="Đổi mật khẩu">
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
          label="Mật khẩu cũ"
          name="oldPassword"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
        >
          <Input.Password
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </Form.Item>
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
          <Button
            style={{ backgroundColor: "#4caf50", borderColor: "#4caf50" }}
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePassword;
