import axios from "axios";
import { API_URL } from "../config/config";
import { getAuthHeader } from "../utils/utils";

export const fetchUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const fetchUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCertificates = async (userId) => {
  const response = await axios.get(`${API_URL}/users/${userId}/certificates`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
