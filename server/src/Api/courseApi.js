import axios from "axios";
import { message } from "antd";
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

export const getProgressAPI = async (userId, courseId) => {
  const response = await axios.get(`${API_URL}/progress/${userId}/${courseId}`);
  return response.data;
};

export const updateProgressAPI = async (data) => {
  const response = await axios.post(`${API_URL}/progress/update`, data);
  return response.data;
};

export const uploadCourseImage = async (file, courseId) => {
  try {
    // Validate file trước khi upload
    if (!file) {
      throw new Error("Vui lòng chọn file ảnh");
    }

    // Kiểm tra định dạng file
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF");
    }

    // Kiểm tra kích thước file (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Kích thước file không được vượt quá 2MB");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${API_URL}/courses/${courseId}/upload-image`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      }
    );

    if (!response.data || !response.data.imageUrl) {
      throw new Error("Phản hồi từ server không hợp lệ");
    }

    message.success(
      `Tải ảnh thành công (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    );
    return response.data.imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);

    // Xử lý các loại lỗi cụ thể
    if (error.response) {
      // Lỗi từ server
      throw new Error(error.response.data.message || "Lỗi server khi tải ảnh");
    } else if (error.request) {
      // Lỗi không nhận được phản hồi
      throw new Error("Không thể kết nối đến server");
    } else {
      // Lỗi khác
      throw new Error(
        error.message || "Không thể tải ảnh lên. Vui lòng thử lại."
      );
    }
  }
};
