import axios from "axios";
import { API_URL } from "../config/config";

export const handleError = (error, message) => {
  console.error(`${message}:`, error);
  throw error;
};

export const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password,
    });

    if (response.data.token) {
      const userDataToStore = {
        token: response.data.token,
        ...response.data.user,
      };

      localStorage.setItem("user", JSON.stringify(userDataToStore));
    }

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

export const googleLogin = async (credentialResponse) => {
  try {
    const response = await axios.post(`${API_URL}/users/google-login`, {
      credential: credentialResponse.credential,
    });

    if (response.data.token) {
      const userDataToStore = {
        token: response.data.token,
        ...response.data.user,
      };

      localStorage.setItem("user", JSON.stringify(userDataToStore));
    }

    return response.data;
  } catch (error) {
    console.error("Google login error:", error.response?.data || error.message);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendForgotPasswordEmail = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const updateFirstLogin = async (userId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/update-first-login`,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Detailed Error:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Không tìm thấy token");
    }

    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Chi tiết lỗi:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
