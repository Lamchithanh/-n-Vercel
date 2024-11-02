import axios from "axios";
import { API_URL } from "../config/config";
import { getAuthHeader } from "./authAPI";

export const fetchCoursesAPI = async (token) => {
  const response = await axios.get(`${API_URL}/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchCourseById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/courses/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error("Không thể tải khóa học.");
  }
};

export const addCourse = async (courseData) => {
  const response = await axios.post(`${API_URL}/courses`, courseData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await axios.put(
    `${API_URL}/courses/${courseId}`,
    courseData,
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const response = await axios.delete(`${API_URL}/courses/${courseId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};
