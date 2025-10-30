const express = require("express");
const router = express.Router();
const {
  getAllExperiences,
  getExperienceDetails,
} = require("../controllers/experience.controllers");

router.get("/", getAllExperiences);
router.get("/:id", getExperienceDetails);

module.exports = router;
