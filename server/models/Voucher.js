const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    voucherCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amountForeign: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["GBP", "USD", "CAD"],
      required: true,
    },
    amountNaira: {
      type: Number,
      default: null,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    intendedHospitalName: {
      type: String,
      trim: true,
      default: null,
    },
    senderPhone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending_payment",
        "active",
        "pending_approval",
        "redeemed",
        "expired",
        "refunded",
      ],
      default: "pending_payment",
    },
    flutterwaveRef: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

voucherSchema.index({ senderId: 1 });
voucherSchema.index({ status: 1 });

module.exports = mongoose.model("Voucher", voucherSchema);