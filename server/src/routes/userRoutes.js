const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { forgotPassword } = require("../controllers/ForgotPassword");
const { authMiddleware } = require("../middleware/auth");

// Routes không yêu cầu xác thực
router.get("/users", userController.getAllUsers); // Lấy danh sách người dùng
router.post("/users", userController.createUser); // Tạo tài khoản mới
router.post("/users/login", userController.login); // Đăng nhập
router.post("/users/register", userController.register); // Đăng ký
router.post("/forgot-password", forgotPassword); // Lấy lại mật khẩu

// Route lấy thông tin user profile
router.get("/users/profile", authMiddleware, userController.getUserProfile);
router.post(
  "/update-first-login",
  authMiddleware,
  userController.updateFirstLogin
);

// Routes quản lý người dùng
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);
router.put("/users/:id/lock", userController.toggleUserLock);
router.get("/users/coupons/random", userController.getRandomCoupon);

// Route để đăng xuất
router.post("/logout", userController.logout);

module.exports = router;
