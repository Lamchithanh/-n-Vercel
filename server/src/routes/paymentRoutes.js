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

module.exports = router;
