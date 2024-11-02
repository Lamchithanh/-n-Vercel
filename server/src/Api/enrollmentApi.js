import axios from "axios";
import { API_URL } from "../config/config";
import { getAuthHeader } from "../utils/utils";

export const enrollCourseAPI = async ({ userId, courseId }) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/enrollments`,
    { userId, courseId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getEnrollmentsAPI = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/enrollments/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error("Lỗi khi lấy thông tin đăng ký: " + error.message);
  }
};

export const getEnrolledCoursesAPI = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/enrollments?userId=${userId}&_expand=course`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      "Lỗi khi lấy danh sách khóa học đã đăng ký: " + error.message
    );
  }
};

export const completeCourseAPI = async (enrollmentId) => {
  try {
    const response = await axios.patch(`${API_URL}/complete/${enrollmentId}`);
    return response.data;
  } catch (error) {
    throw new Error("Lỗi khi đánh dấu hoàn thành khóa học: " + error.message);
  }
};
