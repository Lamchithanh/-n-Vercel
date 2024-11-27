const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const { authMiddleware } = require("../middleware/auth");
const pool = require("../config/pool"); // Import promise pool

// Các routes khác giữ nguyên...
router.post("/enrollments", enrollmentController.enrollCourse);
router.get("/enrollments/:userId", enrollmentController.getEnrollments);
router.get(
  "/enrollments/my-courses/:userId",
  enrollmentController.getMyCourses
);
router.get(
  "/enrollment-status/:userId/:courseId",
  enrollmentController.getEnrollmentStatus
);
router.patch("/complete/:id", enrollmentController.completeCourse);
router.get("/top-enrolled-courses", enrollmentController.getTopEnrolledCourses);

// Sửa lại route get my-courses
router.get("/my-courses/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kiểm tra userId có hợp lệ không
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        error: "User ID không hợp lệ",
      });
    }

    // Sử dụng pool trực tiếp vì đã là promise pool
    const [rows] = await pool.query(
      `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.image,
        c.level,
        e.enrolled_at,
        e.completed_at,
        (
          SELECT COUNT(*) 
          FROM lesson_progress lp 
          WHERE lp.course_id = c.id 
          AND lp.user_id = ?
          AND lp.status = 'completed'
        ) as completed_lessons,
        (
          SELECT COUNT(*) 
          FROM lessons l 
          WHERE l.course_id = c.id
        ) as total_lessons
      FROM courses c
      INNER JOIN enrollments e ON c.id = e.course_id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `,
      [userId, userId]
    );

    // Kiểm tra nếu không có khóa học
    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    // Tính toán phần trăm tiến độ cho mỗi khóa học
    const coursesWithProgress = rows.map((course) => ({
      ...course,
      progress: {
        percentage:
          course.total_lessons > 0
            ? Math.round(
                (course.completed_lessons / course.total_lessons) * 100
              )
            : 0,
      },
    }));

    res.json(coursesWithProgress);
  } catch (error) {
    console.error("Error in /my-courses/:userId:", error);
    res.status(500).json({
      error: "Đã xảy ra lỗi khi tải danh sách khóa học",
      details: error.message,
    });
  }
});

module.exports = router;
