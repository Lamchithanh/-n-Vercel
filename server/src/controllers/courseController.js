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

// exports.getMyCourses = async (req, res) => {
//   try {
//     const userId = req.query.user_id || req.body.user_id || 1; // Có thể truyền trực tiếp user_id
//     const query = `
//       SELECT courses.*
//       FROM courses
//       JOIN enrollments ON courses.id = enrollments.course_id
//       WHERE enrollments.user_id = ?;
//     `;
//     const [courses] = await pool.query(query, [userId]);
//     res.json(courses);
//   } catch (error) {
//     console.error("Error fetching my courses:", error);
//     res.status(500).json({ message: "Không thể tải khóa học cá nhân." });
//   }
// };

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
    const { query, category, level } = req.query;

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
      sql += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`);
    }

    if (category && category !== "all") {
      sql += ` AND c.category = ?`;
      params.push(category);
    }

    if (level && level !== "all") {
      sql += ` AND c.level = ?`;
      params.push(level);
    }

    sql += ` GROUP BY c.id, c.title, c.description, c.price, c.level, c.category, c.image, u.username`;

    // Sử dụng pool để thực hiện truy vấn
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
