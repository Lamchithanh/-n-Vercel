// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentApicontroller = require("../controllers/PaymentController");

router.post("/payments/initiate", paymentApicontroller.initiatePayment);
router.post("/payments/confirm", paymentApicontroller.confirmPayment);
router.get(
  "/payments/status/:userId/:courseId",
  paymentApicontroller.checkPaymentStatus
);
router.get("/payments/user/:userId", paymentApicontroller.getUserPayments);
router.get(
  "/payments/details/:paymentId",
  paymentApicontroller.getPaymentDetails
);
router.post("/coupons/validate", paymentApicontroller.validateCoupon);
router.get("/coupons/check-coupon", paymentApicontroller.checkCouponStatus);
router.post("/coupons/remove-usage", paymentApicontroller.removeCouponUsage);
router.post("/coupons/apply", paymentApicontroller.applyCoupon);
router.get("/coupons/get-applied", paymentApicontroller.getAppliedCoupon);
module.exports = router;
