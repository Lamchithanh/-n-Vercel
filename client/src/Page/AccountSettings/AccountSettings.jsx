import { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultAvatar from "../../assets/img/avarta.png";

const AccountSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [useDefaultAvatar, setUseDefaultAvatar] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState("");
  const navigate = useNavigate();

  const API_URL = "http://localhost:9000/api";

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      form.setFieldsValue({
        fullName: parsedUser.username,
        email: parsedUser.email,
        role: parsedUser.role,
        bio: parsedUser.bio || "",
      });
      if (parsedUser.avatar) {
        setImageUrl(parsedUser.avatar);
        setUseDefaultAvatar(false);
      } else {
        setImageUrl(defaultAvatar);
        setUseDefaultAvatar(true);
      }
    } else {
      message.error("Không tìm thấy thông tin người dùng");
      navigate("/");
    }
  }, [form, navigate]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log("Dữ liệu gửi đi:", values);

      const response = await updateUserInDatabase(values);
      console.log("Phản hồi từ backend:", response.data);

      if (response.data.success) {
        message.success("✅ Cập nhật thông tin người dùng thành công");
      } else {
        message.error("❌ Cập nhật thông tin không thành công");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const updateUserInDatabase = async (values) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      const updateData = {
        ...(values.fullName && { username: values.fullName }),
        ...(values.bio && { bio: values.bio }),
        ...(useDefaultAvatar ? {} : { avatar: avatarBase64 }),
        email: userData.email,
        role: userData.role,
      };

      console.log("Dữ liệu sẽ cập nhật:", updateData);

      const response = await axios.put(
        `${API_URL}/users/${userData.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const handleAvatarChange = async (info) => {
    if (info.file.status === "removed") {
      setImageUrl(defaultAvatar);
      setUseDefaultAvatar(true);
      setAvatarBase64(""); // Xóa avatarBase64 khi không chọn ảnh
    } else if (info.file.status === "uploading") {
      // Handle uploading state if needed
    } else if (info.file.status === "done") {
      const base64 = await convertToBase64(info.file.originFileObj);
      console.log("Base64 avatar: ", base64); // Kiểm tra base64
      setImageUrl(base64);
      setUseDefaultAvatar(false);
      setAvatarBase64(base64);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <Card title="Thông tin cơ bản" className="max-w-2xl mx-auto mt-8 container">
      <p className="mb-4 text-gray-600">Quản lý thông tin cá nhân của bạn.</p>

      <div className="mb-6 flex items-center">
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={() => false} // Ngừng upload file thực tế
          onChange={handleAvatarChange} // Xử lý khi thay đổi ảnh
          customRequest={() => false} // Không thực hiện upload
        >
          <img
            src={imageUrl}
            alt="avatar"
            className="w-full h-full object-cover rounded-full"
            style={{ width: "100px", height: "100px" }}
            onError={(e) => {
              if (!useDefaultAvatar) {
                setImageUrl(defaultAvatar);
                setUseDefaultAvatar(true);
                message.warning("Không thể tải ảnh, đã dùng ảnh mặc định");
              }
              e.target.onerror = null;
            }}
          />
        </Upload>

        <div className="ml-4 flex-grow">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="max-w-md"
          >
            <Form.Item label="Họ và tên" name="fullName">
              <Input placeholder="Nhập họ và tên của bạn" />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input
                disabled
                className="bg-gray-100"
                placeholder="Email không thể thay đổi"
              />
            </Form.Item>

            <Form.Item label="Giới thiệu" name="bio">
              <Input.TextArea
                placeholder="Giới thiệu ngắn về bản thân"
                rows={4}
                showCount
              />
            </Form.Item>

            <Form.Item>
              <div className="flex gap-4">
                <Button type="primary" htmlType="submit" loading={loading}>
                  Lưu thay đổi
                </Button>
                <Button onClick={() => navigate("/profile")}>Hủy</Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Card>
  );
};

export default AccountSettings;
