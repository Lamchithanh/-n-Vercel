const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Đảm bảo đường dẫn đến các routes là chính xác
const userRoutes = require("./routes/userRoutes.js");
const courseRoutes = require("./routes/courseRoutes");

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

app.listen(port, () => {
    console.log(`Máy chủ đang chạy trên cổng ${port}`);
});
