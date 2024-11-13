import axios from "axios";
import { message } from "antd";
import { API_URL } from "../config/config"; // Cập nhật URL API của bạn

export const uploadAvatar = async (file, userId) => {
  try {
    // Kiểm tra file ảnh
    if (!file) {
      throw new Error("Vui lòng chọn ảnh");
    }

    // Đọc file dưới dạng base64
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;

      // Gửi base64 lên backend
      const response = await axios.post(
        `${API_URL}/users/${userId}/upload-avatar`,
        { imageData: base64Image },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Kiểm tra phản hồi
      if (response.data && response.data.imageUrl) {
        message.success("Tải ảnh thành công!");
        return response.data.imageUrl; // Trả về URL ảnh đã upload
      } else {
        message.error("Có lỗi khi tải ảnh lên.");
      }
    };

    reader.onerror = (error) => {
      message.error("Có lỗi khi đọc file ảnh.");
      console.error("FileReader error:", error);
    };
  } catch (error) {
    console.error("Lỗi khi tải ảnh:", error);
    message.error(error.message || "Có lỗi khi tải ảnh lên.");
  }
};
