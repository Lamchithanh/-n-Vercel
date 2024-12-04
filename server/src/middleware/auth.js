const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  console.log("Received Authorization Header:", req.header("Authorization"));
  console.log("Extracted Token:", token);

  if (!token) {
    return res.status(401).json({ error: "Không tìm thấy token xác thực" });
  }

  try {
    // Kiểm tra token và giải mã
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    console.log("Decoded Token Information:", decoded);

    // Gán thông tin người dùng vào req.user để dùng trong các route tiếp theo
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      google_id: decoded.google_id,
      email: decoded.email,
    };

    // Tiếp tục xử lý
    next();
  } catch (error) {
    console.error("Token Verification Detailed Error:", error);
    return res.status(401).json({
      error:
        error.name === "TokenExpiredError"
          ? "Token đã hết hạn"
          : "Token không hợp lệ hoặc đã bị sửa đổi",
      errorDetails: error.message,
    });
  }
};
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      error: "Chỉ có người quản trị mới có thể truy cập tuyến đường này",
    });
  }
};

exports.adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      error: "Access denied. Admin privileges required.",
    });
  }
};
