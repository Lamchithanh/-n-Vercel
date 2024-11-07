const express = require("express");
const router = express.Router();
const {
  getCertificates,
  createCertificate,
  deleteCertificate, // Đảm bảo hàm này được import
} = require("../controllers/certificatesController");
const pool = require("../config/pool");

// Đảm bảo rằng tất cả các hàm handler này đều được khai báo
router.get("/certificates", getCertificates);
router.post("/certificates", createCertificate);
router.delete("/certificates/:id", deleteCertificate); // Route để xóa chứng chỉ
router.get("/api/certificates", async (req, res) => {
  const { userId } = req.query;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM certificates WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách chứng chỉ" });
  }
});

module.exports = router;
