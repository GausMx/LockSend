const express = require("express");
const router = express.Router();
const { flutterwaveWebhook } = require("../controllers/voucherController");

router.post("/flutterwave", flutterwaveWebhook);

module.exports = router;