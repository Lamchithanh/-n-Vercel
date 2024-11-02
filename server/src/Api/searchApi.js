// controllers/courseController.js

const pool = require("../config/pool"); // Sử dụng pool từ file cấu hình database.js

const searchCourses = async (req, res) => {
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

module.exports = {
  searchCourses,
};
