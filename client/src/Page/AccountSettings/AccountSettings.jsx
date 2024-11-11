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

  const updateUserInDatabase = async (values) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const userId = userData.id;
      const token = localStorage.getItem("token");

      // Chỉ thêm các trường không phải là null vào dữ liệu cập nhật
      const updateData = {
        ...(values.fullName && { username: values.fullName }),
        ...(values.bio && { bio: values.bio }),
        ...(useDefaultAvatar ? {} : { avatar: imageUrl }), // Chỉ gửi avatar nếu không phải ảnh mặc định
        email: userData.email, // Giữ email cũ
      };

      // Nếu updateData rỗng (không có thay đổi), thoát khỏi hàm
      if (Object.keys(updateData).length === 0) {
        message.info("Không có thông tin nào cần cập nhật");
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/users/${userId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const updatedUser = {
          ...userData,
          ...response.data.data,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        message.success("Cập nhật thông tin thành công");
        navigate("/account-settings");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn");
          navigate("/login");
        } else {
          message.error(
            error.response.data.message ||
              "Có lỗi xảy ra khi cập nhật thông tin"
          );
        }
      } else {
        message.error("Không thể kết nối đến server");
      }
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await updateUserInDatabase(values);
    } finally {
      setLoading(false);
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
