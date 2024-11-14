// AccountSettingsAPI.js
import axios from "axios";
import { message } from "antd";
import { API_URL } from "../config/config";

export const uploadAvatar = async (file, userId) => {
  try {
    // Kiểm tra file ảnh
    if (!file) {
      throw new Error("Vui lòng chọn ảnh");
    }

    // Đọc file dưới dạng base64
    const base64Image = await convertToBase64(file);

    // Gửi base64 lên backend
    const uploadResponse = await axios.post(
      `${API_URL}/users/${userId}/upload-avatar`,
      { imageData: base64Image },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const updateResponse = await axios.put(
      `${API_URL}/users/${userId}`,
      { avatar: uploadResponse.data.imageUrl },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Kiểm tra phản hồi
    if (response.data.success) {
      message.success("Cập nhật ảnh đại diện thành công");
      return response.data.imageUrl;
    } else {
      message.error("Có lỗi khi cập nhật ảnh đại diện");
    }
  } catch (error) {
    console.error("Lỗi khi tải ảnh:", error);
    message.error(error.message || "Có lỗi khi tải ảnh lên.");
  }
};

// AccountSettingsRoutes.js
router.post("/:userId/upload-avatar", authMiddleware, async (req, res) => {
  try {
    // Kiểm tra xem có dữ liệu ảnh base64 trong body không
    if (!req.body.imageData) {
      return res.status(400).json({ message: "Không có ảnh được gửi lên" });
    }

    // Cập nhật thông tin người dùng, bao gồm cả ảnh đại diện
    const user = await updateUserProfile(req.params.userId, {
      avatar: req.body.imageData,
    });

    return res.status(200).json({
      message: "Tải ảnh lên thành công",
      imageUrl: user.avatar,
    });
  } catch (error) {
    console.error("Lỗi khi tải ảnh lên:", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
});

// AccountSettingsController.js
exports.updateUserProfile = async (userId, updates) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    // Cập nhật thông tin người dùng, bao gồm cả ảnh đại diện
    user.avatar = updates.avatar;
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
};
