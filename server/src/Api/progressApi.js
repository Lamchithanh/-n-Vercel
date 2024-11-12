import { API_URL } from "../config/config";

export const trackVideoProgress = async (userId, lessonId, courseId) => {
  try {
    const response = await fetch(`${API_URL}/progress/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        lessonId,
        courseId,
        status: "completed",
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error tracking progress:", error);
    throw error;
  }
};

export const getLessonProgress = async (userId, courseId) => {
  try {
    const response = await fetch(`${API_URL}/progress/${userId}/${courseId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching progress:", error);
    throw error;
  }
};
