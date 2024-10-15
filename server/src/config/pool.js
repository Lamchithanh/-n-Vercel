const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Kiểm tra kết nối
pool.getConnection()
    .then((connection) => {
        console.log("Đã kết nối cơ sở dữ liệu.");
        connection.release(); // Giải phóng kết nối sau khi kiểm tra
    })
    .catch((err) => {
        console.error("Lỗi kết nối với cơ sở dữ liệu:", err);
    });

module.exports = pool;
