const pool = require("../config/pool");

// Thêm mã giảm giá vào danh sách yêu thích
const addFavorite = async (req, res) => {
  const { coupon_id } = req.body;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      "INSERT INTO user_favorite_coupons (user_id, coupon_id) VALUES ($1, $2) RETURNING *",
      [user_id, coupon_id]
    );
    res.status(201).json({
      message: "Mã giảm giá đã được thêm vào danh sách yêu thích",
      favorite: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      res.status(400).json({
        message: "Mã giảm giá này đã có trong danh sách yêu thích",
      });
    } else {
      console.error("Lỗi khi thêm mã giảm giá:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }
};

// Xóa mã giảm giá khỏi danh sách yêu thích
const removeFavorite = async (req, res) => {
  const coupon_id = req.params.couponId;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM user_favorite_coupons WHERE user_id = $1 AND coupon_id = $2 RETURNING *",
      [user_id, coupon_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy mã giảm giá trong danh sách yêu thích",
      });
    }

    res.json({ message: "Đã xóa mã giảm giá khỏi danh sách yêu thích" });
  } catch (error) {
    console.error("Lỗi khi xóa mã giảm giá:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách mã giảm giá yêu thích của user
const getFavorites = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT c.*, ufc.added_at
       FROM user_favorite_coupons ufc
       JOIN coupons c ON ufc.coupon_id = c.id
       WHERE ufc.user_id = $1
       ORDER BY ufc.added_at DESC`,
      [user_id]
    );

    res.json({ favorites: result.rows });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu thích:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Kiểm tra xem một mã giảm giá có trong danh sách yêu thích không
const checkFavorite = async (req, res) => {
  const coupon_id = req.params.couponId;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM user_favorite_coupons WHERE user_id = $1 AND coupon_id = $2",
      [user_id, coupon_id]
    );

    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error("Lỗi khi kiểm tra mã giảm giá yêu thích:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
};
