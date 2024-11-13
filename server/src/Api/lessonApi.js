import axios from "axios";
import { API_URL } from "../config/config";
import { getAuthHeader } from "../utils/utils";

const getVideoId = (url) => {
  if (!url) return null;
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const fetchLessonsAPI = async (moduleId, courseId) => {
  try {
    let url =
      moduleId === "all"
        ? `${API_URL}/lessons?courseId=${courseId}`
        : `${API_URL}/modules/${moduleId}/lessons`;

    const response = await axios.get(url);

    // Kiểm tra và cập nhật thời lượng video nếu cần
    const lessons = response.data;
    for (let lesson of lessons) {
      if (!lesson.duration && lesson.video_url) {
        try {
          const durationResponse = await axios.get(
            `${API_URL}/lessons/duration?videoUrl=${encodeURIComponent(
              lesson.video_url
            )}`
          );
          lesson.duration = durationResponse.data.duration;
        } catch (error) {
          console.error("Error fetching video duration:", error);
        }
      }
    }

    return lessons;
  } catch (error) {
    throw error;
  }
};

export const addLessonAPI = async (lessonData, token) => {
  try {
    // Lấy thời lượng video nếu có video_url
    if (lessonData.video_url) {
      try {
        const durationResponse = await axios.get(
          `${API_URL}/lessons/duration?videoUrl=${encodeURIComponent(
            lessonData.video_url
          )}`
        );
        lessonData.duration = durationResponse.data.duration;
      } catch (error) {
        console.error("Error fetching video duration:", error);
      }
    }

    const response = await axios.post(
      `${API_URL}/courses/${lessonData.course_id}/lessons`,
      lessonData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLessonAPI = async (lessonId, lessonData, token) => {
  try {
    if (lessonData.video_url) {
      try {
        const durationResponse = await axios.get(
          `${API_URL}/lessons/duration?videoUrl=${encodeURIComponent(
            lessonData.video_url
          )}`
        );
        // Ensure duration is stored as a number
        lessonData.duration = parseFloat(durationResponse.data.duration);
      } catch (error) {
        console.error("Error fetching video duration:", error);
      }
    }

    const response = await axios.put(
      `${API_URL}/courses/${lessonData.course_id}/lessons/${lessonId}`,
      lessonData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
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

// API mới để lấy tổng thời lượng của module
export const getModuleDurationAPI = async (moduleId) => {
  try {
    const response = await axios.get(`${API_URL}/modules/${moduleId}/duration`);
    return response.data.totalDuration;
  } catch (error) {
    console.error("Error fetching module duration:", error);
    throw error;
  }
};

// API mới để lấy tổng thời lượng của khóa học
export const getCourseDurationAPI = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/courses/${courseId}/duration`);
    return response.data.totalDuration;
  } catch (error) {
    console.error("Error fetching course duration:", error);
    throw error;
  }
};

// API để cập nhật thời lượng của một video cụ thể
export const updateLessonDurationAPI = async (lessonId, videoUrl, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/lessons/${lessonId}/duration`,
      { video_url: videoUrl },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lesson duration:", error);
    throw error;
  }
};
