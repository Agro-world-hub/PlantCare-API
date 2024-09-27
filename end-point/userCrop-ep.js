const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");

const cropDao = require("../dao/userCrop-dao");

const {
  getCropByCategorySchema,
  getCropByIdSchema,
  cropCalendarFeedSchema,
  ongoingCultivationSchema,
  enrollSchema 
} = require("../validations/userCrop-validation");

const { checkOngoingCultivation, createOngoingCultivation, checkCropCount, checkEnrollCrop, enrollOngoingCultivationCrop } = require('../dao/userCrop-dao');
// const enrollValidator = require('../validator/enrollValidator');




// Endpoint to get crop by Category
exports.getCropByCategory = asyncHandler(async (req, res) => {
  try {
    // Validate the request params using Joi
    const { error } = getCropByCategorySchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }

    const { categorie } = req.params;

    // Call the DAO to get crops by category
    const crops = await cropDao.getCropByCategory(categorie);

    res.status(200).json(crops);
  } catch (err) {
    console.error("Error fetching crops by category:", err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching crops by category.",
    });
  }
});

// Endpoint to get crop by ID
exports.getCropById = asyncHandler(async (req, res) => {
  try {
    // Validate the cropId parameter
    await getCropByIdSchema.validateAsync(req.params);

    const cropId = req.params.id;

    // Use the DAO to get crop details by crop ID
    const results = await cropDao.getCropById(cropId);

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Crop not found",
      });
    }

    res.status(200).json([results[0]]);
  } catch (err) {
    console.error("Error fetching crop details:", err);
    res.status(500).json({ message: "Internal Server Error !" });
  }
});

exports.CropCalanderFeed = asyncHandler(async (req, res) => {
  try {
    // Validate the cropId parameter from URL
    const { error } = cropCalendarFeedSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message, // Return validation error message
      });
    }

    const userId = req.user.id; // Extract userId from token (assuming authentication middleware)
    const cropId = req.params.cropid; // Get cropId from URL parameters

    console.log("hi...User ID:", userId);
    console.log("hi.. Crop ID:", cropId);

    // Fetch crop calendar feed using DAO
    const results = await cropDao.getCropCalendarFeed(userId, cropId);

    if (!results || results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No data found for the given crop ID and user",
      });
    }

    // Return success response with fetched results
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching crop calendar feed:", err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching the crop calendar feed.",
    });
  }
});

exports.OngoingCultivaionGetById = asyncHandler(async (req, res) => {
  try {
    // Validate query parameters (like limit, offset) using Joi
    const { error, value } = ongoingCultivationSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message, // Send validation error message
      });
    }

    const userId = req.user.id; // Extract userId from token

    // You can access pagination parameters like this if needed:
    const limit = value.limit || 10; // Default limit is 10
    const offset = value.offset || 0; // Default offset is 0

    // Fetch data from DAO
    cropDao.getOngoingCultivationsByUserId(userId, (err, results) => {
      if (err) {
        console.error("Error fetching data from DAO:", err);
        return res.status(500).json({
          status: "error",
          message: "An error occurred while fetching data.",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No ongoing cultivation found for this user",
        });
      }

      // Successful response
      res.status(200).json(results);
    });
  } catch (err) {
    console.error("Error in OngoingCultivationGetById:", err);
    res
      .status(500)
      .json({ status: "error", message: "Internal Server Error!" });
  }
});


///

exports.enroll = asyncHandler(async (req, res) => {
  try {
    const cropId = req.params.cropId;
    const userId = req.user.id;

    console.log("User ID:", userId, "Crop ID:", cropId);

    // Check if the user already has an ongoing cultivation
    let cultivationId;
    const ongoingCultivationResult = await checkOngoingCultivation(userId);

    if (!ongoingCultivationResult[0]) {
      // If no ongoing cultivation exists, create one
      const newCultivationResult = await createOngoingCultivation(userId);
      cultivationId = newCultivationResult.insertId;
      console.log("Created new ongoing cultivation with ID:", cultivationId);
    } else {
      cultivationId = ongoingCultivationResult[0].id;
      console.log("Existing ongoing cultivation ID:", cultivationId);
    }

    // Check the crop count
    const cropCountResult = await checkCropCount(cultivationId);
    const cropCount = cropCountResult[0].count;

    if (cropCount >= 3) {
      return res.json({ message: "You have already enrolled in 3 crops" });
    }

    // Check if the crop is already enrolled
    const enrolledCrops = await checkEnrollCrop(cultivationId);
    if (enrolledCrops.some(crop => crop.cropCalendar == cropId)) {
      return res.json({ message: "You are already enrolled in this crop!" });
    }

    // Enroll the crop
    await enrollOngoingCultivationCrop(cultivationId, cropId);
    console.log("Successfully enrolled in crop ID:", cropId);

    return res.json({ message: "Enrollment successful" });

  } catch (err) {
    console.error("Error during enrollment:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

