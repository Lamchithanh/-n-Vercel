const express = require("express");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/userRoutes.js");
const courseRoutes = require("./routes/courseRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const courseReviewsRoutes = require("./routes/courseReviewsRoutes");
const searchRoutes = require("./routes/courseRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const { startCronJob } = require("./controllers/userController.js"); // Import cron job
const paymentRoutes = require("./routes/paymentRoutes.js");
const blogRoutes = require("./routes/blogRoutes");
const ChangePassword = require("./routes/ChangePasswordRoute.js");
const CertificateRequestRoutes = require("./routes/CertificateRequestRoutes.js");
const dashboardRoutes = require("./routes/IntroduceRotues.js");
const app = express();
const port = process.env.PORT || 9001;

// Cấu hình CORS
app.use(cors());

const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File ảnh không được vượt quá 2MB!",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Lỗi khi tải file lên: " + error.message,
    });
  }
  next(error);
};

// Middleware để log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/assets/uploads/courses",
  express.static(
    path.join(__dirname, "../../client/src/assets/uploads/courses")
  )
);
app.use(
  "/assets/uploads/avatar",
  express.static(
    path.join(__dirname, "../../client/public/assets/uploads/avatar")
  )
);

// Routes

app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", uploadRoutes);
app.use("/api", lessonRoutes);
app.use("/api", moduleRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", courseReviewsRoutes);
app.use("/api/courses", searchRoutes);
app.use("/api", certificateRoutes);
app.use("/api", paymentRoutes);
app.use("/api", blogRoutes);
app.use("/api", ChangePassword);
app.use("/api", CertificateRequestRoutes);
app.use("/api", dashboardRoutes);
// Middleware xử lý lỗi
app.use(handleMulterError);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Có lỗi xảy ra, vui lòng thử lại sau!",
  });
});

// Khởi động cron job
startCronJob();
process.env.TZ = "Asia/Ho_Chi_Minh";

app.listen(port, () => {
  console.log(`Máy chủ đang chạy trên cổng ${port}`);
});
