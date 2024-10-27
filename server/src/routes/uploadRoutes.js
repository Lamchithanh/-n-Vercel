// uploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    // Tạo tên file độc nhất bằng timestamp + tên gốc
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  // Chấp nhận các loại ảnh phổ biến
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Không hỗ trợ định dạng file này"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
});

// Route upload ảnh
// Route upload ảnh
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res
        .status(400)
        .json({ message: "Không có file nào được tải lên." });
    }

    console.log("Uploaded file:", req.file);

    // Tạo URL cho file đã upload
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    console.log("Generated image URL:", imageUrl);

    res.json({
      url: imageUrl,
      file: req.file, // Thêm thông tin file để debug
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Lỗi khi tải file lên",
      error: error.message,
    });
  }
});

// Serve static files từ thư mục uploads
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = router;
