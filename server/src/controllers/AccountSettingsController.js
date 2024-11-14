const pool = require("../config/pool");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, bio, avatar } = req.body;

    console.log("ID người dùng:", userId);
    console.log("Dữ liệu nhận được:", { username, email, bio, avatar });

    const updateQuery = `
      UPDATE users
      SET username = ?,
          email = ?,
          bio = COALESCE(?, bio),
          avatar = ?,
          updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await pool.query(updateQuery, [
      username,
      email,
      bio,
      avatar, // Thêm avatar vào đây
      userId, // userId phải ở cuối cùng để match với WHERE id = ?
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng để cập nhật",
      });
    }

    // Lấy thông tin user đã cập nhật
    const [updatedUser] = await pool.query(
      "SELECT id, username, email, bio, role, avatar FROM users WHERE id = ?",
      [userId]
    );

    // Cập nhật lại localStorage với thông tin mới
    const userData = updatedUser[0];

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công",
      data: userData,
    });
  } catch (error) {
    console.error("Lỗi trong quá trình cập nhật người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thông tin người dùng",
      error: error.message,
    });
  }
};
