require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const voucherRoutes = require("./routes/voucher");
const webhookRoutes = require("./routes/webhook");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/voucher", voucherRoutes);
app.use("/api/webhooks", webhookRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "LockSend API", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });