const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Đảm bảo đường dẫn đến các routes là chính xác
const userRoutes = require("./routes/userRoutes.js");
const courseRoutes = require("./routes/courseRoutes");
const uploadRoutes = require("./routes/uploadRoutes"); // Import uploadRoutes
const lessonRoutes = require("./routes/lessonRoutes");

const app = express();
const port = process.env.PORT || 9000;

// Cấu hình CORS
app.use(cors());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(bodyParser.json());

// Bỏ qua xác thực token cho tất cả các route
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", uploadRoutes); // Sử dụng uploadRoutes cho việc tải lên hình ảnh
app.use("/api", lessonRoutes);

app.listen(port, () => {
  console.log(`Máy chủ đang chạy trên cổng ${port}`);
});
