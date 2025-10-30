// importing modules
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

// data parsing
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// connecting to database
const connectDB = async () => {
  await mongoose.connect(process.env.DB_URL);
};
connectDB()
  .then(() => {
    console.log("Successfully connected to Mongo DB");
  })
  .catch((err) => {
    console.log("Mongo DB Connection failed.", err.message);
    process.exit(1);
  });

// importing routes
const promoCodeRoutes = require("./routes/promo-code.routes");
const experienceRoutes = require("./routes/experience.routes");
const bookingRoutes = require("./routes/booking.routes");

app.use("/api/bookings", bookingRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/promo", promoCodeRoutes);

// Save Data
const saveData = async () => {
  console.log("hello");
};
saveData();

// Error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Some Error Occurred" } = err;
  res.status(status).send(message);
  console.log(err.stack);
});

// Listening to Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("server is listening on " + port);
});
