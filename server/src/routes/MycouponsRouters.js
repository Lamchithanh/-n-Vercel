const express = require("express");
const router = express.Router();
const MycouponsController = require("../controllers/MycouponsController");
const { authMiddleware } = require("../middleware/auth");

router.get("/mycoupons/:userId", MycouponsController.getMyCoupons);
router.get("/mycoupons", MycouponsController.getCoupon);
router.post("/mycoupons/claim", MycouponsController.claimCoupon);
router.post("/mycoupons/check", MycouponsController.checkCouponClaimed);

// router.put("/mycoupons/:coupon_id/use", MycouponsController.useCoupon);
// router.delete("/mycoupons/:coupon_id", MycouponsController.deleteCoupon);
// router.get("/mycoupons/validate", MycouponsController.validateCoupon);

module.exports = router;
