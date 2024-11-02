const pool = require("../config/pool");

exports.getCourseReviews = (req, res) => {
  const { courseId } = req.params;
  const query = `
    SELECT cr.*, u.username AS user_name  
    FROM course_reviews cr
    JOIN users u ON cr.user_id = u.id
    WHERE cr.course_id = ?  
    ORDER BY cr.created_at DESC
  `;

  pool.query(query, [courseId], (error, results) => {
    if (error) {
      console.error("Lỗi cơ sở dữ liệu:", error);
      return res.status(500).json({ error: "Lỗi khi lấy đánh giá khóa học" });
    }
    console.log("Kết quả đánh giá:", results); // Log kết quả trả về
    res.json(results);
  });
};

// Thêm hàm lấy thống kê đánh giá
exports.getCourseReviewStats = (req, res) => {
  const { courseId } = req.params;
  const query = `
    SELECT 
      COUNT(*) as totalReviews,
      AVG(rating) as averageRating,
      JSON_OBJECT(
        '5', COUNT(CASE WHEN rating = 5 THEN 1 END),
        '4', COUNT(CASE WHEN rating = 4 THEN 1 END),
        '3', COUNT(CASE WHEN rating = 3 THEN 1 END),
        '2', COUNT(CASE WHEN rating = 2 THEN 1 END),
        '1', COUNT(CASE WHEN rating = 1 THEN 1 END)
      ) as ratingDistribution
    FROM course_reviews
    WHERE course_id = ?
  `;

  pool.query(query, [courseId], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Lỗi khi lấy thống kê đánh giá" });
    }
    const stats = results[0];
    stats.ratingDistribution = JSON.parse(stats.ratingDistribution);
    res.json(stats);
  });
};

// Thêm hàm kiểm tra người dùng đã đánh giá chưa
exports.hasUserReviewedCourse = (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  const query = `
    SELECT COUNT(*) as reviewCount 
    FROM course_reviews 
    WHERE course_id = ? AND user_id = ?
  `;

  pool.query(query, [courseId, userId], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Lỗi khi kiểm tra trạng thái đánh giá" });
    }
    res.json({ hasReviewed: results[0].reviewCount > 0 });
  });
};

// Thêm đánh giá mới
exports.addCourseReview = (req, res) => {
  const { courseId } = req.params;
  const { userId, rating, reviewText } = req.body;
  const query =
    "INSERT INTO course_reviews (course_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)";

  pool.query(
    query,
    [courseId, userId, rating, reviewText],
    (error, results) => {
      if (error)
        return res.status(500).json({ error: "Lỗi khi thêm đánh giá" });
      res
        .status(201)
        .json({ message: "Đánh giá đã được thêm", reviewId: results.insertId });
    }
  );
};

// Sửa đánh giá
exports.updateCourseReview = (req, res) => {
  const { reviewId } = req.params;
  const { rating, reviewText } = req.body;
  const query =
    "UPDATE course_reviews SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

  pool.query(query, [rating, reviewText, reviewId], (error, results) => {
    if (error)
      return res.status(500).json({ error: "Lỗi khi cập nhật đánh giá" });
    if (results.affectedRows === 0)
      return res.status(404).json({ error: "Không tìm thấy đánh giá" });
    res.json({ message: "Đánh giá đã được cập nhật" });
  });
};

// Xóa đánh giá
exports.deleteCourseReview = (req, res) => {
  const { reviewId } = req.params;
  const query = "DELETE FROM course_reviews WHERE id = ?";

  pool.query(query, [reviewId], (error, results) => {
    if (error) return res.status(500).json({ error: "Lỗi khi xóa đánh giá" });
    if (results.affectedRows === 0)
      return res.status(404).json({ error: "Không tìm thấy đánh giá" });
    res.json({ message: "Đánh giá đã được xóa" });
  });
};
