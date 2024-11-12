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
// Thêm vào courseController.js

exports.getProgress = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    // Chỉ lấy các bài học đã xem của user trong khóa học
    const query = `
      SELECT * FROM video_progress 
      WHERE user_id = ? AND course_id = ?
    `;

    const [progress] = await pool.query(query, [userId, courseId]);

    // Format lại data trước khi trả về
    const formattedProgress = progress.map((item) => ({
      lessonId: item.lesson_id,
      watched: item.watched === 1, // Convert 1/0 to true/false
    }));

    res.json(formattedProgress);
  } catch (error) {
    console.error("Lỗi khi lấy tiến độ:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateProgress = async (req, res) => {
  const { userId, lessonId, watched, watchedDuration } = req.body;
  console.log(
    `Yêu cầu cập nhật tiến độ cho userId: ${userId}, lessonId: ${lessonId}, watched: ${watched}, watchedDuration: ${watchedDuration}`
  ); // Log dữ liệu yêu cầu

  try {
    // Lấy thông tin course_id và module_id từ bảng lessons
    const getCourseAndModuleQuery = `
      SELECT course_id, module_id
      FROM lessons
      WHERE id = ?
    `;
    const [lessonInfo] = await pool.query(getCourseAndModuleQuery, [lessonId]);

    if (lessonInfo.length === 0) {
      return res.status(400).json({ message: "Bài học không tồn tại" });
    }

    const { course_id, module_id } = lessonInfo[0];

    // Kiểm tra xem tiến độ của bài học này đã tồn tại hay chưa
    const checkProgressQuery = `
      SELECT * FROM video_progress
      WHERE user_id = ? AND lesson_id = ?
    `;
    const [existingProgress] = await pool.query(checkProgressQuery, [
      userId,
      lessonId,
    ]);

    if (existingProgress.length > 0) {
      // Nếu bản ghi tồn tại, kiểm tra nếu có thay đổi thì cập nhật
      const currentProgress = existingProgress[0];

      // So sánh watched và watched_duration để quyết định có cập nhật không
      if (
        currentProgress.watched !== watched ||
        currentProgress.watched_duration !== watchedDuration
      ) {
        const updateQuery = `
          UPDATE video_progress
          SET watched = ?, watched_duration = ?
          WHERE user_id = ? AND lesson_id = ?
        `;
        await pool.query(updateQuery, [
          watched,
          watchedDuration,
          userId,
          lessonId,
        ]);
        console.log(
          `Cập nhật tiến độ thành công cho userId: ${userId}, lessonId: ${lessonId}`
        );
      } else {
        console.log(
          `Không cần cập nhật tiến độ cho userId: ${userId}, lessonId: ${lessonId}`
        );
      }
    } else {
      // Nếu chưa có tiến độ, chèn mới
      const insertQuery = `
        INSERT INTO video_progress (user_id, lesson_id, watched, watched_duration, course_id, module_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await pool.query(insertQuery, [
        userId,
        lessonId,
        watched,
        watchedDuration,
        course_id,
        module_id,
      ]);
      console.log(
        `Thêm mới tiến độ thành công cho userId: ${userId}, lessonId: ${lessonId}`
      );
    }

    res.json({ message: "Cập nhật tiến độ thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật tiến độ:", error); // Log lỗi nếu có
    res.status(500).json({ message: "Lỗi khi cập nhật tiến độ" });
  }
};
