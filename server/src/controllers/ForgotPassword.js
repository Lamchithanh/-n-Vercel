const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailService");
const pool = require("../config/pool"); // Kết nối tới cơ sở dữ liệu

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Tìm người dùng qua email
    const [userRows] = await pool
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // Hạn token là 1 giờ

    // Lưu token và thời gian hết hạn vào cơ sở dữ liệu
    await pool
      .promise()
      .query(
        "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
        [resetToken, resetTokenExpiry, email]
      );

    // Gửi email đặt lại mật khẩu
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: "Đã gửi email đặt lại mật khẩu." });
  } catch (error) {
    console.error("Lỗi trong quá trình quên mật khẩu:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
  }
};
