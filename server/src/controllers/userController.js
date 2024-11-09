const pool = require("../config/pool"); // Đảm bảo rằng đường dẫn này đúng
const connection = require("../config/pool"); // Import kết nối cơ sở dữ liệu
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // Thư viện để hash mật khẩu
const cron = require("node-cron");

// Cron job chạy mỗi phút kiểm tra các tài khoản bị khóa
exports.startCronJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      const [result] = await pool.query(
        `UPDATE users 
         SET isLocked = FALSE,
             lockReason = NULL,
             lockedAt = NULL,
             lockedUntil = NULL
         WHERE isLocked = TRUE 
         AND lockedUntil IS NOT NULL 
         AND lockedUntil < ?`,
        [now]
      );

      if (result.affectedRows > 0) {
        console.log(`${result.affectedRows} tài khoản đã được tự động mở khóa`);
      }
    } catch (error) {
      console.error("Lỗi khi tự động mở khóa tài khoản:", error);
    }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results] = await pool.query(
      "SELECT id, username, email, role, password_hash, isLocked, lockReason, lockedAt, lockedUntil FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Người dùng không tồn tại" });
    }

    const user = results[0];

    // Kiểm tra trạng thái khóa
    // Kiểm tra trạng thái khóa
    if (user.isLocked === 1) {
      const now = new Date();
      const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil) : null;

      // Kiểm tra nếu tài khoản đang bị khóa
      if (!lockedUntil || now < lockedUntil) {
        // Định dạng thời gian mở khóa
        const lockUntilFormatted = lockedUntil
          ? new Date(lockedUntil.getTime() + 7 * 60 * 60 * 1000).toLocaleString(
              "vi-VN",
              {
                timeZone: "Asia/Ho_Chi_Minh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // Sử dụng định dạng 24 giờ
              }
            )
          : "vĩnh viễn";

        // Format thời gian bị khóa
        const lockedAtFormatted = user.lockedAt
          ? new Date(
              new Date(user.lockedAt).getTime() + 7 * 60 * 60 * 1000
            ).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : null;

        return res.status(403).json({
          error: "Tài khoản bị khóa",
          lockInfo: {
            isLocked: true,
            reason: user.lockReason || "Không có lý do cụ thể",
            lockedAt: lockedAtFormatted
              ? new Date(user.lockedAt).toISOString()
              : null,
            lockedUntil: lockedUntil ? lockedUntil.toISOString() : null,
            formattedLockedUntil: lockUntilFormatted,
          },
        });
      }

      // Nếu đã hết thời gian khóa, để cho cron job xử lý việc mở khóa
      // KHÔNG tự động mở khóa tại đây
      if (lockedUntil && now >= lockedUntil) {
        return res.status(403).json({
          error:
            "Tài khoản đang trong quá trình được mở khóa. Vui lòng thử lại sau ít phút.",
        });
      }
    }

    // Kiểm tra mật khẩu
    if (user.password_hash !== password) {
      return res.status(401).json({ error: "Mật khẩu không đúng" });
    }

    // Tạo token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        isLocked: user.isLocked === 1,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isLocked: user.isLocked === 1,
        lockInfo:
          user.isLocked === 1
            ? {
                reason: user.lockReason,
                lockedUntil: user.lockedUntil,
              }
            : null,
      },
      message: "Đăng nhập thành công!",
    });
  } catch (err) {
    console.error("Database query error: ", err);
    return res.status(500).json({ error: "Đã xảy ra lỗi. Vui lòng thử lại." });
  }
};

