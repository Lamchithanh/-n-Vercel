import axios from "axios";
import { API_URL } from "../config/config";
import { getAuthHeader } from "../utils/utils";

export const fetchModulesAPI = async (courseId) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}/modules`);
  return response.data;
};

export const addModuleAPI = async (moduleData, token) => {
  try {
    const response = await axios.post(`${API_URL}/modules`, moduleData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateModuleAPI = async (moduleId, moduleData) => {
  const response = await axios.put(
    `${API_URL}/modules/${moduleId}`,
    moduleData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const deleteModuleAPI = async (moduleId) => {
  const response = await axios.delete(`${API_URL}/modules/${moduleId}`);
  return response.data;
};
