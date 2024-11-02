const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

// Load biến môi trường
dotenv.config({ path: path.join(__dirname, "../.env") });

// In ra để kiểm tra
// console.log("Environment variables:", {
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Kiểm tra kết nối
pool
  .getConnection()
  .then((connection) => {
    console.log("Đã kết nối cơ sở dữ liệu.");
    connection.release();
  })
  .catch((err) => {
    console.error("Lỗi kết nối với cơ sở dữ liệu:", err);
    process.exit(1);
  });

module.exports = pool;
