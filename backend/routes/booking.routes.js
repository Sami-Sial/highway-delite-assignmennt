const express = require("express");
const router = express.Router();
const {
  createNewBooking,
  getBookingByReference,
} = require("../controllers/booking.controllers");

router.post("/", createNewBooking);
router.get("/:reference", getBookingByReference);

module.exports = router;
