const pool = require("../config/pool"); // Đảm bảo rằng đường dẫn này đúng
const connection = require("../config/pool"); // Import kết nối cơ sở dữ liệu
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // Thư viện để hash mật khẩu
// truy xuất dữ liệu và đăng nhập

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (results.length === 0) {
            return res.status(401).json({ error: "Người dùng không tồn tại" });
        }

        const user = results[0];

        if (user.password_hash !== password) {
            return res.status(401).json({ error: "Mật khẩu không đúng" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });

        res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            message: "Đăng nhập thành công!",
        });
    } catch (err) {
        console.error("Database query error: ", err);
        return res
            .status(500)
            .json({ error: "Đã xảy ra lỗi. Vui lòng thử lại." });
    }
};

// truy xuất và đăng ký
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Kiểm tra xem có đầy đủ dữ liệu không
        if (!username || !email || !password || !role) {
            return res
                .status(400)
                .json({ error: "Tất cả các trường đều bắt buộc!" });
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

        return res
            .status(201)
            .json({ message: "Đăng ký người dùng thành công!" });
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
        const { isLocked } = req.body;
        // Thực hiện logic khóa/mở khóa tài khoản
        await pool.query("UPDATE users SET isLocked = ? WHERE id = ?", [
            isLocked,
            id,
        ]);
        res.status(200).json({
            message: `User account ${
                isLocked ? "locked" : "unlocked"
            } successfully`,
        });
    } catch (error) {
        console.error("Error toggling user lock status:", error);
        res.status(500).json({ error: "Unable to update account lock status" });
    }
};
// Hàm lấy danh sách người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT * FROM users WHERE role != "admin" `
        ); // Query lấy danh sách người dùng
        res.status(200).json(users); // Trả về danh sách người dùng dưới dạng JSON
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        res.status(500).json({
            message: "Lỗi server, không thể lấy danh sách người dùng.",
        });
    }
};

exports.logout = (req, res) => {
    // Implement logout logic here
};

// Tạo hàm getUserProfile để lấy thông tin người dùng
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ middleware xác thực
        const [results] = await pool.query(
            "SELECT id, username, email, role, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?",
            [userId]
        );
        if (results.length === 0) {
            return res.status(404).json({ error: "Người dùng không tồn tại" });
        }
        const user = results[0];
        res.status(200).json({ user });
    } catch (err) {
        console.error("Database query error:", err);
        return res
            .status(500)
            .json({ error: "Đã xảy ra lỗi. Vui lòng thử lại." });
    }
};

// New function: Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role } = req.body;

        // Check if user exists
        const [userExists] = await pool.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );

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
        const [userExists] = await pool.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );

        if (userExists.length === 0) {
            return res.status(404).json({ error: "Người dùng không tồn tại" });
        }

        // Delete user
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
            id,
        ]);

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
        return res
            .status(500)
            .json({
                success: false,
                message: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
            });
    }
};
