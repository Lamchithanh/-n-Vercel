const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/AccountSettingsController");
const { authMiddleware } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Update user route - no validation middleware
router.put("/:id", authMiddleware, updateProfile);

// Route để upload ảnh dưới dạng base64
router.post("/:userId/upload-avatar", authMiddleware, (req, res) => {
  try {
    // Kiểm tra xem có dữ liệu ảnh base64 trong body không
    if (!req.body.imageData) {
      return res.status(400).json({ message: "Không có ảnh được gửi lên" });
    }

    // Kiểm tra định dạng base64 hợp lệ
    const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
    if (!regex.test(req.body.imageData)) {
      return res.status(400).json({ message: "Dữ liệu ảnh không hợp lệ" });
    }

    // Cắt bỏ phần header của base64 (data:image/...;base64,)
    const base64Data = req.body.imageData.replace(regex, "");

    // Tạo tên file cho ảnh
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = `avatar-${uniqueSuffix}.png`; // Thay đổi phần mở rộng nếu cần

    // Tạo thư mục lưu ảnh nếu chưa có
    const uploadDir = path.join(__dirname, "../uploads/avatars");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Lưu ảnh vào file
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    // Trả về URL của ảnh đã upload
    return res.status(200).json({
      message: "Tải ảnh lên thành công",
      imageUrl: `/uploads/avatars/${fileName}`,
    });
  } catch (error) {
    console.error("Lỗi khi tải ảnh lên:", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
});
// Route xử lý upload ảnh

module.exports = router;
