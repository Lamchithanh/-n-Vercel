const pool = require("../config/pool");

// Lấy tất cả khóa học
exports.getAllCourses = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM courses");
    res.status(200).json(results);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

// Hàm lấy khóa học theo ID
exports.getCourseById = async (req, res) => {
  const courseId = req.params.id;
  try {
    const [course] = await pool.query("SELECT * FROM courses WHERE id = ?", [
      courseId,
    ]);
    if (course.length > 0) {
      res.json(course[0]);
    } else {
      res.status(404).json({ message: "Khóa học không tìm thấy." });
    }
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin khóa học." });
  }
};

// Thêm khóa học mới
exports.addCourse = (req, res) => {
  const { title, description, instructor_id, price, level, category } =
    req.body;

  const query = `
        INSERT INTO courses (title, description, instructor_id, price, level, category)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  const values = [title, description, instructor_id, price, level, category];

  pool.query(query, values, (err, results) => {
    if (err) {
      console.error("Error adding course:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.status(201).json({
      id: results.insertId,
      title,
      description,
      instructor_id,
      price,
      level,
      category,
    }); // Trả về khóa học vừa được thêm
  });
};

// Cập nhật thông tin khóa học
exports.updateCourse = (req, res) => {
  const { id } = req.params; // Thay đổi ở đây
  const { title, description, instructor_id, price, level, category } =
    req.body;

  const query = `
        UPDATE courses
        SET title = ?, description = ?, instructor_id = ?, price = ?, level = ?, category = ?
        WHERE id = ?
    `;

  const values = [
    title,
    description,
    instructor_id,
    price,
    level,
    category,
    id, // Sử dụng id ở đây
  ];

  pool.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating course:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Lấy dữ liệu khóa học sau khi đã cập nhật
    pool.query(
      "SELECT * FROM courses WHERE id = ?",
      [id], // Sử dụng id ở đây
      (err, updatedResults) => {
        if (err) {
          console.error("Error fetching updated course:", err);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json(updatedResults[0]); // Trả về khóa học đã được cập nhật
      }
    );
  });
};

// Xóa khóa học
exports.deleteCourse = (req, res) => {
  const { courseId } = req.params;

  const query = `DELETE FROM courses WHERE id = ?`;

  pool.query(query, [courseId], (err, results) => {
    if (err) {
      console.error("Error deleting course:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json({ message: "Course deleted successfully" });
  });
};

exports.getLessonsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const [lessons] = await pool.execute(
      "SELECT * FROM lessons WHERE course_id = ?",
      [courseId]
    );

    res.json(lessons.rows);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Unable to fetch lessons" });
  }
};

exports.addLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, description, video_url, order_index } = req.body;

    // Thực hiện chèn bài học mà không cần RETURNING
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

exports.updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title, content, description, video_url, order_index } = req.body;
    const updatedLesson = await pool.query(
      "UPDATE lessons SET title = $1, content = $2, description = $3, video_url = $4, order_index = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND course_id = $7 RETURNING *",
      [title, content, description, video_url, order_index, lessonId, courseId]
    );
    res.json(updatedLesson.rows[0]);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ error: "Unable to update lesson" });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    await pool.query("DELETE FROM lessons WHERE id = $1 AND course_id = $2", [
      lessonId,
      courseId,
    ]);
    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ error: "Unable to delete lesson" });
  }
};
