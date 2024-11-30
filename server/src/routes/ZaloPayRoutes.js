const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();

const APP_ID = "2554";
const KEY1 = "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn";
const KEY2 = "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf";
const ZALOPAY_ENDPOINT = "https://sb-openapi.zalopay.vn/v2/create";

router.post("/create-order", async (req, res) => {
  const { amount, description, userId } = req.body;

  try {
    console.log("Incoming request body:", req.body);

    const embedData = JSON.stringify({ userId });
    const timestamp = Date.now();

    const orderData = {
      app_id: APP_ID,
      app_trans_id: `${timestamp}`,
      app_user: `user_${userId}`,
      app_time: timestamp,
      item: JSON.stringify([{ name: description, amount, quantity: 1 }]),
      embed_data: embedData,
      amount,
      description,
      bank_code: "", // If no bank code, you can leave it empty
    };

    console.log("Order data to send to ZaloPay:", orderData);

    // Concatenate values for MAC
    const dataToSign =
      APP_ID +
      "|" +
      orderData.app_trans_id +
      "|" +
      orderData.app_user +
      "|" +
      orderData.amount +
      "|" +
      orderData.app_time +
      "|" +
      orderData.embed_data +
      "|" +
      orderData.item;

    // Generate MAC
    orderData.mac = crypto
      .createHmac("sha256", KEY1)
      .update(dataToSign)
      .digest("hex");

    console.log("MAC signature:", orderData.mac);

    // Send request to ZaloPay
    const response = await axios.post(ZALOPAY_ENDPOINT, orderData, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Response from ZaloPay:", response.data);

    if (response.data.return_code === 1) {
      res.status(200).json({
        message: "Tạo đơn hàng thành công",
        paymentUrl: response.data.order_url,
      });
    } else {
      console.error("ZaloPay error:", response.data);
      res.status(400).json({
        message: "Tạo đơn hàng thất bại",
        detail: response.data.return_message,
      });
    }
  } catch (error) {
    console.error("Error creating ZaloPay order:", error.message);
    if (error.response) {
      console.error("ZaloPay API error response:", error.response.data);
      res.status(500).json({
        message: "Lỗi hệ thống",
        error: error.response.data || error.message,
      });
    } else {
      res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
  }
});

module.exports = router;
