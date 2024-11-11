const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const asyncHandler = require("express-async-handler");

const cropDao = require("../dao/userCrop-dao");

const {
  getCropByCategorySchema,
  getCropByIdSchema,
  cropCalendarFeedSchema,
  ongoingCultivationSchema,
  enrollSchema,
  getSlaveCropCalendarDaysSchema,
  updateCropCalendarStatusSchema
} = require("../validations/userCrop-validation");

const {
  checkOngoingCultivation,
  createOngoingCultivation,
  checkCropCount,
  checkEnrollCrop,
  enrollOngoingCultivationCrop,
  enrollSlaveCrop,
  cropCalendarDao,
  getSlaveCropCalendarDaysByUserAndCrop
} = require("../dao/userCrop-dao");
// const cropCalendarDao = require('../dao/cropCalendar-dao');
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

  //   if (crops[0].image) {
  //     const base64Image = Buffer.from(crops[0].image).toString('base64');
  //     const mimeType = 'image/png'; // Adjust MIME type if necessary, depending on the image type
  //     crops[0].image = `data:${mimeType};base64,${base64Image}`;
  // }

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

  //   if (results[0].image) {
  //     const base64Image = Buffer.from(results[0].image).toString('base64');
  //     const mimeType = 'image/png'; // Adjust MIME type if necessary, depending on the image type
  //     results[0].image = `data:${mimeType};base64,${base64Image}`;
  // }

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

  //   if (results[0].image) {
  //     const base64Image = Buffer.from(results[0].image).toString('base64');
  //     const mimeType = 'image/png'; // Adjust MIME type if necessary, depending on the image type
  //     results[0].image = `data:${mimeType};base64,${base64Image}`;
  // }

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
  // try {
  //   const cropId = req.params.cropId;
  //   const userId = req.user.id;

  //   console.log("User ID:", userId, "Crop ID:", cropId);

  //   // Check if the user already has an ongoing cultivation
  //   let cultivationId;
  //   const ongoingCultivationResult = await checkOngoingCultivation(userId);

  //   if (!ongoingCultivationResult[0]) {
  //     // If no ongoing cultivation exists, create one
  //     const newCultivationResult = await createOngoingCultivation(userId);
  //     cultivationId = newCultivationResult.insertId;
  //     console.log("Created new ongoing cultivation with ID:", cultivationId);
  //   } else {
  //     cultivationId = ongoingCultivationResult[0].id;
  //     console.log("Existing ongoing cultivation ID:", cultivationId);
  //   }

  //   // Check the crop count
  //   const cropCountResult = await checkCropCount(cultivationId);
  //   const cropCount = cropCountResult[0].count;

  //   if (cropCount >= 3) {
  //     return res.json({ message: "You have already enrolled in 3 crops" });
  //   }

  //   // Check if the crop is already enrolled
  //   const enrolledCrops = await checkEnrollCrop(cultivationId);
  //   if (enrolledCrops.some(crop => crop.cropCalendar == cropId)) {
  //     return res.json({ message: "You are already enrolled in this crop!" });
  //   }

  //   // Enroll the crop
  //   await enrollOngoingCultivationCrop(cultivationId, cropId);
  //   console.log("Successfully enrolled in crop ID:", cropId);

  //   return res.json({ message: "Enrollment successful" });

  // } catch (err) {
  //   console.error("Error during enrollment:", err);
  //   res.status(500).json({ message: "Internal Server Error" });
  // }

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

    // Check if crop count exceeds 3, and return a message to the frontend
    if (cropCount >= 3) {
      return res
        .status(400)
        .json({ message: "You have already enrolled in 3 crops" });
    }

    // Check if the crop is already enrolled
    const enrolledCrops = await checkEnrollCrop(cultivationId);
    if (enrolledCrops.some((crop) => crop.cropCalendar == cropId)) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this crop!" });
    }

    // Enroll the crop
    await enrollOngoingCultivationCrop(cultivationId, cropId);
    const responseenrollSlaveCrop= await enrollSlaveCrop(userId, cropId);
    
    console.log("Successfully enrolled in crop ID:", cropId);
    console.log("hi responseenrollSlaveCrop.....:", responseenrollSlaveCrop);

    return res.json({ message: "Enrollment successful" });
  } catch (err) {
    console.error("Error during enrollment:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//slave crop calender

//const { getSlaveCropCalendarDaysSchema } = require('../validations/cropCalendar-validation');


exports.getSlaveCropCalendarDaysByUserAndCrop = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request
        await getSlaveCropCalendarDaysSchema.validateAsync(req.params);

        const userId = req.user.id;
        const cropCalendarId = req.params.cropCalendarId;

        console.log("User ID:", userId);
        console.log("Crop Calendar ID:", cropCalendarId);

        // Fetch data using the DAO
        const results = await cropDao.getSlaveCropCalendarDaysByUserAndCrop(userId, cropCalendarId);

        if (results.length === 0) {
            return res.status(404).json({
                message: "No records found for the given userId and cropCalendarId.",
            });
        }

        console.log("Query result:", results);

        return res.status(200).json(results);

    } catch (err) {
        console.error("Error in getSlaveCropCalendarDaysByUserAndCrop:", err);

        if (err.isJoi) {
            return res.status(400).json({
                status: 'error',
                message: err.details[0].message,
            });
        }

        return res.status(500).json({ message: "Internal Server Error!" });
    }
});

