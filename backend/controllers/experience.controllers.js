const Experience = require("../models/experience.model");

// GET /experiences - Get all experiences
exports.getAllExperiences = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const experiences = await Experience.find(query).select("-availableDates");
    res.json({
      success: true,
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching experiences",
      error: error.message,
    });
  }
};

// GET /experiences/:id - Get experience details
exports.getExperienceDetails = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    res.json({
      success: true,
      data: experience,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching experience details",
      error: error.message,
    });
  }
};
