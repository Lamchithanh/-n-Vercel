const express = require("express");
const router = express.Router();
const pool = require("../config/pool");

// Controller to create an enrollment
const createEnrollment = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    const query = `
        INSERT INTO enrollments (user_id, course_id)
        VALUES (?, ?)
        RETURNING id, enrolled_at
      `;

    const [result] = await pool.query(query, [userId, courseId]);

    res.status(201).json({
      success: true,
      message: "Enrollment successful",
      data: result,
    });
  } catch (error) {
    console.error("Error in createEnrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create enrollment",
      error: error.message,
    });
  }
};

// Controller to check enrollment status
const checkStatus = async (req, res) => {
  const { userId, courseId } = req.query;

  try {
    const query = `
        SELECT * FROM enrollments 
        WHERE user_id = ? AND course_id = ?
        LIMIT 1
      `;

    const [enrollment] = await pool.query(query, [userId, courseId]);

    res.json({
      isEnrolled: enrollment.length > 0,
      data: enrollment[0] || null,
    });
  } catch (error) {
    console.error("Error in checkStatus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check enrollment status",
      error: error.message,
    });
  }
};

// Define routes
router.post("/api/enrollments", createEnrollment);
router.get("/api/enrollments/status", checkStatus);

// Export the router to use in the main server
module.exports = router;
