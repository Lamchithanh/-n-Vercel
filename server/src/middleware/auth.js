const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Không tìm thấy token xác thực" });
  }

  try {
    // Kiểm tra token và giải mã
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Gán thông tin người dùng vào req.user để dùng trong các route tiếp theo
    req.user = { id: decoded.userId };

    // Tiếp tục xử lý
    next();
  } catch (error) {
    // Kiểm tra nếu token hết hạn hoặc không hợp lệ
    console.error("Token error:", error); // Để dễ debug trong lúc phát triển
    return res.status(401).json({
      error:
        error.name === "TokenExpiredError"
          ? "Token đã hết hạn"
          : "Token không hợp lệ hoặc đã bị sửa đổi",
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
