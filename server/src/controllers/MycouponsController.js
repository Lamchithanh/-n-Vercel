const pool = require("../config/pool");

const getMyCoupons = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("User ID nhận được:", userId);

    const [rows] = await pool.query(
      `
        SELECT 
          mc.id,
          mc.user_id,
          mc.is_used,
          c.code,
          c.discount_type,
          c.discount_amount,
          c.min_purchase_amount,
          c.expiration_date,
          c.is_active,
          CASE
            WHEN c.expiration_date < NOW() THEN TRUE
            WHEN c.is_active = FALSE THEN TRUE
            ELSE FALSE
          END as is_expired
        FROM mycoupons mc
        JOIN coupons c ON mc.coupon_id = c.id
        WHERE mc.user_id = ?
        ORDER BY mc.created_at DESC
      `,
      [userId]
    );

    if (rows.length === 0) {
      console.log("Không tìm thấy mã giảm giá cho userId:", userId);
    }

    const couponsWithDiscount = rows.map((coupon) => ({
      ...coupon,
      calculated_discount:
        coupon.discount_type === "percentage"
          ? (coupon.min_purchase_amount || 0) * (coupon.discount_amount / 100)
          : coupon.discount_amount,
    }));

    res.json(couponsWithDiscount);
  } catch (error) {
    console.error("Error in getMyCoupons:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách mã giảm giá",
      error: error.message,
    });
  }
};

const getCoupon = async (req, res) => {
  try {
    // Lọc mã giảm giá 20% với các điều kiện chi tiết
    const [coupons] = await pool.query(
      `SELECT * FROM coupons
       WHERE discount_type = 'percentage'
         AND discount_amount = 20.0`
    );

    if (coupons.length === 0) {
      return res.status(404).json({
        message: "Không có mã giảm giá khả dụng.",
      });
    }

    // Chọn ngẫu nhiên một mã giảm giá từ danh sách các mã khả dụng
    const randomIndex = Math.floor(Math.random() * coupons.length);
    const coupon = coupons[randomIndex];

    res.json(coupon); // Trả về mã giảm giá ngẫu nhiên
  } catch (error) {
    console.error("Lỗi khi lấy mã giảm giá:", error);
    res.status(500).json({
      message: "Lỗi khi lấy mã giảm giá.",
      error: error.message,
    });
  }
};

const claimCoupon = async (req, res) => {
  const { user_id, coupon_id, course_id } = req.body;

  if (!coupon_id) {
    return res.status(400).json({
      success: false,
      message: "Coupon ID is required.",
    });
  }

  try {
    // Check if user has already claimed a coupon for this course
    const [existingClaim] = await pool.query(
      `SELECT * FROM mycoupons 
       WHERE user_id = ? AND course_id = ?`,
      [user_id, course_id]
    );

    if (existingClaim.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phần thưởng đã được nhận.",
      });
    }

    // Fetch the coupon details before inserting
    const [coupons] = await pool.query(`SELECT * FROM coupons WHERE id = ?`, [
      coupon_id,
    ]);

    if (coupons.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    const coupon = coupons[0];

    // Insert into mycoupons
    await pool.query(
      `INSERT INTO mycoupons (user_id, coupon_id, course_id, is_used) 
       VALUES (?, ?, ?, false)`,
      [user_id, coupon_id, course_id]
    );

    // Return successful response with coupon details
    res.json({
      success: true,
      message: "Coupon claimed successfully!",
      coupon: {
        code: coupon.code,
        discount_amount: coupon.discount_amount,
        expiration_date: coupon.expiration_date,
        min_purchase_amount: coupon.min_purchase_amount,
      },
    });
  } catch (error) {
    console.error("Error claiming coupon:", error);
    res.status(500).json({
      success: false,
      message: "Error claiming coupon.",
    });
  }
};

const checkCouponClaimed = async (req, res) => {
  const { user_id, course_id } = req.body;

  try {
    const [existingClaim] = await pool.query(
      `SELECT * FROM mycoupons WHERE user_id = ? AND course_id = ?`,
      [user_id, course_id]
    );

    if (existingClaim.length > 0) {
      return res.json({
        success: true,
        is_claimed: true,
      });
    }

    res.json({
      success: true,
      is_claimed: false,
    });
  } catch (error) {
    console.error("Error checking coupon claimed status:", error);
    res.status(500).json({
      success: false,
      message: "Error checking coupon claimed status.",
    });
  }
};

