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

    console.log("Login Response:", response.data); // Log the full response

    if (response.data.token) {
      const userDataToStore = {
        token: response.data.token,
        ...response.data.user,
      };

      console.log("Storing User Data:", userDataToStore); // Log what's being stored

      localStorage.setItem("user", JSON.stringify(userDataToStore));

      // Verify storage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      console.log("Stored User from LocalStorage:", storedUser);
    }

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
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
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      throw new Error("User is not authenticated");
    }

    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Profile Fetch Response:", response.data);

    return {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      role: response.data.role,
      avatar: response.data.avatar,
      bio: response.data.bio,
      created_at: response.data.created_at, // Add this line
    };
  } catch (error) {
    console.error(
      "Failed to fetch user profile:",
      error.response?.data || error.message
    );
    throw error;
  }
};
