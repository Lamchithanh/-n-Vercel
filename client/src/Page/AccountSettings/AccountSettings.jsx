import { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import defaultAvatar from "../../assets/img/avarta.png";

const AccountSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [useDefaultAvatar, setUseDefaultAvatar] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

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
      console.log("Dữ liệu gửi đi:", values); // Log giá trị gửi đi

      const response = await updateUserInDatabase(values);
      console.log("Phản hồi từ backend:", response.data); // Log phản hồi từ backend

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
      const userId = userData.id;
      const token = localStorage.getItem("token");

      const updateData = {
        ...(values.fullName && { username: values.fullName }),
        ...(values.bio && { bio: values.bio }),
        ...(useDefaultAvatar ? {} : { avatar: imageUrl }),
        email: userData.email,
        role: userData.role,
      };

      console.log("Dữ liệu sẽ cập nhật:", updateData); // Log dữ liệu sẽ gửi đi

      const response = await axios.put(
        `${API_URL}/api/users/${userId}`,
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

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ có thể tải lên file JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Kích thước ảnh phải nhỏ hơn 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = async (info) => {
    if (info.file.status === "uploading") {
      setUploadLoading(true);
      return;
    }

    if (info.file.status === "done") {
      try {
        const imageUrl = info.file.response.data.url;
        setImageUrl(imageUrl);
        setUseDefaultAvatar(false);
        message.success("Tải ảnh lên thành công");
      } catch {
        message.error("Lỗi khi tải ảnh lên");
      } finally {
        setUploadLoading(false);
      }
    }
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
          action={`${API_URL}/api/upload`}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          headers={{
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }}
        >
          {uploadLoading ? (
            <LoadingOutlined />
          ) : (
            <div>
              <img
                src={useDefaultAvatar ? defaultAvatar : imageUrl}
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
            </div>
          )}
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
