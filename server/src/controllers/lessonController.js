const pool = require("../config/pool");

// Lấy tất cả bài học theo khóa học ID
exports.getLessonsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const [lessons] = await pool.query(
      "SELECT * FROM lessons WHERE course_id = ?",
      [courseId]
    );
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Unable to fetch lessons" });
  }
};

// Thêm bài học mới
exports.addLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, description, video_url, order_index } = req.body;

    // Chèn bài học
    const result = await pool.query(
      "INSERT INTO lessons (course_id, title, content, description, video_url, order_index) VALUES (?, ?, ?, ?, ?, ?)",
      [courseId, title, content, description, video_url, order_index]
    );

    // Lấy ID bài học vừa chèn
    const newLessonId = result.insertId;

    // Truy vấn để lấy thông tin bài học vừa chèn
    const [newLesson] = await pool.query("SELECT * FROM lessons WHERE id = ?", [
      newLessonId,
    ]);

    // Trả về thông tin bài học vừa thêm
    res.status(201).json(newLesson[0]);
  } catch (error) {
    console.error("Error adding lesson:", error);
    res.status(500).json({ error: "Unable to add lesson" });
  }
};

// Cập nhật bài học
exports.updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title, content, description, video_url, order_index } = req.body;

    const [updatedLesson] = await pool.query(
      "UPDATE lessons SET title = ?, content = ?, description = ?, video_url = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND course_id = ?",
      [title, content, description, video_url, order_index, lessonId, courseId]
    );

    if (updatedLesson.affectedRows === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Truy vấn để lấy thông tin bài học đã cập nhật
    const [lesson] = await pool.query("SELECT * FROM lessons WHERE id = ?", [
      lessonId,
    ]);
    res.status(200).json(lesson[0]);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ error: "Unable to update lesson" });
  }
};

// Xóa bài học
exports.deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const result = await pool.query(
      "DELETE FROM lessons WHERE id = ? AND course_id = ?",
      [lessonId, courseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ error: "Unable to delete lesson" });
  }
};