//slave calender-update status
exports.updateCropCalendarStatus = asyncHandler(async (req, res) => {
  try {
      // Validate the request body
      await updateCropCalendarStatusSchema.validateAsync(req.body);

      const { id, status } = req.body;
      const currentTime = new Date();

      // Fetch the current task
      const taskResults = await cropDao.getTaskById(id);
      if (taskResults.length === 0) {
          return res.status(404).json({ message: "No record found with the provided id." });
      }

      const currentTask = taskResults[0];
      const { taskIndex, status: currentStatus, createdAt, cropCalendarId, userId } = currentTask;

      // Check if the task is being marked as 'pending' after 'completed' and restrict if more than 1 hour has passed
      if (currentStatus === 'completed' && status === 'pending') {
          const timeDiffInHours = Math.abs(currentTime - new Date(createdAt)) / 36e5;
          if (timeDiffInHours > 1) {
              return res.status(403).json({
                  message: "You cannot change the status back to pending after 1 hour of marking it as completed."
              });
          }
      }

      // If status is 'completed' and taskIndex > 1, check previous tasks
      if (status === 'completed' && taskIndex > 1) {
          const previousTasksResults = await cropDao.getPreviousTasks(taskIndex, cropCalendarId, userId);

          // Check if all previous tasks are completed
          let allPreviousTasksCompleted = true;
          let lastCompletedTask = null;
          for (const previousTask of previousTasksResults) {
              if (previousTask.status !== 'completed') {
                  allPreviousTasksCompleted = false;
                  break;
              }
              lastCompletedTask = previousTask;
          }

          if (!allPreviousTasksCompleted) {
              return res.status(400).json({ message: "You have to complete previous tasks before moving to the next." });
          }

          // Check the 6-hour waiting period for the last completed task
          if (lastCompletedTask) {
              const previousCreatedAt = new Date(lastCompletedTask.createdAt);
              const timeDiffInHours = Math.abs(currentTime - previousCreatedAt) / 36e5;
              if (timeDiffInHours < 6) {
                  return res.status(400).json({
                      message: "You need to wait 6 hours after completing the previous task before marking this task as completed."
                  });
              }
          }
      }

      // Proceed with updating the status
      const updateResults = await cropDao.updateTaskStatus(id, status);
      if (updateResults.affectedRows === 0) {
          return res.status(404).json({ message: "No record found with the provided id." });
      }

      res.status(200).json({ message: "Status updated successfully." });

  } catch (err) {
      console.error("Error updating status:", err);
      if (err.isJoi) {
          return res.status(400).json({
              status: 'error',
              message: err.details[0].message
          });
      }
      res.status(500).json({ message: "Internal Server Error!" });
  }
});

