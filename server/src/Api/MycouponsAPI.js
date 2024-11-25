import axios from "axios";
import { API_URL } from "../config/config";

export const claimCouponAPI = async (userId, courseId) => {
  try {
    const response = await axios.post(`${API_URL}/mycoupons/claim`, {
      user_id: userId,
      course_id: courseId,
    });

    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Đã có lỗi xảy ra:", error);
    throw error; // Ném lỗi ra ngoài để xử lý ở nơi gọi API
  }
};