// Sử dụng mã giảm giá
const useCoupon = async (req, res) => {
  const userId = req.user.id;
  const { coupon_id } = req.params;
  const { course_id } = req.body;

  try {
    // Bắt đầu transaction
    await pool.query("START TRANSACTION");

    // Kiểm tra mã giảm giá có tồn tại và hợp lệ
    const [coupon] = await pool.query(
      `
        SELECT mc.*, c.*, courses.price as course_price
        FROM mycoupons mc
        JOIN coupons c ON mc.coupon_id = c.id
        LEFT JOIN courses ON mc.course_id = courses.id
        WHERE mc.user_id = ? 
        AND mc.coupon_id = ? 
        AND mc.is_used = FALSE
        AND c.is_active = TRUE
        AND (c.expiration_date IS NULL OR c.expiration_date > NOW())
        ${course_id ? "AND (mc.course_id IS NULL OR mc.course_id = ?)" : ""}
      `,
      course_id ? [userId, coupon_id, course_id] : [userId, coupon_id]
    );

    if (coupon.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        message: "Mã giảm giá không hợp lệ hoặc không thể sử dụng",
      });
    }

    // Kiểm tra điều kiện mua tối thiểu
    if (
      coupon[0].min_purchase_amount &&
      coupon[0].course_price < coupon[0].min_purchase_amount
    ) {
      await pool.query("ROLLBACK");
      return res.status(400).json({
        message: `Giá trị đơn hàng phải từ ${coupon[0].min_purchase_amount}đ`,
      });
    }

    // Tính số tiền giảm giá
    const discountAmount =
      coupon[0].discount_type === "percentage"
        ? coupon[0].course_price * (coupon[0].discount_amount / 100)
        : coupon[0].discount_amount;

    // Thêm vào bảng coupon_usage
    await pool.query(
      `INSERT INTO coupon_usage 
         (user_id, course_id, coupon_id, discount_amount, original_amount) 
         VALUES (?, ?, ?, ?, ?)`,
      [userId, course_id, coupon_id, discountAmount, coupon[0].course_price]
    );

    // Cập nhật trạng thái sử dụng
    await pool.query(
      "UPDATE mycoupons SET is_used = TRUE WHERE user_id = ? AND coupon_id = ?",
      [userId, coupon_id]
    );

    // Commit transaction
    await pool.query("COMMIT");

    res.json({
      message: "Sử dụng mã giảm giá thành công",
      discount_amount: discountAmount,
      final_price: coupon[0].course_price - discountAmount,
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({
      message: "Lỗi khi sử dụng mã giảm giá",
      error: error.message,
    });
  }
};

// Kiểm tra tính hợp lệ của mã giảm giá
const validateCoupon = async (req, res) => {
  const userId = req.user.id;
  const { coupon_code, course_id } = req.query;

  try {
    const [coupon] = await pool.query(
      `
        SELECT 
          mc.*,
          c.*,
          courses.price as course_price,
          courses.title as course_title,
          (SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = c.id) as usage_count
        FROM coupons c
        LEFT JOIN mycoupons mc ON mc.coupon_id = c.id AND mc.user_id = ?
        LEFT JOIN courses ON mc.course_id = courses.id
        WHERE c.code = ?
        AND c.is_active = TRUE
        AND (c.expiration_date IS NULL OR c.expiration_date > NOW())
        ${course_id ? "AND (mc.course_id IS NULL OR mc.course_id = ?)" : ""}
      `,
      course_id ? [userId, coupon_code, course_id] : [userId, coupon_code]
    );

    if (coupon.length === 0) {
      return res.status(404).json({
        message: "Mã giảm giá không tồn tại hoặc đã hết hạn",
      });
    }

    const couponData = coupon[0];

    // Kiểm tra các điều kiện
    const validationResults = {
      is_valid: true,
      remaining_usage: couponData.max_usage - couponData.usage_count,
      min_purchase_met:
        !couponData.min_purchase_amount ||
        couponData.course_price >= couponData.min_purchase_amount,
      calculated_discount:
        couponData.discount_type === "percentage"
          ? couponData.course_price * (couponData.discount_amount / 100)
          : couponData.discount_amount,
      messages: [],
    };

    if (validationResults.remaining_usage <= 0) {
      validationResults.is_valid = false;
      validationResults.messages.push("Mã giảm giá đã hết lượt sử dụng");
    }

    if (!validationResults.min_purchase_met) {
      validationResults.is_valid = false;
      validationResults.messages.push(
        `Giá trị đơn hàng phải từ ${couponData.min_purchase_amount}đ`
      );
    }

    res.json({
      coupon: {
        ...couponData,
        final_price:
          couponData.course_price - validationResults.calculated_discount,
      },
      validation: validationResults,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi kiểm tra mã giảm giá",
      error: error.message,
    });
  }
};

module.exports = {
  getMyCoupons,
  claimCoupon,
  useCoupon,
  validateCoupon,
  getCoupon,
  checkCouponClaimed,
};
