const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

// Các route không cần xác thực
router.get("/courses", courseController.getAllCourses); // Lấy tất cả khóa học
router.get("/courses/:id", courseController.getCourseById); // Lấy khóa học theo ID
router.post("/courses", courseController.addCourse); // Thêm khóa học mới
router.put("/courses/:id", courseController.updateCourse); // Cập nhật khóa học theo ID
router.delete("/courses/:id", courseController.deleteCourse); // Xóa khóa học theo ID

// Routes cho bài học (lessons)
router.get("/courses/:courseId/lessons", courseController.getLessonsByCourseId);
router.post("/courses/:courseId/lessons", courseController.addLesson);
router.put(
  "/courses/:courseId/lessons/:lessonId",
  courseController.updateLesson
);
router.delete(
  "/courses/:courseId/lessons/:lessonId",
  courseController.deleteLesson
);

module.exports = router;
