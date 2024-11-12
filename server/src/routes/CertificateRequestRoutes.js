const express = require("express");
const router = express.Router();
const pool = require("../config/pool");

// Get Certificate Requests
router.post("/certificates/request", async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    await pool.query(
      "INSERT INTO certificate_requests (user_id, course_id) VALUES (?, ?)",
      [userId, courseId]
    );
    res.json({ message: "Yêu cầu cấp chứng chỉ đã được gửi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi gửi yêu cầu cấp chứng chỉ" });
  }
});

// Lấy danh sách tất cả yêu cầu cấp chứng chỉ chưa được duyệt
router.get("/certificates/requests", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cr.id, u.username, c.title AS course_name, cr.request_date
       FROM certificate_requests cr
       JOIN users u ON cr.user_id = u.id
       JOIN courses c ON cr.course_id = c.id
       WHERE cr.accepted = 0`
    );
    res.json(rows); // Trả về danh sách yêu cầu chưa duyệt với tên người dùng và khóa học
  } catch (err) {
    console.error("Error fetching certificate requests:", err);
    res.status(500).json({ message: "Error fetching certificate requests." });
  }
});

// Accept Certificate Request
router.post("/certificates/accept/:requestId", async (req, res) => {
  try {
    const requestId = req.params.requestId;
    await pool.query(
      "UPDATE certificate_requests SET accepted = 1 WHERE id = ?",
      [requestId]
    );
    const [userRow] = await pool.query(
      "SELECT user_id, course_id FROM certificate_requests WHERE id = ?",
      [requestId]
    );
    await pool.query(
      "INSERT INTO certificates (user_id, course_id, issued_at) VALUES (?, ?, NOW())",
      [userRow.user_id, userRow.course_id]
    );
    res.json({ message: "Certificate request accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error accepting certificate request" });
  }
});

// Reject Certificate Request
router.post("/certificates/reject/:requestId", async (req, res) => {
  try {
    const requestId = req.params.requestId;
    await pool.query("DELETE FROM certificate_requests WHERE id = ?", [
      requestId,
    ]);
    res.json({ message: "Certificate request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting certificate request" });
  }
});

router.get("/certificates/status/:userId/:courseId", async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    // Truy vấn trạng thái yêu cầu cấp chứng chỉ từ bảng certificate_requests
    const [requestRows] = await pool.query(
      "SELECT accepted FROM certificate_requests WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy yêu cầu cấp chứng chỉ cho khóa học này.",
      });
    }

    // Nếu yêu cầu chứng chỉ đã được chấp nhận, kiểm tra thêm xem chứng chỉ đã được cấp chưa
    const certificateAccepted = requestRows[0].accepted === 1;

    if (certificateAccepted) {
      // Kiểm tra trong bảng certificates xem người dùng đã có chứng chỉ hay chưa
      const [certRows] = await pool.query(
        "SELECT * FROM certificates WHERE user_id = ? AND course_id = ?",
        [userId, courseId]
      );

      if (certRows.length > 0) {
        return res.json({
          status: "Đã cấp chứng chỉ",
        });
      }
      return res.json({
        status:
          "Yêu cầu chứng chỉ đã được chấp nhận, nhưng chứng chỉ chưa được cấp",
      });
    }

    // Nếu yêu cầu chứng chỉ chưa được duyệt
    res.json({
      status: "Yêu cầu chứng chỉ đang chờ duyệt...",
    });
  } catch (err) {
    console.error("Error getting certificate request status:", err);
    res.status(500).json({
      message:
        "Không thể lấy trạng thái yêu cầu cấp chứng chỉ. Vui lòng thử lại sau.",
    });
  }
});

module.exports = router;
