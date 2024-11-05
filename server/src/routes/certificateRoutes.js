const express = require("express");
const router = express.Router();
const {
  getCertificates,
  createCertificate,
  downloadCertificate,
} = require("../controllers/certificatesController");

// Lấy danh sách chứng chỉ
router.get("/certificates", getCertificates);

// Tạo chứng chỉ mới
router.post("/certificates", createCertificate);

// Tải xuống chứng chỉ
router.get("/certificates/:id/download", downloadCertificate);

module.exports = router;
