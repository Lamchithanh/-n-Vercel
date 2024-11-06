const pool = require("../config/pool");
const path = require("path");
const fs = require("fs");

// Format datetime để phù hợp với MySQL
const formatMySQLDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

// Get all certificates with user and course information
exports.getCertificates = async (req, res) => {
  try {
    const [results] = await pool.query(`
        SELECT 
          c.*,
          u.username as user_name,
          cs.title as course_title
        FROM certificates c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN courses cs ON c.course_id = cs.id
        ORDER BY c.issued_at DESC
      `);

    res.status(200).json(results);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

// Create new certificate
exports.createCertificate = async (req, res) => {
  const { user_id, course_id, issued_at } = req.body;

  try {
    // Validate input
    if (!user_id || !course_id || !issued_at) {
      return res.status(400).json({
        error: "Bad request",
        message: "Missing required fields",
      });
    }

    // Format datetime
    const formattedDate = formatMySQLDateTime(issued_at);

    // Insert new certificate
    const [result] = await pool.query(
      `INSERT INTO certificates 
          (user_id, course_id, issued_at) 
         VALUES (?, ?, ?)`,
      [user_id, course_id, formattedDate]
    );

    // Get the created certificate
    const [newCertificate] = await pool.query(
      "SELECT * FROM certificates WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newCertificate[0]);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};

// Delete certificate by ID
exports.deleteCertificate = async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem chứng chỉ có tồn tại không
    const [results] = await pool.query(
      "SELECT * FROM certificates WHERE id = ?",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        error: "Not found",
        message: "Certificate not found",
      });
    }

    // Xóa chứng chỉ
    await pool.query("DELETE FROM certificates WHERE id = ?", [id]);

    res.status(200).json({
      message: "Certificate deleted successfully",
    });
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};
