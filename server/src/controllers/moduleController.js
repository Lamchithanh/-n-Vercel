const pool = require("../config/pool");

// Lấy danh sách module theo khóa học
const getModulesByCourse = async (req, res) => {
  try {
    const [modules] = await pool.query(
      "SELECT * FROM modules WHERE course_id = ? ORDER BY order_index",
      [req.params.courseId]
    );
    res.json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error.message); // In ra thông báo lỗi chi tiết
    res.status(500).json({ message: "Internal server error" });
  }
};

// Thêm module mới vào khóa học
const createModule = async (req, res) => {
  try {
    const { course_id, title, order_index } = req.body;

    // Kiểm tra khóa học có tồn tại không
    const [courseExists] = await pool.query(
      "SELECT * FROM courses WHERE id = ?",
      [course_id]
    );
    if (courseExists.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Insert module
    const [result] = await pool.query(
      "INSERT INTO modules (course_id, title, order_index) VALUES (?, ?, ?)",
      [course_id, title, order_index || 1] // default order_index if not provided
    );

    res.status(201).json({
      id: result.insertId,
      course_id,
      title,
      order_index: order_index || 1,
    });
  } catch (error) {
    console.error("Error creating module:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật thông tin module
const updateModule = async (req, res) => {
  try {
    const { title, order_index } = req.body;
    await pool.query(
      "UPDATE modules SET title = ?, order_index = ? WHERE id = ?",
      [title, order_index, req.params.id]
    );
    res.json({ message: "Module updated successfully" });
  } catch (error) {
    console.error("Error updating module:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Xóa module
const deleteModule = async (req, res) => {
  try {
    const moduleId = req.params.id;

    // Xóa các bài học liên quan đến module
    await pool.query("DELETE FROM lessons WHERE module_id = ?", [moduleId]);

    // Xóa module
    await pool.query("DELETE FROM modules WHERE id = ?", [moduleId]);

    res.json({ message: "Module and associated lessons deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getModulesByCourse,
  createModule,
  updateModule,
  deleteModule,
};
