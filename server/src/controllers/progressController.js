const pool = require("../config/pool");

const handleVideoProgress = async (req, res) => {
  const { userId, lessonId, courseId, status } = req.body;

  try {
    // Kiểm tra xem bài học này đã được hoàn thành chưa
    const existingProgress = await pool.query(
      `SELECT * FROM lesson_progress 
         WHERE user_id = ? AND lesson_id = ? AND course_id = ?`,
      [userId, lessonId, courseId]
    );

    if (existingProgress.length === 0) {
      // Nếu chưa có progress record, tạo mới
      await pool.query(
        `INSERT INTO lesson_progress 
           (user_id, lesson_id, course_id, status, progress_percentage) 
           VALUES (?, ?, ?, ?, 100)`,
        [userId, lessonId, courseId, status]
      );

      // Cập nhật tổng tiến độ của khóa học
      await updateCourseProgress(userId, courseId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateCourseProgress = async (userId, courseId) => {
  try {
    // Lấy tổng số bài học của khóa học
    const [totalLessons] = await pool.query(
      "SELECT COUNT(*) as total FROM lessons WHERE course_id = ?",
      [courseId]
    );

    // Lấy số bài học đã hoàn thành
    const [completedLessons] = await pool.query(
      `SELECT COUNT(*) as completed 
         FROM lesson_progress 
         WHERE user_id = ? AND course_id = ? AND status = 'completed'`,
      [userId, courseId]
    );

    // Tính phần trăm tiến độ
    const progressPercentage =
      (completedLessons[0].completed / totalLessons[0].total) * 100;

    return progressPercentage;
  } catch (error) {
    console.error("Error updating course progress:", error);
    throw error;
  }
};

module.exports = {
  updateCourseProgress,
  handleVideoProgress,
};
