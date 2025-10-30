const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    experienceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: true,
    },
    experienceTitle: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    customerPhone: { type: String, required: true },
    selectedDate: { type: Date, required: true },
    selectedSlot: { type: String, required: true },
    numberOfPeople: { type: Number, required: true, min: 1 },
    promoCode: { type: String, default: null },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed",
    },
    bookingReference: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
