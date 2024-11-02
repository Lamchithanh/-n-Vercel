import axios from "axios";
import { API_URL } from "../config/config";
import { getAuthHeader } from "../utils/utils";

export const fetchProgress = async (courseId, userId) => {
  const response = await axios.get(
    `${API_URL}/progress?courseId=${courseId}&userId=${userId}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateProgress = async (lessonId, progressData) => {
  const response = await axios.put(
    `${API_URL}/progress/${lessonId}`,
    progressData,
    { headers: getAuthHeader() }
  );
  return response.data;
};
