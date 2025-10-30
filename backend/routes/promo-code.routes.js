const express = require("express");
const router = express.Router();
const { applyPromoCode } = require("../controllers/promo-code.controllers");

router.post("/validate", applyPromoCode);

module.exports = router;
