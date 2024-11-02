// courseReviewsApi.js
import axios from "axios";

const API_URL = "http://localhost:9000/api";

// Lấy danh sách đánh giá của khóa học
export const fetchCourseReviews = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/courses/${courseId}/reviews`);
    console.log("Dữ liệu đánh giá:", response.data); // Log dữ liệu
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi lấy đánh giá:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Thêm đánh giá mới
export const addCourseReview = async ({ courseId, rating, reviewText }) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/reviews`,
      {
        userId: user.id,
        rating,
        reviewText,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm đánh giá:", error);
    throw error;
  }
};

// Cập nhật đánh giá
export const updateCourseReview = async (reviewId, { rating, reviewText }) => {
  try {
    const response = await axios.put(`${API_URL}/reviews/${reviewId}`, {
      rating,
      reviewText,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật đánh giá:", error);
    throw error;
  }
};

// Xóa đánh giá
export const deleteCourseReview = async (reviewId) => {
  try {
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa đánh giá:", error);
    throw error;
  }
};

// Lấy thống kê đánh giá
export const getCourseReviewStats = async (courseId) => {
  try {
    const response = await axios.get(
      `${API_URL}/courses/${courseId}/review-stats`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thống kê đánh giá:", error);
    throw error;
  }
};

// Kiểm tra người dùng đã đánh giá chưa
export const hasUserReviewedCourse = async (courseId) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await axios.get(
      `${API_URL}/courses/${courseId}/user-review-status`,
      { params: { userId: user.id } }
    );
    return response.data.hasReviewed;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đánh giá:", error);
    throw error;
  }
};
