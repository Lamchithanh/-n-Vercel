const express = require("express");
const router = express.Router();
const {
  getCertificates,
  createCertificate,
  deleteCertificate, // Đảm bảo hàm này được import
} = require("../controllers/certificatesController");

// Đảm bảo rằng tất cả các hàm handler này đều được khai báo
router.get("/certificates", getCertificates);
router.post("/certificates", createCertificate);
router.delete("/certificates/:id", deleteCertificate); // Route để xóa chứng chỉ

module.exports = router;
