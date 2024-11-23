const pool = require("../config/pool");

// Khởi tạo thanh toán
exports.initiatePayment = async (req, res) => {
  const { userId, courseId, amount, paymentMethod, couponCode } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if course exists and user hasn't already bought it
    const checkQuery = `
      SELECT id FROM payments 
      WHERE user_id = ? AND course_id = ? AND status = 'completed'
      LIMIT 1
    `;
    const [existingPayment] = await connection.query(checkQuery, [
      userId,
      courseId,
    ]);

    if (existingPayment.length > 0) {
      return res.status(400).json({
        message: "Bạn đã mua khóa học này trước đó.",
      });
    }

    // If coupon code is provided, validate and apply discount
    let finalAmount = amount;
    if (couponCode) {
      const [couponResult] = await connection.query(
        "SELECT discount_amount, discount_type FROM coupons WHERE code = ?",
        [couponCode]
      );

      if (couponResult.length > 0) {
        const { discount_amount, discount_type } = couponResult[0];

        // Calculate discounted price
        if (discount_type === "percentage") {
          finalAmount = amount - (amount * discount_amount) / 100;
        } else if (discount_type === "fixed") {
          finalAmount = Math.max(0, amount - discount_amount);
        }
      }
    }

    // Create payment record
    const insertQuery = `
      INSERT INTO payments (
        user_id, 
        course_id, 
        amount, 
        payment_method, 
        status, 
        coupon_code
      ) VALUES (?, ?, ?, ?, 'pending', ?)
    `;
    const [result] = await connection.query(insertQuery, [
      userId,
      courseId,
      finalAmount, // Use calculated amount
      paymentMethod,
      couponCode || null,
    ]);

    await connection.commit();

    res.status(201).json({
      paymentId: result.insertId,
      amount: finalAmount,
      message: "Đã khởi tạo thanh toán thành công.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error initiating payment:", error);
    res.status(500).json({
      message: "Không thể khởi tạo thanh toán.",
      error: error.message,
    });
  } finally {
    connection.release();
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
// couponController.js
// In PaymentController.js
exports.validateCoupon = async (req, res) => {
  const { code } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM coupons 
       WHERE code = ? 
       AND discount_amount > 0`,
      [code]
    );

    // Check if coupon exists and is valid
    if (result.length === 0) {
      return res.status(400).json({
        valid: false,
        message: "Mã giảm giá không hợp lệ",
      });
    }

    const coupon = result[0];

    // Return coupon details
    res.json({
      valid: true,
      discount: coupon.discount_amount,
      type: coupon.discount_type, // 'percentage' or 'fixed'
      code: coupon.code,
    });
  } catch (error) {
    // Error handling
  }
};

exports.checkCoupon = async (req, res) => {
  try {
    const { code, totalAmount, userId, courseId } = req.body;

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if coupon exists and get its details
      const [couponResult] = await connection.query(
        `SELECT c.id, c.discount_amount, c.discount_type, c.max_usage,
         (SELECT COUNT(*) FROM coupon_usage cu WHERE cu.coupon_id = c.id) as total_usage,
         (SELECT COUNT(*) FROM coupon_usage cu 
          WHERE cu.coupon_id = c.id 
          AND cu.user_id = ? 
          AND cu.course_id = ?) as user_course_usage
        FROM coupons c
        WHERE c.code = ?`,
        [userId, courseId, code]
      );

      if (couponResult.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Mã giảm giá không tồn tại!" });
      }

      const coupon = couponResult[0];

      // Check if coupon has reached max usage
      if (coupon.total_usage >= coupon.max_usage) {
        await connection.rollback();
        return res
          .status(400)
          .json({ message: "Mã giảm giá đã hết lượt sử dụng!" });
      }

      // Check if user has already used this coupon for this course
      if (coupon.user_course_usage > 0) {
        await connection.rollback();
        return res.status(400).json({
          message: "Bạn đã sử dụng mã giảm giá này cho khóa học này rồi!",
        });
      }

      // Calculate discounted price
      let discountedPrice;
      if (coupon.discount_type === "percentage") {
        discountedPrice =
          totalAmount - (totalAmount * coupon.discount_amount) / 100;
      } else {
        discountedPrice = totalAmount - coupon.discount_amount;
      }
      discountedPrice = Math.max(discountedPrice, 0);

      // Record coupon usage
      await connection.query(
        `INSERT INTO coupon_usage (user_id, course_id, coupon_id) 
         VALUES (?, ?, ?)`,
        [userId, courseId, coupon.id]
      );

      await connection.commit();

      return res.json({
        code,
        discountType: coupon.discount_type,
        discountAmount: coupon.discount_amount,
        discountedPrice,
        couponId: coupon.id,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Coupon validation error:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
