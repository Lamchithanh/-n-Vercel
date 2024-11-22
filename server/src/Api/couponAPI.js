import axios from "axios";
import { API_URL } from "../config/config";

// Thêm mã giảm giá vào danh sách yêu thích
export const addFavorite = async (token, couponId) => {
  const response = await axios.post(
    API_URL,
    { coupon_id: couponId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Xóa mã giảm giá khỏi danh sách yêu thích
export const removeFavorite = async (token, couponId) => {
  const response = await axios.delete(`${API_URL}/${couponId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Lấy danh sách mã giảm giá yêu thích
export const getFavorites = async (token) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Kiểm tra xem mã giảm giá có trong danh sách yêu thích không
export const checkFavorite = async (token, couponId) => {
  const response = await axios.get(`${API_URL}/check/${couponId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
