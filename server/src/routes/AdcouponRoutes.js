const express = require("express");
const router = express.Router();
const couponController = require("../controllers/AdcouponController");
const paymentApicontroller = require("../controllers/PaymentController");

router.get("/coupons", couponController.getAllCoupons);
router.post("/addcoupons", couponController.createCoupon);
router.delete("/coupons/:id", couponController.deleteCoupon);
router.post("/coupons/validate", paymentApicontroller.validateCoupon);

module.exports = router;
