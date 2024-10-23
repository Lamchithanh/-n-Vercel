import { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import defaultAvatar from "../../assets/img/avarta.png";

const AccountSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [useDefaultAvatar, setUseDefaultAvatar] = useState(false);
  const navigate = useNavigate();

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

      const updateData = {
        username: values.fullName,
        bio: values.bio,
        avatar: imageUrl,
        updatedAt: new Date().toISOString(),
      };

      const response = await axios.put(
        `http://localhost:9000/api/users/${userId}`,
        updateData
      );

      if (response.status === 200) {
        const updatedUser = {
          ...userData,
          ...updateData,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        message.success("Cập nhật thông tin thành công");
        navigate("/account-settings");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response && error.response.status === 400) {
        message.error(error.response.data.message);
      } else {
        message.error("Có lỗi xảy ra khi cập nhật thông tin");
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

        const userData = JSON.parse(localStorage.getItem("user"));
        const updatedUser = {
          ...userData,
          avatar: imageUrl,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        message.success("Tải ảnh lên thành công");
      } catch (error) {
        message.error("Lỗi khi tải ảnh lên");
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="mt-2">Tải ảnh lên</div>
    </div>
  );

  return (
    <Card title="Thông tin cơ bản" className="max-w-2xl mx-auto mt-8 container">
      <p className="mb-4 text-gray-600">Quản lý thông tin cá nhân của bạn.</p>

      <div className="mb-6 flex items-center">
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader"
          showUploadList={false}
          action="http://localhost:9000/api/upload"
          beforeUpload={beforeUpload}
          onChange={handleChange}
        >
          <div className="">
            <img
              src={useDefaultAvatar ? defaultAvatar : imageUrl}
              alt="avatar"
              className="w-full h-full object-cover"
              style={{ width: "100px", height: "100px", borderRadius: "50%" }} // Adjust the width and height here
              onError={(e) => {
                if (!useDefaultAvatar) {
                  setImageUrl(defaultAvatar);
                  setUseDefaultAvatar(true);
                  message.warning("Không thể tải ảnh, đã dùng ảnh mặc định");
                }
                e.target.onerror = null; // Ngăn lặp vô hạn khi lỗi liên tục
              }}
            />
          </div>
        </Upload>

        <div className="ml-4">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
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
