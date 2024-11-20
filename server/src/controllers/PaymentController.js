const pool = require("../config/pool");

// Khởi tạo thanh toán
exports.initiatePayment = async (req, res) => {
  const { userId, courseId, amount, paymentMethod } = req.body;

  try {
    // Kiểm tra xem khóa học đã được mua chưa
    const checkQuery = `
      SELECT id FROM payments 
      WHERE user_id = ? AND course_id = ? AND status = 'completed'
      LIMIT 1
    `;
    const [existingPayment] = await pool.query(checkQuery, [userId, courseId]);

    if (existingPayment.length > 0) {
      return res.status(400).json({
        message: "Bạn đã mua khóa học này trước đó.",
      });
    }

    // Tạo payment mới
    const insertQuery = `
      INSERT INTO payments (user_id, course_id, amount, payment_method, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
    const [result] = await pool.query(insertQuery, [
      userId,
      courseId,
      amount,
      paymentMethod,
    ]);

    res.status(201).json({
      paymentId: result.insertId,
      message: "Đã khởi tạo thanh toán thành công.",
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ message: "Không thể khởi tạo thanh toán." });
  }
};

// Xác nhận thanh toán thành công
exports.confirmPayment = async (req, res) => {
  const { paymentId, transactionId } = req.body;

  // Sử dụng transaction để đảm bảo tính nhất quán của dữ liệu
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Cập nhật trạng thái thanh toán
    const updateQuery = `
        UPDATE payments 
        SET status = 'completed', 
            transaction_id = ?,
            transaction_date = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
    const [result] = await connection.query(updateQuery, [
      transactionId,
      paymentId,
    ]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Không tìm thấy thanh toán." });
    }

    // Lấy thông tin thanh toán
    const getPaymentQuery = `
        SELECT user_id, course_id FROM payments WHERE id = ?
      `;
    const [[payment]] = await connection.query(getPaymentQuery, [paymentId]);

    // Tạo ghi danh, bỏ qua nếu đã tồn tại
    const enrollmentQuery = `
  INSERT IGNORE INTO enrollments (user_id, course_id)
  VALUES (?, ?)
`;
    await connection.query(enrollmentQuery, [
      payment.user_id,
      payment.course_id,
    ]);

    await connection.commit();

    res.json({
      message: "Thanh toán thành công và đã ghi danh khóa học.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi xác nhận thanh toán:", error);
    res.status(500).json({ message: "Không thể xác nhận thanh toán." });
  } finally {
    connection.release();
  }
};

// Kiểm tra trạng thái thanh toán của khóa học
exports.checkPaymentStatus = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const query = `
      SELECT status, transaction_date 
      FROM payments
      WHERE user_id = ? AND course_id = ? AND status = 'completed'
      ORDER BY transaction_date DESC
      LIMIT 1
    `;
    const [payment] = await pool.query(query, [userId, courseId]);

    res.json({
      hasPaid: payment.length > 0,
      paymentDetails: payment[0] || null,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res
      .status(500)
      .json({ message: "Không thể kiểm tra trạng thái thanh toán." });
  }
};

// Lấy lịch sử thanh toán của user
exports.getUserPayments = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT p.*, c.title as course_title, c.image as course_image
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      WHERE p.user_id = ?
      ORDER BY p.transaction_date DESC
    `;
    const [payments] = await pool.query(query, [userId]);

    res.json(payments);
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({ message: "Không thể tải lịch sử thanh toán." });
  }
};

// Lấy thông tin chi tiết của một thanh toán
exports.getPaymentDetails = async (req, res) => {
  const { paymentId } = req.params;

  try {
    const query = `
      SELECT p.*, 
             c.title as course_title, 
             c.image as course_image,
             u.fullname as user_name,
             u.email as user_email
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;
    const [[payment]] = await pool.query(query, [paymentId]);

    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán." });
    }

    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "Không thể tải thông tin thanh toán." });
  }
};
