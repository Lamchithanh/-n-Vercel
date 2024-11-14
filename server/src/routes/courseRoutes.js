const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Các route không cần xác thực
router.get("/courses", courseController.getAllCourses); // Lấy tất cả khóa học
router.get("/courses/:id", courseController.getCourseById); // Lấy khóa học theo ID
router.post("/courses", courseController.addCourse); // Thêm khóa học mới
router.put("/courses/:id", courseController.updateCourse); // Cập nhật khóa học theo ID
router.delete("/courses/:id", courseController.deleteCourse); // Xóa khóa học theo ID
router.get("/search", courseController.searchCourses); // Route tìm kiếm

router.get("/progress/:userId/:courseId", courseController.getProgress);
router.post("/progress/update", courseController.updateProgress);

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Đảm bảo thư mục tồn tại trước khi upload
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log("Image destination directory checked/created:", uploadDir); // Log thư mục lưu ảnh
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = "course-" + uniqueSuffix + path.extname(file.originalname);
    console.log("Generated filename:", filename); // Log tên file đã được tạo
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  // Kiểm tra mime type
  if (!file.mimetype.startsWith("image/")) {
    console.error("Invalid file type:", file.mimetype); // Log loại file không hợp lệ
    return cb(new Error("Chỉ chấp nhận file ảnh!"), false);
  }

  // Kiểm tra dung lượng file (2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (parseInt(req.headers["content-length"]) > maxSize) {
    console.error("File size exceeds limit:", req.headers["content-length"]); // Log khi file quá lớn
    return cb(new Error("File ảnh không được vượt quá 2MB!"), false);
  }

  console.log("File passed filter:", file.originalname); // Log khi file hợp lệ
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// Route xử lý upload ảnh
router.post(
  "/courses/:courseId/upload-image",
  (req, res, next) => {
    const { courseId } = req.params;

    // Cấu hình multer để lưu file vào thư mục của từng khóa học
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = path.join(
          __dirname,
          "../../../client/src/assets/uploads/courses"
        );
        cb(null, dir); // Lưu vào thư mục chung
      },
      filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename); // Đặt tên ảnh duy nhất
      },
    });

    const upload = multer({ storage }).single("image");

    console.log("Received upload request:", req.headers); // Log thông tin yêu cầu upload
    upload(req, res, (err) => {
      if (err) {
        console.error("Error during upload:", err); // Log lỗi trong quá trình upload
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { courseId } = req.params;

      if (!req.file) {
        console.error("No file received"); // Log khi không có file trong yêu cầu
        return res.status(400).json({
          success: false,
          message: "Không có file được tải lên",
        });
      }

      // Kiểm tra file có tồn tại không
      const filePath = req.file.path;
      if (!fs.existsSync(filePath)) {
        console.error("File not found after upload:", filePath); // Log nếu file không tìm thấy
        return res.status(500).json({
          success: false,
          message: "Lỗi khi lưu file",
        });
      }

      // Tạo URL truy cập ảnh
      const imageUrl = `${req.protocol}://${req.get(
        "host"
      )}/assets/uploads/courses/${req.file.filename}`;

      console.log("Image uploaded successfully:", imageUrl); // Log khi ảnh tải lên thành công

      res.json({
        success: true,
        imageUrl: imageUrl,
        fileName: req.file.filename,
        message: "Tải ảnh lên thành công",
      });
    } catch (error) {
      console.error("Error uploading image:", error); // Log lỗi khi xảy ra sự cố
      // Xóa file nếu có lỗi xảy ra
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log("File deleted due to error:", req.file.path); // Log khi xóa file do lỗi
      }
      res.status(500).json({
        success: false,
        message: "Không thể tải ảnh lên. Vui lòng thử lại.",
      });
    }
  }
);

module.exports = router;
