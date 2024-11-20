import { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Upload } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultAvatar from "../../assets/img/avarta.png";

const AccountSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(""); // Thêm state cho avatarUrl
  const [useDefaultAvatar, setUseDefaultAvatar] = useState(false);
  // const [avatarBase64, setAvatarBase64] = useState("");
  const [userData, setUserData] = useState(null); // Thêm state cho userData
  const navigate = useNavigate();

  const API_URL = "http://localhost:9000/api";

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      const parsedUser = JSON.parse(storedUserData);
      setUserData(parsedUser); // Lưu userData vào state
      form.setFieldsValue({
        fullName: parsedUser.username,
        email: parsedUser.email,
        role: parsedUser.role,
        bio: parsedUser.bio || "",
      });
      if (parsedUser.avatar) {
        setImageUrl(parsedUser.avatar);
        setAvatarUrl(parsedUser.avatar);
        setUseDefaultAvatar(false);
      } else {
        setImageUrl(defaultAvatar);
        setAvatarUrl(defaultAvatar);
        setUseDefaultAvatar(true);
      }
    } else {
      message.error("Không tìm thấy thông tin người dùng");
      navigate("/");
    }
  }, [form, navigate]);

  const handleAvatarChange = async (info) => {
    try {
      if (!userData) {
        message.error("Không tìm thấy thông tin người dùng");
        return;
      }

      const formData = new FormData();
      formData.append("avatar", info.file.originFileObj); // Đảm bảo tên file đúng với 'avatar'

      const response = await axios.post(
        `${API_URL}/users/${userData.id}/upload-avatar`, // Kiểm tra xem URL này có chính xác không
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Nếu response thành công, cập nhật avatar cho user
      if (response.status === 200) {
        message.success("Cập nhật ảnh đại diện thành công");
        setAvatarUrl(response.data.imageUrl); // Lưu URL của avatar vào state
        setImageUrl(`${API_URL}${response.data.imageUrl}`); // Cập nhật hình ảnh
      } else {
        message.error("Có lỗi xảy ra khi tải ảnh");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error("Có lỗi xảy ra khi upload ảnh");
    }
  };

  const updateUserInDatabase = async (values) => {
    try {
      if (!userData) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      const token = localStorage.getItem("token");

      const updateData = {
        username: values.fullName,
        bio: values.bio || "",
        avatar: avatarUrl,
        email: values.email,
        role: userData.role,
      };

      // Dùng await để đợi phản hồi
      const response = await axios.put(
        `${API_URL}/users/${userData.id}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Kiểm tra nếu status trả về là 200
      if (response.status === 200) {
        return response; // Nếu cần, có thể xử lý thêm phản hồi từ server tại đây
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await updateUserInDatabase(values);

      console.log("Full Response:", response);

      // Since the response doesn't have success flag, check for 200 status
      if (response.status === 200) {
        // Manually retrieve the updated user data
        const storedUserData = JSON.parse(localStorage.getItem("user"));
        const updatedUserData = {
          ...storedUserData,
          username: values.fullName,
          bio: values.bio || "",
          avatar: avatarUrl,
        };

        localStorage.setItem("user", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);

        // Update form fields
        form.setFieldsValue({
          fullName: updatedUserData.username,
          email: updatedUserData.email,
          bio: updatedUserData.bio || "",
        });

        // Update avatar
        if (avatarUrl) {
          setImageUrl(`${API_URL}${avatarUrl}`);
          setUseDefaultAvatar(false);
        }

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

  // Phần return giữ nguyên như cũ
  return (
    <>
      <Button
        className="btn-back"
        onClick={() => navigate(-1)}
        style={{ margin: 10, marginLeft: 100 }}
      >
        ← Quay lại
      </Button>
      <Card
        title="Thông tin cơ bản"
        className="max-w-2xl mx-auto mt-8 container"
      >
        <p className="mb-4 text-gray-600">Quản lý thông tin cá nhân của bạn.</p>

        <div className="mb-6 flex items-center">
          <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            onChange={handleAvatarChange}
            customRequest={({ onSuccess }) => onSuccess()}
          >
            <img
              src={imageUrl}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
              style={{ width: "100px", height: "100px" }}
              onError={(e) => {
                if (!useDefaultAvatar) {
                  setImageUrl(defaultAvatar);
                  setAvatarUrl(defaultAvatar);
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
    </>
  );
};

export default AccountSettings;
