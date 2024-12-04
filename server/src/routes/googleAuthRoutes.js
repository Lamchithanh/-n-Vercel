const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise"); // Thêm dòng này
const { pool } = require("../config/pool");
const router = express.Router();

// Google OAuth Client
const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

router.post("/users/google-login", async (req, res) => {
  const { credential } = req.body;
  console.log("Received Google Credential:", credential); // Logging để debug

  if (!credential) {
    return res.status(400).json({
      error: "Google login failed",
      details: "No credential provided",
    });
  }

  let connection;
  try {
    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Google Payload:", payload); // Logging để debug

    const { sub: googleId, email, name, picture } = payload;

    // Validate extracted data
    if (!googleId || !email) {
      return res.status(400).json({
        error: "Google login failed",
        details: "Invalid Google payload",
      });
    }

    // Sử dụng pool.promise() nếu dùng mysql2/promise
    connection = await pool.promise().getConnection();

    // Sử dụng execute thay vì query
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE google_id = ? OR google_email = ?",
      [googleId, email]
    );

    let user;
    if (existingUsers.length > 0) {
      // Update existing user
      user = existingUsers[0];
      await connection.execute(
        "UPDATE users SET google_name = ?, avatar = ? WHERE id = ?",
        [name, picture, user.id]
      );
    } else {
      // Create new user
      const defaultPassword = bcrypt.hashSync(googleId, 10);
      const [result] = await connection.execute(
        `INSERT INTO users 
        (username, email, password_hash, role, google_id, google_name, google_email, avatar) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          email,
          defaultPassword,
          "student", // Default role
          googleId,
          name,
          email,
          picture,
        ]
      );

      // Fetch the newly created user
      const [newUsers] = await connection.execute(
        "SELECT * FROM users WHERE id = ?",
        [result.insertId]
      );
      user = newUsers[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        is_first_login: user.is_first_login,
      },
      token,
    });
  } catch (error) {
    console.error("Detailed Google Login Error:", error); // Logging chi tiết lỗi
    res.status(400).json({
      error: "Google login failed",
      details: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