// truy xuất và đăng ký
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Kiểm tra xem có đầy đủ dữ liệu không
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "Tất cả các trường đều bắt buộc!" });
    }

    // Kiểm tra xem tên người dùng đã tồn tại chưa
    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ error: "Tên người dùng hoặc email đã tồn tại!" });
    }

    // Chèn người dùng mới vào cơ sở dữ liệu
    const result = await connection.query(
      `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [username, email, password, role]
    );

    return res.status(201).json({ message: "Đăng ký người dùng thành công!" });
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng: ", error); // In ra lỗi chi tiết
    return res.status(500).json({ error: "Lỗi nội bộ máy chủ" });
  }
};

// Đảm bảo kết nối database đã được import

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Kiểm tra xem tất cả các trường có giá trị không
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Tạo người dùng mới
    const newUser = {
      username,
      email,
      password_hash: password, // Không băm mật khẩu
      role,
    };

    // Lưu người dùng vào cơ sở dữ liệu
    // Giả sử bạn có một hàm để thêm người dùng vào cơ sở dữ liệu
    await pool.query("INSERT INTO users SET ?", newUser);

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Unable to create user" });
  }
};

exports.toggleUserLock = async (req, res) => {
  try {
    const { id } = req.params;
    const { isLocked, lockReason, duration } = req.body;

    // Thống nhất durationMap với frontend
    let lockedUntil = null;
    const now = new Date();

    if (isLocked && duration) {
      const durationMap = {
        "1p": 60 * 1000, // 1 minute
        "1h": 60 * 60 * 1000, // 1 hour
        "24h": 24 * 60 * 60 * 1000, // 24 hours
        "7d": 7 * 24 * 60 * 60 * 1000, // 7 days
        "30d": 30 * 24 * 60 * 60 * 1000, // 30 days
      };

      if (duration !== "permanent" && durationMap[duration]) {
        lockedUntil = new Date(now.getTime() + durationMap[duration]);
      }
    }

    // Format datetime cho MySQL
    const mysqlDatetime = (date) =>
      date ? date.toISOString().slice(0, 19).replace("T", " ") : null;

    // Cập nhật trạng thái khóa
    const [result] = await pool.query(
      `UPDATE users 
       SET isLocked = ?,
           lockReason = ?,
           lockedAt = ?,
           lockedUntil = ?
       WHERE id = ?`,
      [
        isLocked,
        isLocked ? lockReason : null,
        isLocked ? mysqlDatetime(now) : null,
        isLocked ? mysqlDatetime(lockedUntil) : null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    // Trả về thêm thông tin về thời gian khóa để frontend cập nhật chính xác
    res.status(200).json({
      success: true,
      message: `Tài khoản ${
        isLocked ? "đã bị khóa" : "đã được mở khóa"
      } thành công`,
      data: {
        isLocked,
        lockReason,
        lockedAt: mysqlDatetime(now),
        lockedUntil: mysqlDatetime(lockedUntil),
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái khóa:", error);
    res
      .status(500)
      .json({ error: "Không thể cập nhật trạng thái khóa tài khoản" });
  }
};

// Hàm lấy danh sách người dùng
exports.getAllUsers = async (req, res) => {
  try {
    // Đầu tiên tự động mở khóa các tài khoản hết hạn
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    await pool.query(
      `UPDATE users 
       SET isLocked = FALSE,
           lockReason = NULL,
           lockedAt = NULL,
           lockedUntil = NULL
       WHERE isLocked = TRUE 
       AND lockedUntil IS NOT NULL 
       AND lockedUntil < ?`,
      [now]
    );

    // Sau đó lấy danh sách users đã được cập nhật
    const [users] = await pool.query(
      `SELECT id, username, email, role, avatar, 
              isLocked, lockReason, lockedAt, lockedUntil,
              created_at, updated_at
       FROM users 
       WHERE role != 'admin'`
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res
      .status(500)
      .json({ message: "Lỗi server, không thể lấy danh sách người dùng." });
  }
};
exports.logout = (req, res) => {
  // Implement logout logic here
};

// Tạo hàm getUserProfile để lấy thông tin người dùng
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [results] = await pool.query(
      "SELECT id, username, email, role, isLocked, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?",
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    const user = results[0];
    res.status(200).json({ user });
  } catch (err) {
    console.error("Database query error:", err);
    return res.status(500).json({ error: "Đã xảy ra lỗi. Vui lòng thử lại." });
  }
};

// New function: Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    // Check if user exists
    const [userExists] = await pool.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);

    if (userExists.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    // Update user information
    const [result] = await pool.query(
      "UPDATE users SET username = ?, email = ?, role = ?, updated_at = NOW() WHERE id = ?",
      [username, email, role, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ error: "Không thể cập nhật thông tin người dùng" });
    }

    res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    res.status(500).json({
      error: "Lỗi server, không thể cập nhật thông tin người dùng",
    });
  }
};

// New function: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [userExists] = await pool.query("SELECT * FROM users WHERE id = ?", [
      id,
    ]);

    if (userExists.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    // Delete user
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Không thể xóa người dùng" });
    }

    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    res.status(500).json({ error: "Lỗi server, không thể xóa người dùng" });
  }
};

// changePassword

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực

  try {
    const user = await User.findById(userId); // Tìm người dùng trong cơ sở dữ liệu

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu cũ không đúng." });
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới vào cơ sở dữ liệu
    user.password_hash = hashedNewPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Mật khẩu đã được đổi thành công!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
    });
  }
};
