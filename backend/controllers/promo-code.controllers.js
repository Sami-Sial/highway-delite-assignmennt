const PromoCode = require("../models/promo-code.model");

exports.applyPromoCode = async (req, res) => {
  try {
    const { code, experiencePrice, numberOfPeople } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      active: true,
      expiryDate: { $gte: new Date() },
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired promo code",
      });
    }

    let discount = 0;
    const subtotal = experiencePrice * numberOfPeople;

    if (promo.type === "percentage") {
      discount = (subtotal * promo.value) / 100;
    } else if (promo.type === "flat") {
      discount = promo.value;
    }

    res.json({
      success: true,
      message: "Promo code applied successfully",
      data: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discount: Math.min(discount, subtotal),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating promo code",
      error: error.message,
    });
  }
};
