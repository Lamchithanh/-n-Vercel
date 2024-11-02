import axios from "axios";
import { API_URL } from "../config/config";
import { getAuthHeader } from "../utils/utils";

export const processPayment = async (paymentData) => {
  const response = await axios.post(`${API_URL}/payments`, paymentData, {
    headers: getAuthHeader(),
  });
  return response.data;
};
