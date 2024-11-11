const express = require("express");
const router = express.Router();
const pool = require("../config/pool");

router.post("/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    // Lấy thông tin người dùng từ cơ sở dữ liệu
    const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Kiểm tra mật khẩu cũ
    if (oldPassword !== user.password_hash) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu cũ không chính xác",
      });
    }

    // Cập nhật mật khẩu mới vào cơ sở dữ liệu
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newPassword,
      userId,
    ]);

    return res.json({
      success: true,
      message: "Mật khẩu đã được đổi thành công",
    });
  } catch (err) {
    console.error("Error in change password:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi trong quá trình đổi mật khẩu",
    });
  }
});

module.exports = router;
