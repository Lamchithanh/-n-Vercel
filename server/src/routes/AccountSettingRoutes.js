const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/AccountSettingsController");
const { authMiddleware } = require("../middleware/auth");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/avatars/"); // Thư mục lưu file
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép file ảnh"));
    }
  },
});

router.put("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { avatar } = req.body;

    const user = await updateUserProfile(userId, { avatar });

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
});

router.post(
  "/users/:userId/upload-avatar",
  authMiddleware,
  upload.single("avatar"), // Đảm bảo rằng 'avatar' là tên của file input
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có file được gửi lên" });
      }

      // Kiểm tra thư mục chứa ảnh
      const imageUrl = `/uploads/avatars/${req.file.filename}`;

      // Cập nhật URL ảnh vào database
      const user = await updateUserProfile(req.params.userId, {
        avatar: imageUrl,
      });

      return res.status(200).json({
        success: true,
        message: "Tải ảnh lên thành công",
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      return res.status(500).json({ message: "Đã có lỗi xảy ra" });
    }
  }
);

module.exports = router;
