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

const createError = require("http-errors");

exports.validateCoupon = async (req, res) => {
  const { code, totalAmount, userId, courseId } = req.body;

  if (!code || !totalAmount || !userId || !courseId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin cần thiết",
    });
  }

  try {
    const [couponResults] = await pool.query(
      `SELECT 
        c.id,
        c.code,
        c.discount_type,
        c.discount_amount,
        c.max_usage,
        c.min_purchase_amount,
        c.expiration_date,
        c.is_active,
        COUNT(cu.id) as usage_count,
        (
          SELECT COUNT(*) 
          FROM coupon_usage cu2 
          WHERE cu2.coupon_id = c.id 
          AND cu2.user_id = ? 
          AND cu2.course_id = ? 
        ) as user_course_usage
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      WHERE c.code = ? 
      GROUP BY c.id`,
      [userId, courseId, code]
    );

    if (couponResults.length === 0) {
      throw createError(404, "Mã giảm giá không tồn tại");
    }

    const coupon = couponResults[0];

    if (!coupon.is_active) {
      throw createError(400, "Mã giảm giá đã bị vô hiệu hóa");
    }

    if (
      coupon.expiration_date &&
      new Date(coupon.expiration_date) < new Date()
    ) {
      throw createError(400, "Mã giảm giá đã hết hạn");
    }

    if (
      coupon.min_purchase_amount &&
      totalAmount < coupon.min_purchase_amount
    ) {
      throw createError(
        400,
        `Giá trị đơn hàng tối thiểu ${coupon.min_purchase_amount.toLocaleString()} VND`
      );
    }

    if (coupon.usage_count >= coupon.max_usage) {
      throw createError(400, "Mã giảm giá đã hết lượt sử dụng");
    }

    if (coupon.user_course_usage > 0) {
      throw createError(400, "Bạn đã sử dụng mã giảm giá này cho khóa học này");
    }

    let discountAmount =
      coupon.discount_type === "percentage"
        ? (totalAmount * coupon.discount_amount) / 100
        : coupon.discount_amount;

    discountAmount = Math.min(discountAmount, totalAmount);

    // Log dữ liệu sẽ được chèn vào
    console.log("Dữ liệu sẽ được chèn vào coupon_usage:", {
      userId,
      courseId,
      couponId: coupon.id,
      discountAmount,
      originalAmount: totalAmount,
    });

    // Thực hiện chèn dữ liệu vào cơ sở dữ liệu
    const [result] = await pool.query(
      `INSERT INTO coupon_usage (user_id, course_id, coupon_id, discount_amount, original_amount) 
      VALUES (?, ?, ?, ?, ?)`,
      [userId, courseId, coupon.id, discountAmount, totalAmount]
    );

    // Log kết quả trả về từ cơ sở dữ liệu
    console.log("Kết quả chèn dữ liệu:", result);

    return res.json({
      success: true,
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountAmount: coupon.discount_amount,
        calculatedDiscount: discountAmount,
        finalPrice: totalAmount - discountAmount,
      },
    });
  } catch (error) {
    console.error("Lỗi xảy ra khi áp dụng mã giảm giá:", error.message); // Log lỗi chi tiết
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau.",
    });
  }
};

