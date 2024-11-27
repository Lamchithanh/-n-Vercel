const pool = require("../config/pool"); // Kết nối tới cơ sở dữ liệu

// đăng ký khóa học
const enrollCourse = async (req, res) => {
  const { userId, courseId, status = "enrolled" } = req.body; // Lấy status từ body, mặc định là 'enrolled'

  console.log("userId:", userId, "courseId:", courseId, "status:", status); // Thêm log

  try {
    // Insert vào bảng enrollments, lưu ý thêm cột status và mặc định là 'enrolled'
    const result = await pool.query(
      "INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, ?)",
      [userId, courseId, status] // Đảm bảo truyền vào đúng tham số
    );
    res
      .status(201)
      .json({ message: "Đăng ký thành công!", enrollmentId: result.insertId });
  } catch (error) {
    console.error(error); // In ra lỗi
    res.status(500).json({ error: "Lỗi khi đăng ký khóa học." });
  }
};

// Lấy danh sách khóa học đã đăng ký của người dùng
const getEnrollments = async (req, res) => {
  const { userId } = req.params;

  try {
    const [enrollments] = await pool.query(
      `SELECT 
        e.*,
        c.title,
        c.description,
        c.image,
        c.price
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?`,
      [userId]
    );

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi lấy thông tin đăng ký." });
  }
};
// Controller trả về khóa học đã format
const getMyCourses = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      error: "Không tìm thấy thông tin người dùng",
    });
  }

  try {
    // Kiểm tra user có tồn tại không
    const [user] = await pool.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({
        error: "Không tìm thấy thông tin người dùng",
      });
    }

    const [enrollments] = await pool.query(
      `SELECT 
        e.id AS enrollment_id,
        e.user_id,
        e.created_at AS enrollment_date,
        e.completed_at,
        c.id AS course_id,
        c.title AS course_title,
        c.description AS course_description,
        c.image AS course_image,
        c.price AS course_price,
        c.level AS course_level,
        c.status AS course_status,
        c.created_at AS course_created_at,
        COALESCE(
          (SELECT COUNT(*) 
           FROM course_lessons cl 
           WHERE cl.course_id = c.id), 0
        ) as total_lessons,
        COALESCE(
          (SELECT COUNT(*) 
           FROM lesson_progress lp 
           WHERE lp.user_id = e.user_id 
           AND lp.course_id = c.id 
           AND lp.completed = true), 0
        ) as completed_lessons
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.created_at DESC`,
      [userId]
    );

    // Format lại dữ liệu cho frontend
    const formattedEnrollments = enrollments.map((enrollment) => ({
      id: enrollment.enrollment_id,
      user_id: enrollment.user_id,
      created_at: enrollment.enrollment_date,
      completed_at: enrollment.completed_at,
      progress: {
        total_lessons: enrollment.total_lessons,
        completed_lessons: enrollment.completed_lessons,
        percentage:
          enrollment.total_lessons > 0
            ? Math.round(
                (enrollment.completed_lessons / enrollment.total_lessons) * 100
              )
            : 0,
      },
      course: {
        id: enrollment.course_id,
        title: enrollment.course_title,
        description: enrollment.course_description,
        image: enrollment.course_image,
        price: parseFloat(enrollment.course_price) || 0,
        level: enrollment.course_level,
        status: enrollment.course_status,
        created_at: enrollment.course_created_at,
      },
    }));

    return res.status(200).json(formattedEnrollments);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({
      error: "Lỗi khi lấy thông tin khóa học đã đăng ký.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Đánh dấu khóa học là đã hoàn thành
const completeCourse = async (req, res) => {
  const { id } = req.params; // ID của bản ghi đăng ký

  try {
    const result = await pool.query(
      "UPDATE enrollments SET completed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy bản ghi." });
    }

    res.json({ message: "Đánh dấu hoàn thành khóa học thành công!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái hoàn thành." });
  }
};

const getTopEnrolledCourses = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.title,
        c.image,
        c.price,
        c.level,
        COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, c.title, c.image, c.price, c.level
      ORDER BY enrollment_count DESC
      LIMIT 6
    `;

    const [courses] = await pool.query(query);

    if (!courses || courses.length === 0) {
      return res.status(200).json({
        success: true,
        courses: [],
      });
    }

    return res.status(200).json({
      success: true,
      courses: courses.map((course) => ({
        ...course,
        price: parseFloat(course.price) || 0,
        enrollment_count: parseInt(course.enrollment_count) || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching top enrolled courses:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách khóa học",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getEnrollmentStatus = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT status FROM enrollments WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    if (rows.length > 0) {
      // Check enrollment status of the user
      if (rows[0].status === "enrolled") {
        return res.status(200).json("enrolled"); // Currently taking the course
      } else if (rows[0].status === "completed") {
        return res.status(200).json("completed"); // Completed the course
      } else if (rows[0].status === "dropped") {
        return res.status(200).json("dropped"); // Dropped the course
      }
    }

    // If no enrollment found
    return res.status(200).json("not_enrolled"); // Not enrolled in the course
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error checking enrollment status" });
  }
};

module.exports = {
  getTopEnrolledCourses,
  enrollCourse,
  getEnrollments,
  completeCourse,
  getMyCourses,
  getEnrollmentStatus,
};
