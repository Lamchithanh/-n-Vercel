const pool = require("../config/pool");

// Lấy tất cả bài viết
const getAllPosts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM BlogSection");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu bài viết", error });
  }
};

// Lấy một bài viết theo ID
const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM BlogSection WHERE id = ?", [
      id,
    ]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Bài viết không tồn tại" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu bài viết", error });
  }
};

const logError = (error, context) => {
  console.error(`[${context}] Error Details:`, {
    message: error.message,
    stack: error.stack,
    code: error.code,
    sqlMessage: error.sqlMessage,
    sqlState: error.sqlState,
    timestamp: new Date().toISOString(),
  });
};

// Validate post data
const validatePostData = (data) => {
  const errors = [];

  if (!data.title?.trim()) {
    errors.push("Title is required");
  }

  if (!data.excerpt?.trim()) {
    errors.push("Excerpt is required");
  }

  if (!data.date) {
    errors.push("Date is required");
  } else {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push("Invalid date format. Use YYYY-MM-DD");
    }
  }

  return errors;
};

// Thêm bài viết mới với xử lý lỗi chi tiết
const addPost = async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const { title, excerpt, date, image } = req.body;

    // Validate input data
    const validationErrors = validatePostData({ title, excerpt, date, image });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: validationErrors,
      });
    }

    // Check database connection
    const connection = await pool.getConnection();
    try {
      // Start transaction
      await connection.beginTransaction();

      // Log the SQL query and parameters
      console.log("Executing SQL with parameters:", {
        title,
        excerpt,
        date,
        image: image || null,
      });

      const [result] = await connection.query(
        "INSERT INTO BlogSection (title, excerpt, date, image) VALUES (?, ?, ?, ?)",
        [title, excerpt, date, image || null]
      );

      // Commit the transaction
      await connection.commit();

      console.log("Insert successful:", result);

      res.status(201).json({
        id: result.insertId,
        title,
        excerpt,
        date,
        image: image || null,
      });
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    logError(error, "addPost");

    // Handle specific MySQL errors
    switch (error.code) {
      case "ER_NO_SUCH_TABLE":
        return res.status(500).json({
          message: "Lỗi cấu trúc database",
          detail: "Bảng BlogSection không tồn tại",
        });

      case "ER_BAD_FIELD_ERROR":
        return res.status(500).json({
          message: "Lỗi cấu trúc database",
          detail: "Có cột không tồn tại trong bảng",
        });

      case "ER_TRUNCATED_WRONG_VALUE":
        return res.status(400).json({
          message: "Lỗi định dạng dữ liệu",
          detail: "Giá trị ngày tháng không hợp lệ",
        });

      case "ER_DATA_TOO_LONG":
        return res.status(400).json({
          message: "Lỗi dữ liệu",
          detail: "Dữ liệu vượt quá độ dài cho phép",
        });

      default:
        return res.status(500).json({
          message: "Lỗi khi thêm bài viết",
          detail: error.sqlMessage || error.message,
        });
    }
  }
};
// Cập nhật bài viết
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, excerpt, date, image } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE BlogSection SET title = ?, excerpt = ?, date = ?, image = ? WHERE id = ?",
      [title, excerpt, date, image, id]
    );
    if (result.affectedRows > 0) {
      res.json({ id, title, excerpt, date, image });
    } else {
      res.status(404).json({ message: "Bài viết không tồn tại" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật bài viết", error });
  }
};

// Xóa bài viết
const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM BlogSection WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows > 0) {
      res.json({ message: "Bài viết đã được xóa" });
    } else {
      res.status(404).json({ message: "Bài viết không tồn tại" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa bài viết", error });
  }
};

module.exports = { getAllPosts, getPostById, addPost, updatePost, deletePost };
