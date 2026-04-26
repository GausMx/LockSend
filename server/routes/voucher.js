const express = require("express");
const router = express.Router();
const { createVoucher, getVoucher, getMyVouchers } = require("../controllers/voucherController");
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

router.get("/", getMyVouchers);
router.post("/create", createVoucher);
router.get("/:voucherId", getVoucher);

module.exports = router;