exports.removeCouponUsage = async (req, res) => {
  const { userId, courseId, couponId } = req.body;

  try {
    const [result] = await pool.query(
      `DELETE FROM coupon_usage 
       WHERE user_id = ? 
       AND course_id = ? 
       AND coupon_id = ?`,
      [userId, courseId, couponId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Đã gỡ mã giảm giá thành công." });
    } else {
      res
        .status(404)
        .json({ message: "Không tìm thấy mã giảm giá đã áp dụng." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server, vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

exports.checkCouponStatus = async (req, res) => {
  const { userId, courseId, couponId } = req.query;

  if (!userId || !courseId || !couponId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin cần thiết",
    });
  }

  try {
    // Check if coupon still exists and is valid
    const [couponResults] = await pool.query(
      `
      SELECT 
        c.id,
        c.is_active,
        c.expiration_date,
        c.max_usage,
        COUNT(cu.id) as usage_count
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      WHERE c.id = ?
      GROUP BY c.id
    `,
      [couponId]
    );

    if (couponResults.length === 0) {
      return res.json({
        success: true,
        isValid: false,
        reason: "deleted",
      });
    }

    const coupon = couponResults[0];

    // Check various invalidation conditions
    if (!coupon.is_active) {
      return res.json({
        success: true,
        isValid: false,
        reason: "inactive",
      });
    }

    if (
      coupon.expiration_date &&
      new Date(coupon.expiration_date) < new Date()
    ) {
      return res.json({
        success: true,
        isValid: false,
        reason: "expired",
      });
    }

    if (coupon.usage_count >= coupon.max_usage) {
      return res.json({
        success: true,
        isValid: false,
        reason: "maxUsageReached",
      });
    }

    // Check if this specific usage still exists
    const [usageResults] = await pool.query(
      `
      SELECT id 
      FROM coupon_usage 
      WHERE user_id = ? 
      AND course_id = ? 
      AND coupon_id = ?
    `,
      [userId, courseId, couponId]
    );

    if (usageResults.length === 0) {
      return res.json({
        success: true,
        isValid: false,
        reason: "usageDeleted",
      });
    }

    return res.json({
      success: true,
      isValid: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Áp dụng mã giảm giá
exports.applyCoupon = async (req, res) => {
  const { userId, courseId, Code, coursePrice } = req.body;

  if (!Code) {
    return res.status(400).json({
      message: "Vui lòng cung cấp mã giảm giá hợp lệ.",
    });
  }

  const parsedCoursePrice = parseFloat(coursePrice);
  if (isNaN(parsedCoursePrice) || parsedCoursePrice <= 0) {
    return res.status(400).json({
      message: "Giá khóa học không hợp lệ.",
    });
  }

  try {
    const [coupons] = await pool.query(
      `SELECT * FROM coupons 
       WHERE id = ? 
       AND is_active = TRUE 
       AND (expiration_date IS NULL OR expiration_date > NOW())`,
      [Code]
    );
    const coupon = coupons[0];

    if (!coupon) {
      return res.status(400).json({
        message: "Mã giảm giá không hợp lệ hoặc đã hết hạn.",
      });
    }

    // Check minimum purchase amount
    if (
      coupon.min_purchase_amount &&
      parsedCoursePrice < coupon.min_purchase_amount
    ) {
      return res.status(400).json({
        message: `Mã giảm giá chỉ áp dụng cho đơn hàng từ ${coupon.min_purchase_amount.toLocaleString()} trở lên.`,
      });
    }

    // Check maximum usage
    const [usageCount] = await pool.query(
      `SELECT COUNT(*) as usage_count 
       FROM coupon_usage 
       WHERE coupon_id = ?`,
      [coupon.id]
    );

    if (usageCount[0].usage_count >= coupon.max_usage) {
      return res.status(400).json({
        message: "Mã giảm giá đã hết lượt sử dụng.",
      });
    }

    // Check if user has already used this coupon for this course
    const [existingUsage] = await pool.query(
      `SELECT * FROM coupon_usage 
       WHERE user_id = ? 
       AND course_id = ? 
       AND coupon_id = ?`,
      [userId, courseId, coupon.id]
    );

    if (existingUsage.length > 0) {
      return res.status(400).json({
        message: "Bạn đã sử dụng mã giảm giá này cho khóa học này rồi.",
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      // Limit percentage discount to 100%
      const discountPercent = Math.min(parsedDiscountAmount, 100);
      discountAmount = (parsedCoursePrice * discountPercent) / 100;
    } else {
      // Fixed amount discount
      discountAmount = parsedDiscountAmount;
    }

    // Ensure discount doesn't exceed course price
    discountAmount = Math.max(0, Math.min(discountAmount, parsedCoursePrice));

    // Round discount to 2 decimal places
    discountAmount = parseFloat(discountAmount.toFixed(2));

    // Calculate final price after discount
    const finalPrice = parsedCoursePrice - discountAmount;

    // Insert coupon usage record
    const [insertResult] = await pool.query(
      `INSERT INTO coupon_usage 
       (user_id, course_id, coupon_id, discount_amount, original_amount) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, courseId, coupon.id, discountAmount, parsedCoursePrice]
    );

    // Log the inserted record's ID for debugging
    console.log("New usage record ID:", insertResult.insertId);

    // Return coupon application details
    res.status(200).json({
      code: coupon.code,
      discountAmount,
      discountType: coupon.discount_type,
      finalPrice,
      usageRecordId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Lỗi khi áp dụng mã giảm giá:", error);
    res.status(500).json({
      error: error.message,
      details: error.stack,
    });
  }
};
// Lấy mã giảm giá đã áp dụng
exports.getAppliedCoupon = async (req, res) => {
  const { userId, courseId } = req.query;

  try {
    const [appliedCoupons] = await pool.query(
      `SELECT cu.*, c.code, c.discount_type, c.discount_amount 
       FROM coupon_usage cu
       JOIN coupons c ON cu.coupon_id = c.id
       WHERE cu.user_id = ? AND cu.course_id = ?`,
      [userId, courseId]
    );

    res.status(200).json(appliedCoupons);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server, vui lòng thử lại sau.",
      error: error.message,
    });
  }
};
