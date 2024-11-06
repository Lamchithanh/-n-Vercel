// courseReviewsController.js
const pool = require("../config/pool");

exports.getCourseReviews = async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT 
        cr.*,
        u.username AS user_name,
        CASE 
          WHEN e.status = 'completed' THEN TRUE
          ELSE FALSE
        END as is_verified_purchase
      FROM course_reviews cr
      JOIN users u ON cr.user_id = u.id
      LEFT JOIN enrollments e ON e.user_id = cr.user_id AND e.course_id = cr.course_id
    `;

    const params = [courseId];

    // Base WHERE clause
    query += ` WHERE cr.course_id = ?`;

    // Add rating filter if specified
    if (rating) {
      query += ` AND cr.rating = ?`;
      params.push(rating);
    }

    // Get total count for pagination
    const countQuery = query.replace("cr.*, u.username", "COUNT(*) as total");
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Add sorting and pagination
    query += ` ORDER BY cr.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [reviews] = await pool.query(query, params);

    res.json({
      reviews,
      pagination: {
        total,
        current: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
};

exports.checkReviewEligibility = async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  try {
    // Check if user has completed the course
    const [enrollmentResults] = await pool.query(
      `SELECT COUNT(*) as completed_lessons,
       (SELECT COUNT(*) FROM lessons WHERE course_id = ?) as total_lessons
       FROM lesson_progress
       WHERE user_id = ? AND course_id = ? AND status = 'completed'`,
      [courseId, userId, courseId]
    );

    const { completed_lessons, total_lessons } = enrollmentResults[0];
    const completion_percentage = (completed_lessons / total_lessons) * 100;

    // Check if user has already reviewed
    const [reviewResults] = await pool.query(
      `SELECT * FROM course_reviews WHERE course_id = ? AND user_id = ?`,
      [courseId, userId]
    );

    res.json({
      canReview: completion_percentage >= 80, // Requires 80% completion
      hasReviewed: reviewResults.length > 0,
      completionPercentage: completion_percentage,
      review: reviewResults[0] || null,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error checking review eligibility" });
  }
};

exports.addCourseReview = async (req, res) => {
  const { courseId } = req.params;
  const { userId, rating, reviewText } = req.body;

  try {
    // Check eligibility first
    const eligibilityResponse = await this.checkReviewEligibility(
      {
        params: { courseId },
        query: { userId },
      },
      { json: (data) => data }
    );

    if (!eligibilityResponse.canReview) {
      return res.status(403).json({
        error: "You must complete at least 80% of the course before reviewing",
      });
    }

    if (eligibilityResponse.hasReviewed) {
      return res.status(403).json({
        error: "You have already reviewed this course",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO course_reviews (course_id, user_id, rating, review_text) 
       VALUES (?, ?, ?, ?)`,
      [courseId, userId, rating, reviewText]
    );

    res.status(201).json({
      message: "Review added successfully",
      reviewId: result.insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error adding review" });
  }
};
