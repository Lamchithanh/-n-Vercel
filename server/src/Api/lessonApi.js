import axios from "axios";
import { API_URL } from "../config/config";
import { getAuthHeader } from "../utils/utils";

export const fetchLessonsAPI = async (moduleId, courseId) => {
  try {
    let url =
      moduleId === "all"
        ? `${API_URL}/lessons?courseId=${courseId}`
        : `${API_URL}/modules/${moduleId}/lessons`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addLessonAPI = async (lessonData, token) => {
  const response = await axios.post(
    `${API_URL}/courses/${lessonData.course_id}/lessons`,
    lessonData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const updateLessonAPI = async (lessonId, lessonData, token) => {
  const response = await axios.put(
    `${API_URL}/courses/${lessonData.course_id}/lessons/${lessonId}`,
    lessonData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const deleteLessonAPI = async (courseId, lessonId, token) => {
  const response = await axios.delete(
    `${API_URL}/courses/${courseId}/lessons/${lessonId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
