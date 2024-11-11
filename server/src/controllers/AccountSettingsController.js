const pool = require("../config/pool");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, bio } = req.body;

    console.log("ID người dùng:", userId); // Log ID người dùng
    console.log("Dữ liệu nhận được:", { username, email, bio }); // Log dữ liệu nhận được từ client

    const updateQuery = `
      UPDATE users
      SET username = ?,
          email = ?,
          bio = COALESCE(?, bio),
          updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await pool.query(updateQuery, [
      username,
      email,
      bio,
      userId,
    ]);

    console.log("Kết quả truy vấn cập nhật:", result); // Log kết quả truy vấn

    if (result.affectedRows === 0) {
      console.log("Không tìm thấy người dùng để cập nhật");
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng để cập nhật",
      });
    }

    const [updatedUser] = await pool.query(
      "SELECT id, username, email, bio, role FROM users WHERE id = ?",
      [userId]
    );

    console.log("Dữ liệu người dùng đã cập nhật:", updatedUser[0]); // Log dữ liệu người dùng sau khi cập nhật

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công",
      data: updatedUser[0],
    });
  } catch (error) {
    console.error("Lỗi trong quá trình cập nhật người dùng:", error); // Log lỗi
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thông tin người dùng",
      error: error.message,
    });
  }
};
