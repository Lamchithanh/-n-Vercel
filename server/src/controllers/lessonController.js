const pool = require("../config/pool");

// Hàm lấy tất cả bài học
// Trong hàm getAllLessons
exports.getAllLessons = async (req, res) => {
  try {
    const { courseId } = req.query;
    const [lessons] = await pool.query(
      `SELECT lessons.*, modules.title as module_name 
       FROM lessons 
       LEFT JOIN modules ON lessons.module_id = modules.id 
       WHERE lessons.course_id = ? 
       ORDER BY lessons.order_index`,
      [courseId]
    );
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching all lessons:", error);
    res.status(500).json({ error: "Unable to fetch lessons" });
  }
};

// Trong hàm getLessonsByModuleId
exports.getLessonsByModuleId = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const [lessons] = await pool.query(
      `SELECT lessons.*, modules.title as module_name 
       FROM lessons 
       LEFT JOIN modules ON lessons.module_id = modules.id 
       WHERE lessons.module_id = ? 
       ORDER BY lessons.order_index`,
      [moduleId]
    );
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Unable to fetch lessons" });
  }
};
// Lấy tất cả bài học theo khóa học ID
exports.getLessonsByModuleId = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const [lessons] = await pool.query(
      "SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index",
      [moduleId]
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
    const { module_id, title, content, description, video_url, order_index } =
      req.body;

    // Chèn bài học
    const result = await pool.query(
      "INSERT INTO lessons (course_id, module_id, title, content, description, video_url, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [courseId, module_id, title, content, description, video_url, order_index]
    );

    // Lấy ID bài học vừa chèn
    const newLessonId = result.insertId;

    // Truy vấn để lấy thông tin bài học vừa chèn (không bao gồm thời gian)
    const [newLesson] = await pool.query(
      "SELECT id, course_id, module_id, title, content, description, video_url, order_index FROM lessons WHERE id = ?",
      [newLessonId]
    );

    // Trả về thông tin bài học vừa thêm (không bao gồm thời gian)
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
    const { module_id, title, content, description, video_url, order_index } =
      req.body;

    const [updatedLesson] = await pool.query(
      "UPDATE lessons SET module_id = ?, title = ?, content = ?, description = ?, video_url = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND course_id = ?",
      [
        module_id,
        title,
        content,
        description,
        video_url,
        order_index,
        lessonId,
        courseId,
      ]
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
