const pool = require("../config/pool");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email } = req.body;

    // Đầu tiên lấy thông tin user hiện tại để lấy role
    const currentUserQuery = "SELECT role FROM users WHERE id = ?";
    const [currentUser] = await pool.query(currentUserQuery, [userId]);

    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Sử dụng role hiện tại của user
    const currentRole = currentUser[0].role;

    // Cập nhật user với role hiện tại
    const updateQuery = `
        UPDATE users 
        SET username = ?, 
            email = ?, 
            role = ?, 
            updated_at = NOW() 
        WHERE id = ?
      `;

    const [result] = await pool.query(updateQuery, [
      username,
      email,
      currentRole, // Sử dụng role hiện tại thay vì để null
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng để cập nhật",
      });
    }

    // Lấy thông tin user sau khi cập nhật
    const [updatedUser] = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công",
      data: updatedUser[0],
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thông tin người dùng",
      error: error.message,
    });
  }
};
