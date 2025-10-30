const Booking = require("../models/booking.model");
const Experience = require("../models/experience.model");

exports.createNewBooking = async (req, res) => {
  try {
    const {
      experienceId,
      customerName,
      customerEmail,
      customerPhone,
      selectedDate,
      selectedSlot,
      numberOfPeople = 1,
      promoCode,
      totalPrice,
    } = req.body;

    // Validate required fields
    if (
      !experienceId ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !selectedDate ||
      !selectedSlot ||
      !numberOfPeople ||
      !totalPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Get experience
    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    // Find the specific date and slot
    const dateEntry = experience.availableDates.find(
      (d) =>
        new Date(d.date).toDateString() ===
        new Date(selectedDate).toDateString()
    );

    if (!dateEntry) {
      return res.status(400).json({
        success: false,
        message: "Selected date not available",
      });
    }

    const slotEntry = dateEntry.slots.find((s) => s.time === selectedSlot);
    if (!slotEntry) {
      return res.status(400).json({
        success: false,
        message: "Selected slot not available",
      });
    }

    // Check availability
    const availableSpots = slotEntry.available - slotEntry.booked;
    if (availableSpots < numberOfPeople) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableSpots} spots available for this slot`,
      });
    }

    // Calculate discount if promo code provided
    let discount = 0;
    if (promoCode) {
      const promo = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        active: true,
        expiryDate: { $gte: new Date() },
      });

      if (promo) {
        if (promo.type === "percentage") {
          discount = (experience.price * numberOfPeople * promo.value) / 100;
        } else if (promo.type === "flat") {
          discount = promo.value;
        }
      }
    }

    // Helper function to generate booking reference
    const generateBookingReference = () => {
      const prefix = "BK";
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${prefix}-${timestamp}-${random}`;
    };

    // Create booking
    const booking = new Booking({
      experienceId,
      experienceTitle: experience.title,
      customerName,
      customerEmail,
      customerPhone,
      selectedDate,
      selectedSlot,
      numberOfPeople,
      promoCode: promoCode || null,
      discount,
      totalPrice,
      bookingReference: generateBookingReference(),
    });

    await booking.save();

    // Update slot availability
    slotEntry.booked += numberOfPeople;
    await experience.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

exports.getBookingByReference = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingReference: req.params.reference,
    }).populate("experienceId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};
