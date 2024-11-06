// courseReviewApi.js
const express = require("express");
const router = express.Router();
const pool = require("../config/pool");

// Lấy danh sách đánh giá
router.get("/courses/:courseId/reviews", async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `
      SELECT cr.*, u.username AS user_name
      FROM course_reviews cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.course_id = ?
      ORDER BY cr.created_at DESC
    `,
      [req.params.courseId]
    );

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy đánh giá" });
  }
});

// Lấy thống kê đánh giá
router.get("/courses/:courseId/review-stats", async (req, res) => {
  try {
    const [stats] = await pool.query(
      `
      SELECT 
        COUNT(*) as totalReviews,
        AVG(rating) as averageRating
      FROM course_reviews
      WHERE course_id = ?
    `,
      [req.params.courseId]
    );

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy thống kê" });
  }
});

// Thêm đánh giá mới
router.post("/courses/:courseId/reviews", async (req, res) => {
  const { userId, rating, reviewText } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO course_reviews (course_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)",
      [req.params.courseId, userId, rating, reviewText]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm đánh giá" });
  }
});

// Cập nhật đánh giá
router.put("/reviews/:reviewId", async (req, res) => {
  const { rating, reviewText } = req.body;

  try {
    await pool.query(
      "UPDATE course_reviews SET rating = ?, review_text = ? WHERE id = ?",
      [rating, reviewText, req.params.reviewId]
    );

    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật đánh giá" });
  }
});

// Xóa đánh giá
router.delete("/reviews/:reviewId", async (req, res) => {
  try {
    await pool.query("DELETE FROM course_reviews WHERE id = ?", [
      req.params.reviewId,
    ]);
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa đánh giá" });
  }
});

module.exports = router;
