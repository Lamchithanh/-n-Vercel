const express = require("express");
const router = express.Router();
const courseReviewsController = require("../controllers/courseReviewsController");

// Lấy danh sách đánh giá của khóa học
router.get(
  "/courses/:courseId/reviews",
  courseReviewsController.getCourseReviews
);

// Lấy thống kê đánh giá cho khóa học
router.get(
  "/courses/:courseId/review-stats", // Thay đổi URL ở đây
  courseReviewsController.getCourseReviewStats
);

// Kiểm tra người dùng đã đánh giá chưa
router.get(
  "/courses/:courseId/user-review-status",
  courseReviewsController.hasUserReviewedCourse
);

router.post(
  "/courses/:courseId/reviews",
  courseReviewsController.addCourseReview
);
router.put("/reviews/:reviewId", courseReviewsController.updateCourseReview);
router.delete("/reviews/:reviewId", courseReviewsController.deleteCourseReview);

module.exports = router;
