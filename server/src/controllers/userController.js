const pool = require("../config/pool"); // Đảm bảo rằng đường dẫn này đúng
const connection = require("../config/pool"); // Import kết nối cơ sở dữ liệu
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // Thư viện để hash mật khẩu
const cron = require("node-cron");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

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
      "SELECT id, username, email, role, password_hash, isLocked, lockReason, lockedAt, lockedUntil, is_first_login FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Người dùng không tồn tại" });
    }

    const user = results[0];

    // Kiểm tra trạng thái khóa tài khoản
    if (user.isLocked === 1) {
      const now = new Date();
      const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil) : null;

      if (!lockedUntil || now < lockedUntil) {
        const lockUntilFormatted = lockedUntil
          ? new Date(lockedUntil.getTime() + 7 * 60 * 60 * 1000).toLocaleString(
              "vi-VN",
              { timeZone: "Asia/Ho_Chi_Minh", hour12: false }
            )
          : "vĩnh viễn";

        const lockedAtFormatted = user.lockedAt
          ? new Date(user.lockedAt).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour12: false,
            })
          : null;

        return res.status(403).json({
          error: "Tài khoản bị khóa",
          lockInfo: {
            isLocked: true,
            reason: user.lockReason || "Không có lý do cụ thể",
            lockedAt: lockedAtFormatted,
            lockedUntil: lockUntilFormatted,
          },
        });
      }

      if (lockedUntil && now >= lockedUntil) {
        return res.status(403).json({
          error:
            "Tài khoản đang trong quá trình được mở khóa. Vui lòng thử lại sau ít phút.",
        });
      }
    }

    // Kiểm tra mật khẩu
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Mật khẩu không đúng" });
    }

    // Tạo token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        isLocked: user.isLocked === 1,
        is_first_login: user.is_first_login,
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
        is_first_login: user.is_first_login,
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

    // Mã hóa mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Chèn người dùng mới vào cơ sở dữ liệu
    const result = await connection.query(
      `INSERT INTO users (username, email, password_hash, role, is_first_login) VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, role, true]
    );

    return res.status(201).json({
      message: "Đăng ký người dùng thành công!",
      user: {
        username,
        email,
        role,
        is_first_login: true,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng: ", error);
    return res.status(500).json({ error: "Lỗi nội bộ máy chủ" });
  }
};

// Google Login
// exports.googleLogin = async (req, res) => {
//   // const { tokenId, googleId, googleName, googleEmail } = req.body;
//   const { credential } = req.body;

//   try {
//     // Verify Google Token
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.VITE_GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { sub: googleId, email, name, picture } = payload;

//     let connection;
//     try {
//       connection = await pool.getConnection();

//       // Check if user exists by Google ID or Email
//       const [existingUsers] = await connection.query(
//         "SELECT * FROM users WHERE google_id = ? OR google_email = ?",
//         [googleId, email]
//       );

//       let user;
//       if (existingUsers.length > 0) {
//         // Update existing user
//         user = existingUsers[0];
//         await connection.query(
//           "UPDATE users SET google_name = ?, avatar = ? WHERE id = ?",
//           [name, picture, user.id]
//         );
//       } else {
//         // Create new user
//         const defaultPassword = bcrypt.hashSync(googleId, 10);
//         const [result] = await connection.query(
//           `INSERT INTO users
//           (username, email, password_hash, role, google_id, google_name, google_email, avatar)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             name,
//             email,
//             defaultPassword,
//             "student", // Default role
//             googleId,
//             name,
//             email,
//             picture,
//           ]
//         );

//         // Fetch the newly created user
//         const [newUsers] = await connection.query(
//           "SELECT * FROM users WHERE id = ?",
//           [result.insertId]
//         );
//         user = newUsers[0];
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//         {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//         },
//         process.env.SECRET_KEY,
//         { expiresIn: "7d" }
//       );

//       res.json({
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//           avatar: user.avatar,
//           is_first_login: user.is_first_login,
//         },
//         token,
//       });
//     } finally {
//       if (connection) connection.release();
//     }
//   } catch (error) {
//     console.error("Google Login Error:", error);
//     res
//       .status(400)
//       .json({ error: "Google login failed", details: error.message });
//   }
// };

// Kiểm tra người dùng (cần thiết để kiểm tra email hoặc username đã tồn tại)
exports.checkUserExists = async (email) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
};

// In your Express routes or controller
exports.updateFirstLogin = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      error: "ID người dùng không hợp lệ",
      success: false,
    });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET is_first_login = FALSE WHERE id = ? AND is_first_login = TRUE",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng hoặc trạng thái đã được cập nhật",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Đã cập nhật trạng thái đăng nhập lần đầu",
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đăng nhập:", error);
    return res.status(500).json({
      error: "Không thể cập nhật trạng thái đăng nhập",
      success: false,
    });
  }
};
// Đảm bảo kết nối database đã được import

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Kiểm tra email đã tồn tại hay chưa
    const [existingEmail] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "Email đã được sử dụng!" });
    }

    // Tạo người dùng mới (cho phép username trùng)
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, email, password, role]
    );

    res.status(201).json({ message: "Tạo người dùng thành công!" });
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    res.status(500).json({ error: "Không thể tạo người dùng." });
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
    const userId = req.user.id; // Lấy ID từ token middleware
    const [user] = await pool.query(
      `SELECT id, username, email, role, avatar, bio, created_at FROM users WHERE id = ?`,
      [userId]
    );
    // console.log("Created At from DB:", user[0].created_at);
    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user[0]); // Trả về thông tin người dùng
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user profile:", error);
    res
      .status(500)
      .json({ message: "Không thể lấy thông tin cá nhân người dùng." });
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

exports.getRandomCoupon = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM coupons WHERE is_active = 1 ORDER BY RAND() LIMIT 1"
    );
    if (rows.length > 0) {
      res.json(rows[0]); // Trả về coupon ngẫu nhiên
    } else {
      res.status(404).json({ message: "Không có mã giảm giá hoạt động" });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy coupon", error: err.message });
  }
};
