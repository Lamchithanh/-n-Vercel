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

// API lấy status đăng ký
export const getEnrollmentStatusAPI = async (userId, courseId) => {
  const token = localStorage.getItem("token"); // Lấy token từ localStorage

  try {
    const response = await axios.get(
      `${API_URL}enrollments/status/${userId}/${courseId}`, // Gọi API với userId và courseId
      {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token trong header để xác thực
        },
      }
    );
    return response.data.status; // Trả về status đăng ký
  } catch (error) {
    console.error("Error fetching enrollment status:", error);
    throw new Error("Không thể lấy trạng thái đăng ký.");
  }
};

export const getEnrolledCoursesAPI = async (userId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/enrollments/my-courses/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const completeCourseAPI = async (enrollmentId) => {
  try {
    const response = await axios.patch(`${API_URL}/complete/${enrollmentId}`);
    return response.data;
  } catch (error) {
    throw new Error("Lỗi khi đánh dấu hoàn thành khóa học: " + error.message);
  }
};
