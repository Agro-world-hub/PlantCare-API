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
    getSlaveCropCalendarDaysByUserAndCrop,
    getEnrollOngoingCultivationCrop,
} = require("../dao/userCrop-dao");
// const cropCalendarDao = require('../dao/cropCalendar-dao');
// const enrollValidator = require('../validator/enrollValidator');

// Endpoint to get crop by Category
exports.getCropByCategory = asyncHandler(async(req, res) => {
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

exports.getCropByDistrict = asyncHandler(async(req, res) => {
    try {

        const { categorie, district } = req.params;

        const crops = await cropDao.getCropByDistrict(categorie, district);
        console.log("Crops:", crops);

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
exports.getCropVariety = asyncHandler(async(req, res) => {
    try {
        // Validate the cropId parameter
        await getCropByIdSchema.validateAsync(req.params);

        const cropId = req.params.id;

        // Use the DAO to get crop details by crop ID
        const results = await cropDao.getCropVariety(cropId);

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

        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching crop details:", err);
        res.status(500).json({ message: "Internal Server Error !" });
    }
});

exports.getCropCalenderDetails = asyncHandler(async(req, res) => {
    try {
        // Validate the cropGroupId and variety parameters


        const id = req.params.id; // Using cropGroupId from URL
        const method = req.params.method;
        const naofcul = req.params.naofcul;

        // Use the DAO to get crop details by cropId, variety, and lang
        const results = await cropDao.getCropCalenderDetails(id, method, naofcul); // Pass lang to DAO function
        console.log("Results:", results);

        if (results.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Crop variety not found",
            });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching crop variety details:", err);
        res.status(500).json({ message: "Internal Server Error !" });
    }
});


exports.CropCalanderFeed = asyncHandler(async(req, res) => {
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

exports.OngoingCultivaionGetById = asyncHandler(async(req, res) => {
    try {
        // // Validate query parameters (like limit, offset) using Joi
        const { error, value } = ongoingCultivationSchema.validate(req.query);

        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message, // Send validation error message
            });
        }

        const userId = req.user.id; // Extract userId from token


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
            console.log("Ongoing cul Results:", results);

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

exports.enroll = asyncHandler(async(req, res) => {
    console.log("Enroll crop called");
    try {
        const cropId = req.body.cropId;
        const extentha = req.body.extentha || '0'; // Default to 0 if not provided
        const extentac = req.body.extentac || '0'; // Default to 0 if not provided
        const extentp = req.body.extentp || '0';   // Default to 0 if not provided
        const startDate = req.body.startDate;
        const userId = req.user.id;

        console.log("User ID:", userId, "Crop ID:", cropId, "Extentha:", extentha,  "Start Date:", startDate, "Extentac:", extentac, "Extentp:", extentp);


        // Validate input data with Joi
        const { error } = enrollSchema.validate({
            extentha,
            extentac,
            extentp,
            startedAt: startDate,
            ongoingCultivationId: null, // Assuming this is not being passed directly in req
            createdAt: undefined, // Not user-provided, default handled in schema
        });

        console.log("Error:", error);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        

        // Check if the user already has an ongoing cultivation
        let cultivationId;
        console.log("Checking ongoing cultivation for user ID:", userId);
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
        await enrollOngoingCultivationCrop(cultivationId, cropId, extentha, extentac,extentp, startDate);
        const enroledoncultivationcrop = await getEnrollOngoingCultivationCrop(cropId);
        let onCulscropID;
        if (enroledoncultivationcrop.length > 0) {
            onCulscropID = enroledoncultivationcrop[0].id;
        } else {
            console.log("No records found for the given cultivationId.");
        }

        console.log("Created ID:", onCulscropID);

        const responseenrollSlaveCrop = await enrollSlaveCrop(userId, cropId, startDate, onCulscropID);

        console.log("Successfully enrolled in crop ID:", cropId, "with extent:", extentp, "and start date:", startDate);
        console.log("hi responseenrollSlaveCrop.....:", responseenrollSlaveCrop);

        return res.json({ message: "Enrollment successful" });
    } catch (err) {
        console.error("Error during enrollment:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

exports.getOngoingCultivationCropByid = asyncHandler(async(req, res) => {
    try {
        const id = req.params.id;
        const results = await cropDao.getEnrollOngoingCultivationCropByid(id);
        console.log("Results:", results);

        if (results.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Crop variety not found",
            });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching crop variety details:", err);
        res.status(500).json({ message: "Internal Server Error !" });
    }
});

// exports.UpdateOngoingCultivationScrops = asyncHandler(async (req, res) => {
//   try {
//     const { extent, startedAt ,onCulscropID} = req.body;
//     if (!extent || !startedAt) {
//       return res.status(400).json({ message: "Extent and Start Date are required." });
//     }
//     console.log("ID:", onCulscropID, "Extent:", extent, "Started At:", startedAt);
//     const results = await cropDao.updateOngoingCultivationCrop(onCulscropID, extent, startedAt);

//     if (results.affectedRows === 0) {
//       return res.status(404).json({ message: "Ongoing cultivation crop not found or not updated." });
//     }

//     res.status(200).json({ message: "Ongoing cultivation crop updated successfully.", results });
//     console.log("Ongoing cultivation crop updated successfully.");
//   } catch (err) {
//     console.error("Error updating ongoing cultivation crop:", err);
//     res.status(500).json({ message: "Server error. Unable to update ongoing cultivation crop." });
//   }
// });

exports.UpdateOngoingCultivationScrops = asyncHandler(async(req, res) => {
    try {
        const { extentha,extentac, extentp, startedAt, onCulscropID } = req.body;
        if (!extentha|| !extentac || !extentp || !startedAt) {
            return res.status(400).json({ message: "Extent and Start Date are required." });
        }

        // Update the main ongoing cultivation crop
        const results = await cropDao.updateOngoingCultivationCrop(onCulscropID, extentha, extentac,extentp, startedAt);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Ongoing cultivation crop not found or not updated." });
        }

        // Fetch the days from the slavecropcalendardays table
        const slaveCropDays = await cropDao.getSlaveCropCalendarDays(onCulscropID);

        if (slaveCropDays.length === 0) {
            return res.status(404).json({ message: "No related records found in slavecropcalendardays." });
        }

        // Update each record in slavecropcalendardays
        for (const cropDay of slaveCropDays) {
            const { id, days } = cropDay;
            const newStartingDate = new Date(startedAt);
            newStartingDate.setDate(newStartingDate.getDate() + days); // Add the number of days to the start date

            const formattedDate = newStartingDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

            // Update the slavecropcalendardays table with the new startingDate
            const updateResult = await cropDao.updateSlaveCropCalendarDay(id, formattedDate);
            if (updateResult.affectedRows === 0) {
                console.error("Failed to update slavecropcalendardays for ID:", id);
            }
        }

        res.status(200).json({ message: "Ongoing cultivation crop and slavecropcalendardays updated successfully.", results });
        console.log("Ongoing cultivation crop and slavecropcalendardays updated successfully.");
    } catch (err) {
        console.error("Error updating ongoing cultivation crop:", err);
        res.status(500).json({ message: "Server error. Unable to update ongoing cultivation crop." });
    }
});



// exports.getSlaveCropCalendarDaysByUserAndCrop = asyncHandler(async(req, res) => {
//     try {
//         // Validate the incoming request
//         await getSlaveCropCalendarDaysSchema.validateAsync(req.params);
//         const limit = req.query.limit ;
//         const page = req.query.page;
//         const offset = (page - 1) * limit;
//         console.log('offset:', offset)
//         const userId = req.user.id;
//         const cropCalendarId = req.params.cropCalendarId;

//         console.log("User ID:", userId);
//         console.log("Crop Calendar ID:", cropCalendarId);

//         // Fetch data using the DAO
//         const results = await cropDao.getSlaveCropCalendarDaysByUserAndCrop(userId, cropCalendarId, offset, limit);
//         if (results.length === 0) {
//             return res.status(404).json({
//                 message: "No records found for the given userId and cropCalendarId.",
//             });
//         }

//         return res.status(200).json(results);

//     } catch (err) {
//         console.error("Error in getSlaveCropCalendarDaysByUserAndCrop:", err);

//         if (err.isJoi) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: err.details[0].message,
//             });
//         }

//         return res.status(500).json({ message: "Internal Server Error!" });
//     }
// });

exports.getSlaveCropCalendarDaysByUserAndCrop = asyncHandler(async(req, res) => {
    try {
        // Validate the incoming request
        await getSlaveCropCalendarDaysSchema.validateAsync(req.params);

        const userId = req.user.id;
        const cropCalendarId = req.params.cropCalendarId;

        // Fetch data using the DAO
        const results = await cropDao.getSlaveCropCalendarDaysByUserAndCrop(userId, cropCalendarId);

        if (results.length === 0) {
            return res.status(404).json({
                message: "No records found for the given userId and cropCalendarId.",
            });
        }


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


exports.getSlaveCropCalendarPrgress = asyncHandler(async (req, res) => { try {
  // Validate the incoming request
  await getSlaveCropCalendarDaysSchema.validateAsync(req.params);

  const userId = req.user.id;
  const cropCalendarId = req.params.cropCalendarId;

  console.log("User ID:", userId);
  console.log("Crop Calendar ID:", cropCalendarId);

  // Fetch data using the DAO
  const results = await cropDao.getSlaveCropCalendarPrgress(userId, cropCalendarId);

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
}});

//slave calender-update status
exports.updateCropCalendarStatus = asyncHandler(async(req, res) => {
    console.log("Update crop calendar status called");
    try {
        // Validate the request body
        await updateCropCalendarStatusSchema.validateAsync(req.body);

        const { id, status } = req.body;
        const currentTime = new Date();

        // Fetch the current task
        const taskResults = await cropDao.getTaskById(id);
        if (taskResults.length === 0) {
            return res
                .status(404)
                .json({ message: "No record found with the provided id." });
        }

        const currentTask = taskResults[0];
        const {
            taskIndex,
            status: currentStatus,
            createdAt,
            cropCalendarId,
            days,
            startingDate,
            userId,
        } = currentTask;

        // Check if the task is being marked as 'pending' after 'completed' and restrict if more than 1 hour has passed
        if (currentStatus === "completed" && status === "pending") {
            const timeDiffInHours = Math.abs(currentTime - new Date(createdAt)) / 36e5;
            console.log("Time difference in hours:", timeDiffInHours);
            if (timeDiffInHours > 1) {
                return res.status(403).json({
                    message: "You cannot change the status back to pending after 1 hour of marking it as completed.",
                });
            }
        }

        // If status is 'completed' and taskIndex > 1, check previous tasks
        if (status === "completed" && taskIndex > 1) {
            const previousTasksResults = await cropDao.getPreviousTasks(
                taskIndex,
                cropCalendarId,
                userId,
                status
            );
            console.log("Previous tasks:", previousTasksResults);

            // Check if all previous tasks are completed
            let allPreviousTasksCompleted = true;
            let lastCompletedTask = null;
            for (const previousTask of previousTasksResults) {
                if (previousTask.status !== "completed") {
                    allPreviousTasksCompleted = false;
                    break;
                }
                lastCompletedTask = previousTask;
            }

            if (!allPreviousTasksCompleted) {
                return res
                    .status(400)
                    .json({
                        message: "You have to complete previous tasks before moving to the next.",
                    });
            }

            if (lastCompletedTask && currentTask && lastCompletedTask.status === "completed") {
                const previousCreatedAt = new Date(lastCompletedTask.createdAt);
                const taskDays = currentTask.days;
                console.log("TaskDyas:", taskDays);
                const nextTaskStartDate = new Date(
                    previousCreatedAt.getTime() + taskDays * 24 * 60 * 60 * 1000
                );
                const currentDate = new Date();
                const remainingTime = nextTaskStartDate - currentDate;
                const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
                console.log("Remaining days:", remainingDays);

                // If the remaining days are greater than 0, restrict updating
                if (remainingDays > 0) {
                    return res
                        .status(400)
                        .json({
                            message: `You need to wait ${remainingDays} days before marking this task as completed.`,
                        });
                }
            }
        }

        // Proceed with updating the status
        const updateResults = await cropDao.updateTaskStatus(id, status);

        if (updateResults.affectedRows === 0) {
            return res
                .status(404)
                .json({ message: "No record found with the provided id." });
        }

        // Delete images if the status is set to 'pending'
        if (status === "pending") {
            cropDao.gettaskImagesByID(id)
            .then((images) => {
                if (!images || images.length === 0) {
                    console.log(`No images found for task ID: ${id}`);
                } else {
                    console.log(`Fetched images for task ID: ${id}`, images);
                    
                }
    
                return cropDao.deleteImagesBySlaveId(id);
            })
                .then((deleteImagesResult) => {
                    console.log(`Deleted ${deleteImagesResult.affectedRows} images for task ID: ${id}`);
                })
                .catch((error) => {
                    console.error("Error deleting images:", error);
                    return res.status(500).json({ message: "Error deleting images" });
                })
                .finally(() => {
                    // Always send a response, but ensure it's only once
                    if (!res.headersSent) {
                        res.status(200).json({ message: "Status updated successfully." });
                    }
                });
            cropDao.deleteGeoLocationByTaskId(id);
        } else {
            if (!res.headersSent) {
                res.status(200).json({ message: "Status updated successfully." });
            }
        }
    } catch (err) {
        console.error("Error updating status:", err);
        if (err.isJoi) {
            return res.status(400).json({
                status: "error",
                message: err.details[0].message,
            });
        }
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

exports.addGeoLocation = asyncHandler(async (req, res) => {
    try {
        const { latitude, longitude, taskId } = req.body;
        console.log(latitude, longitude, taskId);

        // Validate if taskId exists in slavecropcalendardays table
        const taskExists = await cropDao.checkTaskExists(taskId);

        if (!taskExists) {
            return res.status(404).json({
                status: "error",
                message: `No task found for taskId ${taskId}. Please ensure the taskId is correct.`,
            });
        }

        // If taskId exists, insert geo-location data
        const results = await cropDao.addGeoLocation(taskId, longitude, latitude);
        console.log("Geo-location added:", results);

        if (results.affectedRows === 0) {
            return res.status(400).json({
                status: "error",
                message: "Failed to insert geo location.",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Geo-location added successfully.",
            data: results,
        });
    } catch (err) {
        console.error("Error fetching geo location details:", err);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});
