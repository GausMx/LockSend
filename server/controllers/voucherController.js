const axios = require("axios");
const Voucher = require("../models/Voucher");
const generateVoucherCode = require("../utils/generateVoucherCode");
const { sendVoucherEmail } = require("../utils/resend");

// POST /api/voucher/create
const createVoucher = async (req, res) => {
  const { amountForeign, currency, recipientName, intendedHospitalName, senderPhone } = req.body;

  if (!amountForeign || !currency || !recipientName || !senderPhone) {
    return res.status(400).json({ message: "Amount, currency, recipient name and phone are required." });
  }
  if (!["GBP", "USD", "CAD"].includes(currency)) {
    return res.status(400).json({ message: "Currency must be GBP, USD, or CAD." });
  }
  if (parseFloat(amountForeign) < 10) {
    return res.status(400).json({ message: "Minimum voucher amount is 10." });
  }

  try {
    const voucher = await Voucher.create({
      senderId: req.user._id,
      amountForeign: parseFloat(amountForeign),
      currency,
      recipientName,
      intendedHospitalName: intendedHospitalName || null,
      senderPhone,
      status: "pending_payment",
    });

    const currencySymbols = { GBP: "£", USD: "$", CAD: "CA$" };
    const symbol = currencySymbols[currency];

    const flwPayload = {
      tx_ref: `LKSND-${voucher._id}`,
      amount: parseFloat((amountForeign * 1.05).toFixed(2)),
      currency,
      redirect_url: `${process.env.CLIENT_URL}/voucher/${voucher._id}?status=successful`,
      meta: {
        voucherId: voucher._id.toString(),
        senderId: req.user._id.toString(),
      },
      customer: {
        email: req.user.email,
        name: req.user.name,
        phonenumber: senderPhone,
      },
      customizations: {
        title: "LockSend Healthcare Voucher",
        description: `${symbol}${amountForeign} voucher for ${recipientName}`,
      },
    };

    const flwResponse = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      flwPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (flwResponse.data.status !== "success") {
      await Voucher.findByIdAndDelete(voucher._id);
      return res.status(500).json({ message: "Failed to initialize payment. Please try again." });
    }

    res.status(201).json({
      message: "Voucher created. Redirecting to payment.",
      voucherId: voucher._id,
      paymentLink: flwResponse.data.data.link,
    });
  } catch (err) {
    console.error("Create voucher error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to create voucher. Please try again." });
  }
};

// GET /api/voucher
const getMyVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ senderId: req.user._id }).sort({ createdAt: -1 });
    res.json({ vouchers });
  } catch (err) {
    console.error("Get my vouchers error:", err.message);
    res.status(500).json({ message: "Failed to fetch vouchers." });
  }
};

// GET /api/voucher/:voucherId
const getVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.voucherId).populate("senderId", "name email");

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found." });
    }
    if (voucher.senderId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json({ voucher });
  } catch (err) {
    console.error("Get voucher error:", err.message);
    res.status(500).json({ message: "Failed to fetch voucher." });
  }
};

// POST /api/webhooks/flutterwave
const flutterwaveWebhook = async (req, res) => {
  const signature = req.headers["verif-hash"];
  if (!signature || signature !== process.env.FLW_WEBHOOK_HASH) {
    return res.status(401).json({ message: "Invalid webhook signature." });
  }

  const payload = req.body;

  if (payload.event !== "charge.completed" || payload.data?.status !== "successful") {
    return res.status(200).json({ message: "Event ignored." });
  }

  try {
    const txRef = payload.data.tx_ref;
    const voucherId = txRef.replace("LKSND-", "");

    const voucher = await Voucher.findById(voucherId).populate("senderId", "name email");

    if (!voucher) {
      return res.status(200).json({ message: "Voucher not found." });
    }
    if (voucher.status !== "pending_payment") {
      return res.status(200).json({ message: "Already processed." });
    }

    // Lock in Naira amount at current FX rate
    let amountNaira = 0;
    try {
      const fxRes = await axios.get(
        `https://api.flutterwave.com/v3/transfers/rates?amount=${voucher.amountForeign}&destination_currency=NGN&source_currency=${voucher.currency}`,
        { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
      );
      amountNaira = fxRes.data.data.destination.amount;
    } catch (fxErr) {
      console.error("FX rate fetch failed, using fallback:", fxErr.message);
      const fallbackRates = { GBP: 2050, USD: 1600, CAD: 1180 };
      amountNaira = voucher.amountForeign * fallbackRates[voucher.currency];
    }

    // Generate unique voucher code
    let voucherCode;
    let isUnique = false;
    while (!isUnique) {
      voucherCode = generateVoucherCode();
      const existing = await Voucher.findOne({ voucherCode });
      if (!existing) isUnique = true;
    }

    voucher.status = "active";
    voucher.voucherCode = voucherCode;
    voucher.amountNaira = amountNaira;
    voucher.flutterwaveRef = payload.data.flw_ref;
    await voucher.save();

    await sendVoucherEmail({
      to: voucher.senderId.email,
      name: voucher.senderId.name,
      voucherCode,
      amountNaira,
      currency: voucher.currency,
      amountForeign: voucher.amountForeign,
      recipientName: voucher.recipientName,
      expiresAt: voucher.expiresAt,
      voucherId: voucher._id,
    });

    console.log(`✅ Voucher ${voucherCode} activated — ${voucher.senderId.email}`);
    res.status(200).json({ message: "Webhook processed." });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ message: "Webhook processing failed." });
  }
};

module.exports = { createVoucher, getVoucher, getMyVouchers, flutterwaveWebhook };