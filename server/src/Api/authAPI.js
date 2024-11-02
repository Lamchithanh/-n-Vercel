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
      localStorage.setItem(
        "user",
        JSON.stringify({
          token: response.data.token,
          ...response.data.user,
        })
      );
    }
    return response.data;
  } catch (error) {
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
