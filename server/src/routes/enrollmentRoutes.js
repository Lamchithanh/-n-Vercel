// routes/enrollmentRoutes.js
const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController"); // Import controller

// Đăng ký khóa học
router.post("/enrollments", enrollmentController.enrollCourse);

// Lấy danh sách khóa học đã đăng ký của người dùng
router.get("/enrollments/:user_id", enrollmentController.getEnrollments);

// Đánh dấu khóa học là đã hoàn thành
router.patch("/complete/:id", enrollmentController.completeCourse);

module.exports = router;
