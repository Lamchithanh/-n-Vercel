const pool = require("../config/pool");

// Utility function for logging errors
const logError = (error, context) => {
  console.error(`[${context}] Error Details:`, {
    message: error.message,
    stack: error.stack,
    code: error.code,
    sqlMessage: error.sqlMessage,
    sqlState: error.sqlState,
    timestamp: new Date().toISOString(),
  });
};

// Validation function for coupon data
const validateCouponData = (data) => {
  const errors = [];

  // Validate code
  if (!data.code?.trim()) {
    errors.push("Code is required");
  } else if (data.code.length > 50) {
    errors.push("Code must not exceed 50 characters");
  }

  // Validate discount_amount
  if (data.discount_amount === undefined || data.discount_amount === null) {
    errors.push("Discount amount is required");
  } else {
    const amount = parseFloat(data.discount_amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push("Discount amount must be a positive number");
    }

    // For percentage discount, validate range
    if (data.discount_type === "percentage" && (amount <= 0 || amount > 100)) {
      errors.push("Percentage discount must be between 0 and 100");
    }
  }

  // Validate discount_type
  if (!data.discount_type) {
    errors.push("Discount type is required");
  } else if (!["percentage", "fixed"].includes(data.discount_type)) {
    errors.push("Discount type must be either 'percentage' or 'fixed'");
  }

  return errors;
};

// Get all coupons
const getAllCoupons = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM coupons ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    logError(error, "getAllCoupons");
    res.status(500).json({
      message: "Lỗi khi lấy danh sách coupon",
      error: error.message,
    });
  }
};

const moment = require("moment");

const createCoupon = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      code,
      discount_amount,
      discount_type,
      max_usage = 100, // Mặc định số lần dùng tối đa là 100
      min_purchase_amount,
      expiration_date, // Ngày giờ sẽ được chuyển đổi ở đây
      is_active = true, // Mặc định trạng thái là mở (true)
    } = req.body;

    // Chuyển đổi expiration_date thành định dạng phù hợp với MySQL (YYYY-MM-DD HH:mm:ss)
    const formattedExpirationDate = moment(expiration_date).format(
      "YYYY-MM-DD HH:mm:ss"
    );

    // Validate input data
    const validationErrors = validateCouponData({
      code,
      discount_amount,
      discount_type,
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: validationErrors,
      });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO coupons 
        (code, discount_amount, discount_type, max_usage, min_purchase_amount, expiration_date, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        discount_amount,
        discount_type,
        max_usage, // Sử dụng giá trị max_usage từ request hoặc mặc định là 100
        min_purchase_amount,
        formattedExpirationDate, // Sử dụng giá trị đã được định dạng
        is_active, // Mặc định là true nếu không gửi từ client
      ]
    );

    await connection.commit();

    res.status(201).json({
      id: result.insertId,
      code,
      discount_amount,
      discount_type,
      max_usage,
      min_purchase_amount,
      expiration_date: formattedExpirationDate, // Trả về giá trị đã được định dạng lại
      is_active,
    });
  } catch (error) {
    await connection.rollback();
    logError(error, "createCoupon");

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Mã coupon đã tồn tại",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Lỗi khi tạo coupon",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const updateCoupon = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params; // Lấy ID coupon từ URL
    const {
      is_active, // Trạng thái cập nhật
      code,
      discount_amount,
      discount_type,
      max_usage,
      min_purchase_amount,
      expiration_date,
    } = req.body;

    await connection.beginTransaction();

    const formattedExpirationDate = expiration_date
      ? moment(expiration_date).format("YYYY-MM-DD HH:mm:ss")
      : null;

    // Query cập nhật trạng thái và các thông tin khác
    const [result] = await connection.query(
      `UPDATE coupons 
       SET code = ?, discount_amount = ?, discount_type = ?, max_usage = ?, 
           min_purchase_amount = ?, expiration_date = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        code,
        discount_amount,
        discount_type,
        max_usage,
        min_purchase_amount,
        formattedExpirationDate,
        is_active, // Giá trị trạng thái
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Coupon không tồn tại" });
    }

    await connection.commit();
    res.status(200).json({ message: "Cập nhật coupon thành công" });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi cập nhật coupon:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật coupon" });
  } finally {
    connection.release();
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      "DELETE FROM coupons WHERE id = ?",
      [id]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy coupon",
      });
    }

    res.json({
      message: "Xóa coupon thành công",
      id: Number(id),
    });
  } catch (error) {
    await connection.rollback();
    logError(error, "deleteCoupon");
    res.status(500).json({
      message: "Lỗi khi xóa coupon",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  updateCoupon,
};
