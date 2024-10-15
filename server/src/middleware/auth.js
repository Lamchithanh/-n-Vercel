const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Không tìm thấy token xác thực" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
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
