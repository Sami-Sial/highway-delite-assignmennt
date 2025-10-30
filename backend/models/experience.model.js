const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    image: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    highlights: [String],
    included: [String],
    notIncluded: [String],
    availableDates: [
      {
        date: { type: Date, required: true },
        slots: [
          {
            time: { type: String, required: true },
            available: { type: Number, required: true },
            booked: { type: Number, default: 0 },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Experience = mongoose.model("Experience", experienceSchema);

module.exports = Experience;
