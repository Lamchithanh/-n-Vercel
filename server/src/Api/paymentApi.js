import axios from "axios";
import { API_URL } from "../config/config";
// import CryptoJS from "crypto-js";
import { getAuthHeader } from "../utils/utils";

export const initiatePayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/initiate`,
      paymentData
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Có lỗi xảy ra khi khởi tạo thanh toán",
      }
    );
  }
};

export const confirmPayment = async (paymentId, transactionId) => {
  try {
    const response = await axios.post(`${API_URL}/payments/confirm`, {
      paymentId,
      transactionId,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Có lỗi xảy ra khi xác nhận thanh toán",
      }
    );
  }
};

export const checkPaymentStatusAPI = async (userId, courseId) => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/status/${userId}/${courseId}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Có lỗi xảy ra khi kiểm tra trạng thái thanh toán",
      }
    );
  }
};

export const getUserPayments = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/payments/user/${userId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Có lỗi xảy ra khi tải lịch sử thanh toán",
      }
    );
  }
};

export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/details/${paymentId}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Có lỗi xảy ra khi tải thông tin thanh toán",
      }
    );
  }
};

export const createZaloPayOrder = async (amount, description, userId) => {
  const response = await axios.post(`${API_URL}/payments/create-order`, {
    amount,
    description,
    userId,
  });
  return response.data;
};
