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

exports.getMyCourses = async (req, res) => {
  const { userId } = req.params; // Lấy userId từ params

  try {
    const query = `
      SELECT courses.*
      FROM courses
      JOIN enrollments ON courses.id = enrollments.course_id
      WHERE enrollments.user_id = ?;
    `;
    const [courses] = await pool.query(query, [userId]);
    res.json(courses);
  } catch (error) {
    console.error("Error fetching my courses:", error);
    res.status(500).json({ message: "Không thể tải khóa học cá nhân." });
  }
};

// Thêm khóa học mới
exports.addCourse = (req, res) => {
  const {
    title,
    description,
    instructor_id,
    price,
    level,
    category,
    image,
    intro_video_url,
  } = req.body;

  const query = `
        INSERT INTO courses (title, description, instructor_id, price, level, category, image, intro_video_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    title,
    description,
    instructor_id,
    price,
    level,
    category,
    image,
    intro_video_url,
  ];

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
      image,
    });
  });
};

// Cập nhật thông tin khóa học
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    instructor_id,
    price,
    level,
    category,
    image,
    intro_video_url,
  } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid course ID" });
  }

  const query = `
        UPDATE courses
        SET title = ?, description = ?, instructor_id = ?, price = ?, level = ?, category = ?, image = ?, intro_video_url = ?
        WHERE id = ?
    `;

  const values = [
    title,
    description,
    instructor_id,
    price,
    level,
    category,
    image,
    intro_video_url,
    id,
  ];

  try {
    const [results] = await pool.query(query, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const [updatedCourse] = await pool.query(
      "SELECT * FROM courses WHERE id = ?",
      [id]
    );
    res.status(200).json(updatedCourse[0]);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Xóa khóa học
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid course ID" });
  }

  const query = `DELETE FROM courses WHERE id = ?`;

  try {
    const [results] = await pool.query(query, [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.searchCourses = async (req, res) => {
  try {
    const { query } = req.query;

    let sql = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.level,
        c.category,
        c.image,
        u.username AS instructor_name,
        COALESCE(AVG(cr.rating), 0) AS average_rating,
        COUNT(DISTINCT e.id) AS total_students
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN course_reviews cr ON c.id = cr.course_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE 1=1
    `;

    const params = [];

    if (query) {
      sql += ` AND (
        c.title LIKE ? 
        OR c.description LIKE ? 
        OR c.category LIKE ?
      )`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ` GROUP BY c.id, c.title, c.description, c.price, c.level, c.category, c.image, u.username`;

    const [results] = await pool.query(sql, params);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm khóa học",
    });
  }
};
// Thêm vào courseController.js

exports.getProgress = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const query = `
      SELECT 
        lesson_id, 
        watched, 
        watched_duration
      FROM video_progress 
      WHERE user_id = ? AND course_id = ?
    `;

    const [progress] = await pool.query(query, [userId, courseId]);

    // Format lại data
    const formattedProgress = progress.map((item) => ({
      lessonId: item.lesson_id,
      watched: item.watched === 1, // Convert 1/0 to true/false
      watchedDuration: item.watched_duration || 0,
    }));

    res.json(formattedProgress);
  } catch (error) {
    console.error("Lỗi khi lấy tiến độ:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateProgress = async (req, res) => {
  const { userId, lessonId, watched, watchedDuration } = req.body;

  // Thêm validation
  if (!userId || !lessonId || typeof watchedDuration !== "number") {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }

  try {
    // Thêm lock để tránh race condition
    await pool.query("START TRANSACTION");

    // Lấy thông tin course_id và module_id
    const [lessonInfo] = await pool.query(
      `SELECT course_id, module_id, duration FROM lessons WHERE id = ?`,
      [lessonId]
    );

    if (lessonInfo.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ message: "Bài học không tồn tại" });
    }

    const { course_id, module_id, duration } = lessonInfo[0];

    // Kiểm tra tiến độ hiện tại
    const [currentProgress] = await pool.query(
      `SELECT watched_duration, watched 
       FROM video_progress 
       WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );

    if (currentProgress.length > 0) {
      // Cập nhật nếu có tiến độ mới cao hơn
      const updateQuery = `
        UPDATE video_progress 
        SET 
          watched_duration = GREATEST(?, COALESCE(watched_duration, 0)),
          watched = GREATEST(?, COALESCE(watched, 0)),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND lesson_id = ?
      `;

      await pool.query(updateQuery, [
        watchedDuration,
        watched ? 1 : 0,
        userId,
        lessonId,
      ]);
    } else {
      // Thêm mới nếu chưa có tiến độ
      const insertQuery = `
        INSERT INTO video_progress 
          (user_id, lesson_id, watched, watched_duration, course_id, module_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await pool.query(insertQuery, [
        userId,
        lessonId,
        watched ? 1 : 0,
        watchedDuration,
        course_id,
        module_id,
      ]);
    }

    await pool.query("COMMIT");
    res.json({ message: "Cập nhật tiến độ thành công" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Lỗi khi cập nhật tiến độ:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật tiến độ" });
  }
};
