import axios from "axios";
import { API_URL } from "../config/config";

export const fetchdashboardAPI = async (token) => {
  const response = await axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
