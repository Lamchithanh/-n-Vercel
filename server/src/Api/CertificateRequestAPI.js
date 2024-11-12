import axios from "axios";
import { API_URL } from "../config/config";

export const requestCertificateAPI = async (userId, courseId) => {
  return await axios.post(`${API_URL}/certificates/request`, {
    userId,
    courseId,
  });
};

export const getCertificateStatusAPI = async (userId, courseId) => {
  return await axios.get(
    `${API_URL}/certificates/status/${userId}/${courseId}`
  );
};

export const fetchPendingRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/certificates/requests`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    throw error;
  }
};

export const acceptCertificateRequest = async (requestId) => {
  try {
    await axios.post(`${API_URL}/certificates/accept/${requestId}`);
    // Thông báo chấp nhận hoặc xử lý logic khác
  } catch (error) {
    console.error("Error accepting certificate request:", error);
    // Xử lý lỗi
  }
};

export const rejectCertificateRequest = async (requestId) => {
  try {
    await axios.post(`${API_URL}/certificates/reject/${requestId}`);
    // Thông báo từ chối hoặc xử lý logic khác
  } catch (error) {
    console.error("Error rejecting certificate request:", error);
    // Xử lý lỗi
  }
};
