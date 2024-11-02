const express = require("express");
const { forgotPassword } = require("../controllers/ForgotPassword");
const router = express.Router();

// Route quên mật khẩu
router.post("/forgot-password", forgotPassword);

module.exports = router;
