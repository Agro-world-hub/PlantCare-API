const asyncHandler = require("express-async-handler");

const db = require("../startup/database");
const { attempt } = require("joi");

const getCropByCatogory = asyncHandler(async (req, res) => {
  try {
    const categorie = req.params.categorie;
    const sql = "SELECT * FROM cropcalender WHERE Category=?";
    db.query(sql, [categorie], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("An error occurred while fetching data.");
        return;
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.log("Error getAllNews", err);
    res.status(500).json({ message: "Internal Server Error !" });
  }
});

const getCropById = asyncHandler(async (req, res) => {
  try {
    const cropid = req.params.id;
    const sql = "SELECT * FROM cropcalender WHERE id=?";
    db.query(sql, [cropid], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("An error occurred while fetching data.");
        return;
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.log("Error getAllNews", err);
    res.status(500).json({ message: "Internal Server Error !" });
  }
});

const CropCalanderFeed = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const cropId = req.params.cropid;
    console.log(userId);
    console.log(cropId);

    //const sql = 'SELECT * FROM ongoingcultivations c, ongoingcultivationscrops oc, 	cropcalendardays crd WHERE c.id = oc.ongoingCultivationId AND oc.cropCalendar=crd.id AND c.userId = ? AND crd.cropId = ?'

    const sql =
      "SELECT * FROM ongoingcultivations oc, ongoingcultivationscrops ocr, cropcalendardays cd WHERE oc.id= ocr.ongoingCultivationId and ocr.cropCalendar = cd.cropId and oc.userId=? and cd.cropId=?";

    db.query(sql, [userId, cropId], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("An error occurred while fetching data.");
        return;
      }
      console.log("sql q is...", sql);
      console.log("result  is...", results);

      res.status(200).json(results);
    });
  } catch (err) {
    console.log("Error getting OnGoingCultivations", err);
    res.status(500).json({ message: "Internal Server Error !" });
  }
});

const enroll = async (req, res) => {
  try {
    console.log("run");

    const cropId = req.params.cropId;
    const userId = req.user.id;
    console.log("cropId IS.....", cropId);
    console.log("userId IS.....", userId);

    let cultivationId;

    const check_ongoingcultivation_sql =
      "SELECT id FROM ongoingcultivations WHERE userId = ?";
    const create_ongoingcultivation_sql =
      "INSERT INTO ongoingcultivations(userId) VALUES (?)";
    const check_crop_count_sql =
      "SELECT COUNT(id) as count FROM ongoingcultivationscrops WHERE ongoingCultivationId = ?";
    const check_enroll_crop_sql =
      "SELECT cropCalendar FROM ongoingcultivationscrops WHERE ongoingCultivationId = ?";
    const enroll_ongoingcultivationCrop_sql =
      "INSERT INTO ongoingcultivationscrops(ongoingCultivationId, cropCalendar) VALUES (?, ?)";
    const enroll_slave_crop_sql = `
      INSERT INTO slavecropcalendardays (
        userId, cropCalendarId, taskIndex, days, taskTypeEnglish, taskTypeSinhala, taskTypeTamil,
        taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, taskEnglish, taskSinhala, taskTamil,
        taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil, status
      )
      SELECT ?, ccd.cropId, ccd.taskIndex, ccd.days, ccd.taskTypeEnglish, ccd.taskTypeSinhala, ccd.taskTypeTamil,
             ccd.taskCategoryEnglish, ccd.taskCategorySinhala, ccd.taskCategoryTamil, ccd.taskEnglish, ccd.taskSinhala,
             ccd.taskTamil, ccd.taskDescriptionEnglish, ccd.taskDescriptionSinhala, ccd.taskDescriptionTamil, 'pending'
      FROM cropcalendardays ccd
      WHERE ccd.cropId = ?;
    `;

    const query = (sql, params) => {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      });
    };

    const check_ongoingcultivation_result = await query(
      check_ongoingcultivation_sql,
      [userId]
    );

    if (!check_ongoingcultivation_result[0]) {
      const create_ongoingcultivation_result = await query(
        create_ongoingcultivation_sql,
        [userId]
      );
      cultivationId = create_ongoingcultivation_result.insertId;
      console.log(
        "create_ongoingcultivation_result--",
        create_ongoingcultivation_result.insertId
      );
    } else {
      cultivationId = check_ongoingcultivation_result[0].id;
    }

    const crop_count = await query(check_crop_count_sql, [cultivationId]);
    console.log("crop count : ", crop_count[0].count);

    if (crop_count[0].count < 3) {
      const check_enroll_crop = await query(check_enroll_crop_sql, [
        cultivationId,
      ]);

      if (check_enroll_crop.length > 0) {
        const cropAlreadyEnrolled = check_enroll_crop.some(
          (crop) => crop.cropCalendar == cropId
        );

        if (cropAlreadyEnrolled) {
          return res.json({
            message: "You are already enrolled in this crop!",
          });
        }
      }

      const enroll_ongoingcultivationCrop_result = await query(
        enroll_ongoingcultivationCrop_sql,
        [cultivationId, cropId]
      );
      const enroll_slave_crop_result = await query(enroll_slave_crop_sql, [
        userId,
        cropId,
      ]);
      console.log(
        "enrollment successful",
        enroll_ongoingcultivationCrop_result
      );
      console.log("hi.... enrollment successful ", enroll_slave_crop_result);

      return res.json({ message: "Enrollment successful" });
    } else {
      return res.json({ message: "You have already enrolled 3 crops" });
    }
  } catch (err) {
    console.error("Error in enroll function:", err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

//my cultivation endpoints

const OngoingCultivaionGetById = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    const sql =
      "SELECT * FROM ongoingcultivations c, ongoingcultivationscrops oc, cropcalender cr WHERE c.id = oc.ongoingCultivationId AND oc.cropCalendar=cr.id AND c.userId = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("An error occurred while fetching data.");
        return;
      }
      console.log("sql q is...", sql);
      console.log("result  is...", results);

      res.status(200).json(results);
    });
  } catch (err) {
    console.log("Error getting OnGoingCultivations", err);
    res.status(500).json({ message: "Internal Server Error !" });
  }
});

////

const insertTasksToSlaveCropCalendarDays = asyncHandler(async (req, res) => {
  try {
    const { userId, cropCalendarId } = req.body;

    // SQL query to copy tasks from CropCalendarDays to SlaveCropCalendarDays
    const sql = `
      INSERT INTO slavecropcalendardays (
        userId, cropCalendarId, taskIndex, days, taskTypeEnglish, taskTypeSinhala, taskTypeTamil,
        taskCategoryEnglish, taskCategorySinhala, taskCategoryTamil, taskEnglish, taskSinhala, taskTamil,
        taskDescriptionEnglish, taskDescriptionSinhala, taskDescriptionTamil, status
      )
      SELECT ?, ccd.cropId, ccd.taskIndex, ccd.days, ccd.taskTypeEnglish, ccd.taskTypeSinhala, ccd.taskTypeTamil,
             ccd.taskCategoryEnglish, ccd.taskCategorySinhala, ccd.taskCategoryTamil, ccd.taskEnglish, ccd.taskSinhala,
             ccd.taskTamil, ccd.taskDescriptionEnglish, ccd.taskDescriptionSinhala, ccd.taskDescriptionTamil, 'pending'
      FROM cropcalendardays ccd
      WHERE ccd.cropId = ?;
    `;

    db.query(sql, [userId, cropCalendarId], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("An error occurred while inserting data.");
        return;
      }

      console.log("SQL query executed:", sql);
      console.log("Insert result:", results);

      res.status(200).json({
        message: "Tasks copied successfully into slaveCropcalendardays.",
        affectedRows: results.affectedRows,
      });
    });
  } catch (err) {
    console.log("Error inserting tasks to SlaveCropCalendarDays", err);
    res.status(500).json({ message: "Internal Server Error !" });
  }
});

const getSlaveCropCalendarDaysByUserAndCrop = asyncHandler(async (req, res) => {
  try {
    // Getting userId from req.user.id
    const userId = req.user.id;
    const cropCalendarId = req.params.cropCalendarId;

    console.log("User ID:", userId);
    console.log("Crop Calendar ID:", cropCalendarId);

    const sql = `
      SELECT * 
      FROM slavecropcalendardays 
      WHERE userId = ? AND cropCalendarId = ?
    `;

    db.query(sql, [userId, cropCalendarId], (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("An error occurred while fetching data.");
        return;
      }

      if (results.length === 0) {
        res.status(404).json({
          message: "No records found for the given userId and cropCalendarId.",
        });
        return;
      }

      console.log("Query result:", results);

      res.status(200).json(results);
    });
  } catch (err) {
    console.log("Error getCropCalendarDaysByUserAndCrop", err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

const updateSlaveCropStatusById = asyncHandler(async (req, res) => {
  try {
    const { id, status } = req.body; // Get id and status from the request body

    // Fetch the current task and its createdAt timestamp
    const fetchCurrentTaskSql =
      "SELECT status, createdAt FROM slavecropcalendardays WHERE id = ?";
    db.query(fetchCurrentTaskSql, [id], (err, results) => {
      if (err) {
        console.error("Error executing fetch query:", err);
        return res.status(500).send("An error occurred while fetching data.");
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Task not found." });
      }

      const currentTask = results[0];
      const now = new Date();
      const completedAt = new Date(currentTask.createdAt);

      // If the user is trying to mark a "Completed" task as "Pending"
      if (currentTask.status === "completed" && status === "pending") {
        const timeDifference = (now - completedAt) / (1000 * 60 * 60); // Convert difference to hours

        // Check if the difference exceeds 1 hour
        if (timeDifference > 1) {
          return res.status(400).json({
            message:
              "You can't unmark a task after 01 hour if you marked it as completed previously.",
          });
        }
      }

      // Proceed with updating the current task's status
      const updateSql =
        "UPDATE slavecropcalendardays SET status=?, createdAt=NOW() WHERE id=?";
      db.query(updateSql, [status, id], (err, results) => {
        if (err) {
          console.error("Error executing update query:", err);
          return res.status(500).send("An error occurred while updating data.");
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Task not found." });
        }

        // Success response
        return res
          .status(200)
          .json({ message: "Task status updated successfully." });
      });
    });
  } catch (err) {
    console.log("Error updateStatusById", err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

//2nd attempt

// const updateCropCalendarStatus = asyncHandler(async (req, res) => {
//   try {
//     const { id, status } = req.body;

//     // First, get the current task details (taskIndex, status, etc.)
//     const getTaskSql =
//       "SELECT taskIndex, status, createdAt FROM slaveCropcalendardays WHERE id = ?";
//     db.query(getTaskSql, [id], (err, taskResults) => {
//       if (err) {
//         console.error("Error fetching task:", err);
//         return res
//           .status(500)
//           .send("An error occurred while fetching task data.");
//       }

//       if (taskResults.length === 0) {
//         return res.status(404).send("No record found with the provided id.");
//       }

//       const currentTask = taskResults[0];
//       const taskIndex = currentTask.taskIndex;
//       const currentStatus = currentTask.status;
//       const createdAt = new Date(currentTask.createdAt);
//       const currentTime = new Date();

//       // Check if the task is being marked as 'pending' after 'completed' and restrict if more than 1 hour has passed
//       if (currentStatus === "completed" && status === "pending") {
//         const timeDiffInHours = Math.abs(currentTime - createdAt) / 36e5; // Difference in hours
//         if (timeDiffInHours > 1 ) {
//           return res.status(403).json({
//             message:
//               "You cannot change the status back to pending after 1 hour of marking it as completed.",
//           });
//         }
//       }

//       // Skip the previous task check if taskIndex is 1 (i.e., the first task)
//       if (status === "completed" && taskIndex > 1) {
//         // <-- Change here to skip validation for taskIndex 1
//         const checkPreviousTasksSql = `
//           SELECT id, createdAt FROM slaveCropcalendardays 
//           WHERE taskIndex < ? AND cropCalendarId = (SELECT cropCalendarId FROM slaveCropcalendardays WHERE id = ?) 
//           ORDER BY taskIndex DESC LIMIT 1`;

//         db.query(
//           checkPreviousTasksSql,
//           [taskIndex, id],
//           (err, previousTaskResults) => {
//             if (err) {
//               console.error("Error checking previous tasks:", err);
//               return res
//                 .status(500)
//                 .send("An error occurred while checking previous tasks.");
//             }

//             // If no previous task found, or if the previous task is not completed, prevent the current task completion
//             if (previousTaskResults.length === 0) {
//               return res.status(400).json({
//                 message:
//                   "You have to complete previous tasks before moving to the next.",
//               });
//             }

//             const previousTask = previousTaskResults[0];
//             const previousCreatedAt = new Date(previousTask.createdAt);
//             const timeDiffInHours =
//               Math.abs(currentTime - previousCreatedAt) / 36e5; // Difference in hours

//             // If the time difference is less than 6 hours, prevent the current task completion
//             if (timeDiffInHours < 6 ) {
//               return res.status(400).json({
//                 message:
//                   "You need to wait 6 hours after completing the previous task before marking this task as completed.",
//               });
//             }

//             // Proceed with updating the status since the time gap is sufficient and previous tasks are completed
//             const updateSql =
//               "UPDATE slaveCropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
//             db.query(updateSql, [status, id], (err, updateResults) => {
//               if (err) {
//                 console.error("Error updating status:", err);
//                 return res
//                   .status(500)
//                   .send("An error occurred while updating the status.");
//               }

//               if (updateResults.affectedRows === 0) {
//                 return res
//                   .status(404)
//                   .send("No record found with the provided id.");
//               }

//               res.status(200).json({ message: "Status updated successfully." });
//             });
//           }
//         );
//       } else {
//         // If status is not 'completed' or taskIndex is 1, just proceed with the normal update
//         const updateSql =
//           "UPDATE slaveCropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
//         db.query(updateSql, [status, id], (err, updateResults) => {
//           if (err) {
//             console.error("Error updating status:", err);
//             return res
//               .status(500)
//               .send("An error occurred while updating the status.");
//           }

//           if (updateResults.affectedRows === 0) {
//             return res
//               .status(404)
//               .send("No record found with the provided id.");
//           }

//           res.status(200).json({ message: "Status updated successfully." });
//         });
//       }
//     });
//   } catch (err) {
//     console.log("Error updating status", err);
//     res.status(500).json({ message: "Internal Server Error!" });
//   }
// });

//3rd attempt

// const updateCropCalendarStatus = asyncHandler(async (req, res) => {
//   try {
//     const { id, status } = req.body;

//     // First, get the current task details (taskIndex, status, etc.)
//     const getTaskSql =
//       "SELECT taskIndex, status, createdAt FROM slaveCropcalendardays WHERE id = ?";
//     db.query(getTaskSql, [id], (err, taskResults) => {
//       if (err) {
//         console.error("Error fetching task:", err);
//         return res
//           .status(500)
//           .send("An error occurred while fetching task data.");
//       }

//       if (taskResults.length === 0) {
//         return res.status(404).send("No record found with the provided id.");
//       }

//       const currentTask = taskResults[0];
//       const taskIndex = currentTask.taskIndex;
//       const currentStatus = currentTask.status;
//       const createdAt = new Date(currentTask.createdAt);
//       const currentTime = new Date();

//       // Check if the task is being marked as 'pending' after 'completed' and restrict if more than 1 hour has passed
//       if (currentStatus === "completed" && status === "pending") {
//         const timeDiffInHours = Math.abs(currentTime - createdAt) / 36e5; // Difference in hours
//         if (timeDiffInHours > 1 ) {
//           return res.status(403).json({
//             message:
//               "You cannot change the status back to pending after 1 hour of marking it as completed.",
//           });
//         }
//       }

//       // Skip the previous task check if taskIndex is 1 (i.e., the first task)
//       if (status === "completed" && taskIndex > 1) {
//         // Change here to validate all previous tasks instead of just one
//         const checkPreviousTasksSql = `
//           SELECT id, taskIndex, createdAt, status FROM slaveCropcalendardays 
//           WHERE taskIndex < ? AND cropCalendarId = (SELECT cropCalendarId FROM slaveCropcalendardays WHERE id = ?)
//           ORDER BY taskIndex ASC`;

//         db.query(
//           checkPreviousTasksSql,
//           [taskIndex, id],
//           (err, previousTasksResults) => {
//             if (err) {
//               console.error("Error checking previous tasks:", err);
//               return res
//                 .status(500)
//                 .send("An error occurred while checking previous tasks.");
//             }

//             // Check if all previous tasks are completed
//             for (const previousTask of previousTasksResults) {
//               if (previousTask.status !== "completed") {
//                 return res.status(400).json({
//                   message:
//                     "You have to complete previous tasks before moving to the next.",
//                 });
//               }

//               const previousCreatedAt = new Date(previousTask.createdAt);
//               const timeDiffInHours = Math.abs(currentTime - previousCreatedAt) / 36e5;

//               // If the time difference is less than 6 hours, prevent the current task completion
//               if (timeDiffInHours < 6) {
//                 return res.status(400).json({
//                   message:
//                     "You need to wait 6 hours after completing the previous task before marking this task as completed.",
//                 });
//               }
//             }

//             // All previous tasks are completed, proceed with updating the status
//             const updateSql =
//               "UPDATE slaveCropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
//             db.query(updateSql, [status, id], (err, updateResults) => {
//               if (err) {
//                 console.error("Error updating status:", err);
//                 return res
//                   .status(500)
//                   .send("An error occurred while updating the status.");
//               }

//               if (updateResults.affectedRows === 0) {
//                 return res
//                   .status(404)
//                   .send("No record found with the provided id.");
//               }

//               res.status(200).json({ message: "Status updated successfully." });
//             });
//           }
//         );
//       } else {
//         // If status is not 'completed' or taskIndex is 1, just proceed with the normal update
//         const updateSql =
//           "UPDATE slaveCropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
//         db.query(updateSql, [status, id], (err, updateResults) => {
//           if (err) {
//             console.error("Error updating status:", err);
//             return res
//               .status(500)
//               .send("An error occurred while updating the status.");
//           }

//           if (updateResults.affectedRows === 0) {
//             return res
//               .status(404)
//               .send("No record found with the provided id.");
//           }

//           res.status(200).json({ message: "Status updated successfully." });
//         });
//       }
//     });
//   } catch (err) {
//     console.log("Error updating status", err);
//     res.status(500).json({ message: "Internal Server Error!" });
//   }
// });

// 4th attempt

// const updateCropCalendarStatus = asyncHandler(async (req, res) => {
//   try {
//     const { id, status } = req.body;

//     // First, get the current task details (taskIndex, status, etc.)
//     const getTaskSql =
//       "SELECT taskIndex, status, createdAt FROM slaveCropcalendardays WHERE id = ?";
//     db.query(getTaskSql, [id], (err, taskResults) => {
//       if (err) {
//         console.error("Error fetching task:", err);
//         return res
//           .status(500)
//           .send("An error occurred while fetching task data.");
//       }

//       if (taskResults.length === 0) {
//         return res.status(404).send("No record found with the provided id.");
//       }

//       const currentTask = taskResults[0];
//       const taskIndex = currentTask.taskIndex;
//       const currentStatus = currentTask.status;
//       const createdAt = new Date(currentTask.createdAt);
//       const currentTime = new Date();

//       // Check if the task is being marked as 'pending' after 'completed' and restrict if more than 1 hour has passed
//       if (currentStatus === "completed" && status === "pending") {
//         const timeDiffInHours = Math.abs(currentTime - createdAt) / 36e5; // Difference in hours
//         if (timeDiffInHours > 1 ) {
//           return res.status(403).json({
//             message:
//               "You cannot change the status back to pending after 1 hour of marking it as completed.",
//           });
//         }
//       }

//       // Skip the previous task check if taskIndex is 1 (i.e., the first task)
//       if (status === "completed" && taskIndex > 1) {
//         // Change here to validate all previous tasks instead of just one
//         const checkPreviousTasksSql = `
//           SELECT id, taskIndex, createdAt, status FROM slaveCropcalendardays 
//           WHERE taskIndex < ? AND cropCalendarId = (SELECT cropCalendarId FROM slaveCropcalendardays WHERE id = ?)
//           ORDER BY taskIndex ASC`;

//         db.query(
//           checkPreviousTasksSql,
//           [taskIndex, id],
//           (err, previousTasksResults) => {
//             if (err) {
//               console.error("Error checking previous tasks:", err);
//               return res
//                 .status(500)
//                 .send("An error occurred while checking previous tasks.");
//             }

//             // Step 1: First check if all previous tasks are completed
//             for (const previousTask of previousTasksResults) {
//               if (previousTask.status !== "completed") {
//                 // If any previous task is not completed, return the appropriate message
//                 return res.status(400).json({
//                   message:
//                     "You have to complete previous tasks before moving to the next.",
//                 });
//               }
//             }

//             // Step 2: Now check if the 6-hour waiting period has passed for the last completed task
//             const lastCompletedTask = previousTasksResults[previousTasksResults.length - 1];
//             const previousCreatedAt = new Date(lastCompletedTask.createdAt);
//             const timeDiffInHours = Math.abs(currentTime - previousCreatedAt) / 36e5;

//             // If the time difference is less than 6 hours, prevent the current task completion
//             if (timeDiffInHours < 6) {
//               return res.status(400).json({
//                 message:
//                   "You need to wait 6 hours after completing the previous task before marking this task as completed.",
//               });
//             }

//             // All previous tasks are completed, and the 6-hour wait is satisfied, proceed with updating the status
//             const updateSql =
//               "UPDATE slaveCropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
//             db.query(updateSql, [status, id], (err, updateResults) => {
//               if (err) {
//                 console.error("Error updating status:", err);
//                 return res
//                   .status(500)
//                   .send("An error occurred while updating the status.");
//               }

//               if (updateResults.affectedRows === 0) {
//                 return res
//                   .status(404)
//                   .send("No record found with the provided id.");
//               }

//               res.status(200).json({ message: "Status updated successfully." });
//             });
//           }
//         );
//       } else {
//         // If status is not 'completed' or taskIndex is 1, just proceed with the normal update
//         const updateSql =
//           "UPDATE slaveCropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
//         db.query(updateSql, [status, id], (err, updateResults) => {
//           if (err) {
//             console.error("Error updating status:", err);
//             return res
//               .status(500)
//               .send("An error occurred while updating the status.");
//           }

//           if (updateResults.affectedRows === 0) {
//             return res
//               .status(404)
//               .send("No record found with the provided id.");
//           }

//           res.status(200).json({ message: "Status updated successfully." });
//         });
//       }
//     });
//   } catch (err) {
//     console.log("Error updating status", err);
//     res.status(500).json({ message: "Internal Server Error!" });
//   }
// });

// 5th attempt

// const updateCropCalendarStatus = asyncHandler(async (req, res) => {
//   try {
//     const { id, status } = req.body;

//     // First, get the current task details (taskIndex, status, etc.)
//     const getTaskSql =
//       "SELECT taskIndex, status, createdAt FROM slaveCropcalendardays WHERE id = ?";
//     db.query(getTaskSql, [id], (err, taskResults) => {
//       if (err) {
//         console.error("Error fetching task:", err);
//         return res
//           .status(500)
//           .send("An error occurred while fetching task data.");
//       }

//       if (taskResults.length === 0) {
//         return res.status(404).send("No record found with the provided id.");
//       }

//       const currentTask = taskResults[0];
//       const taskIndex = currentTask.taskIndex;
//       const currentStatus = currentTask.status;
//       const createdAt = new Date(currentTask.createdAt);
//       const currentTime = new Date();

//       // Check if the task is being marked as 'pending' after 'completed' and restrict if more than 1 hour has passed
//       if (currentStatus === "completed" && status === "pending") {
//         const timeDiffInHours = Math.abs(currentTime - createdAt) / 36e5; // Difference in hours
//         if (timeDiffInHours > 1) {
//           return res.status(403).json({
//             message:
//               "You cannot change the status back to pending after 1 hour of marking it as completed.",
//           });
//         }
//       }

//       // Skip the previous task check if taskIndex is 1 (i.e., the first task)
//       if (status === "completed" && taskIndex > 1) {
//         // Change here to validate all previous tasks instead of just one
//         const checkPreviousTasksSql = `
//           SELECT id, taskIndex, createdAt, status FROM slaveCropcalendardays 
//           WHERE taskIndex < ? AND cropCalendarId = (SELECT cropCalendarId FROM slaveCropcalendardays WHERE id = ?)
//           ORDER BY taskIndex ASC`;

//         db.query(
//           checkPreviousTasksSql,
//           [taskIndex, id],
//           (err, previousTasksResults) => {
//             if (err) {
//               console.error("Error checking previous tasks:", err);
//               return res
//                 .status(500)
//                 .send("An error occurred while checking previous tasks.");
//             }

//             // Step 1: First check if all previous tasks are completed
//             let allPreviousTasksCompleted = true;
//             for (const previousTask of previousTasksResults) {
//               if (previousTask.status !== "completed") {
//                 allPreviousTasksCompleted = false;
//                 break;
//               }
//             }

//             if (!allPreviousTasksCompleted) {
//               // If any previous task is not completed, return this message
//               return res.status(400).json({
//                 message:
//                   "You have to complete previous tasks before moving to the next.",
//               });
//             }

//             // Step 2: Now check if the 6-hour waiting period has passed for the last completed task
//             const lastCompletedTask = previousTasksResults[previousTasksResults.length - 1];
//             const previousCreatedAt = new Date(lastCompletedTask.createdAt);
//             const timeDiffInHours = Math.abs(currentTime - previousCreatedAt) / 36e5;

//             // If the time difference is less than 6 hours, prevent the current task completion
//             if (timeDiffInHours < 6) {
//               return res.status(400).json({
//                 message:
//                   "You need to wait 6 hours after completing the previous task before marking this task as completed.",
//               });
//             }

//             // All previous tasks are completed, and the 6-hour wait is satisfied, proceed with updating the status
//             const updateSql =
//               "UPDATE slaveCropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
//             db.query(updateSql, [status, id], (err, updateResults) => {
//               if (err) {
//                 console.error("Error updating status:", err);
//                 return res
//                   .status(500)
//                   .send("An error occurred while updating the status.");
//               }

//               if (updateResults.affectedRows === 0) {
//                 return res
//                   .status(404)
//                   .send("No record found with the provided id.");
//               }

//               res.status(200).json({ message: "Status updated successfully." });
//             });
//           }
//         );
//       } else {
//         // If status is not 'completed' or taskIndex is 1, just proceed with the normal update
//         const updateSql =
//           "UPDATE slaveCropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
//         db.query(updateSql, [status, id], (err, updateResults) => {
//           if (err) {
//             console.error("Error updating status:", err);
//             return res
//               .status(500)
//               .send("An error occurred while updating the status.");
//           }

//           if (updateResults.affectedRows === 0) {
//             return res
//               .status(404)
//               .send("No record found with the provided id.");
//           }

//           res.status(200).json({ message: "Status updated successfully." });
//         });
//       }
//     });
//   } catch (err) {
//     console.log("Error updating status", err);
//     res.status(500).json({ message: "Internal Server Error!" });
//   }
// });

//6th attempt
const updateCropCalendarStatus = asyncHandler(async (req, res) => {
  try {
    const { id, status } = req.body;

    // First, get the current task details (taskIndex, status, cropCalendarId, userId, etc.)
    const getTaskSql =
      "SELECT taskIndex, status, createdAt, cropCalendarId, userId FROM slavecropcalendardays WHERE id = ?";
    db.query(getTaskSql, [id], (err, taskResults) => {
      if (err) {
        console.error("Error fetching task:", err);
        return res
          .status(500)
          .send("An error occurred while fetching task data.");
      }

      if (taskResults.length === 0) {
        return res.status(404).send("No record found with the provided id.");
      }

      const currentTask = taskResults[0];
      const taskIndex = currentTask.taskIndex;
      const currentStatus = currentTask.status;
      const createdAt = new Date(currentTask.createdAt);
      const cropCalendarId = currentTask.cropCalendarId;
      const userId = currentTask.userId;
      const currentTime = new Date();

      // Check if the task is being marked as 'pending' after 'completed' and restrict if more than 1 hour has passed
      if (currentStatus === "completed" && status === "pending") {
        const timeDiffInHours = Math.abs(currentTime - createdAt) / 36e5; // Difference in hours
        if (timeDiffInHours > 1/120) {
          return res.status(403).json({
            message:
              "You cannot change the status back to pending after 1 hour of marking it as completed.",
          });
        }
      }

      // Skip the previous task check if taskIndex is 1 (i.e., the first task)
      if (status === "completed" && taskIndex > 1) {
        // Now filtering by userId and cropCalendarId
        const checkPreviousTasksSql = `
          SELECT id, taskIndex, createdAt, status FROM slavecropcalendardays 
          WHERE taskIndex < ? 
            AND cropCalendarId = ? 
            AND userId = ?
          ORDER BY taskIndex ASC`;

        db.query(checkPreviousTasksSql, [taskIndex, cropCalendarId, userId], (err, previousTasksResults) => {
          if (err) {
            console.error("Error checking previous tasks:", err);
            return res
              .status(500)
              .send("An error occurred while checking previous tasks.");
          }

          // Step 1: First check if all previous tasks are completed
          let allPreviousTasksCompleted = true;
          let lastCompletedTask = null;
          for (const previousTask of previousTasksResults) {
            if (previousTask.status !== "completed") {
              allPreviousTasksCompleted = false;
              break;
            }
            lastCompletedTask = previousTask; // Track the last completed task
          }

          if (!allPreviousTasksCompleted) {
            // If any previous task is not completed, return this message
            return res.status(400).json({
              message:
                "You have to complete previous tasks before moving to the next.",
            });
          }

          // Step 2: Now check if the 6-hour waiting period has passed for the last completed task
          if (lastCompletedTask) {
            const previousCreatedAt = new Date(lastCompletedTask.createdAt);
            const timeDiffInHours = Math.abs(currentTime - previousCreatedAt) / 36e5;

            if (timeDiffInHours < 6/360) {
              return res.status(400).json({
                message:
                  "You need to wait 6 hours after completing the previous task before marking this task as completed.",
              });
            }
          }

          // All previous tasks are completed, and the 6-hour wait is satisfied, proceed with updating the status
          const updateSql =
            "UPDATE slavecropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
          db.query(updateSql, [status, id], (err, updateResults) => {
            if (err) {
              console.error("Error updating status:", err);
              return res
                .status(500)
                .send("An error occurred while updating the status.");
            }

            if (updateResults.affectedRows === 0) {
              return res
                .status(404)
                .send("No record found with the provided id.");
            }

            res.status(200).json({ message: "Status updated successfully." });
          });
        });
      } else {
        // If status is not 'completed' or taskIndex is 1, just proceed with the normal update
        const updateSql =
          "UPDATE slavecropcalendardays SET status = ?, createdAt = CURRENT_TIMESTAMP WHERE id = ?";
        db.query(updateSql, [status, id], (err, updateResults) => {
          if (err) {
            console.error("Error updating status:", err);
            return res
              .status(500)
              .send("An error occurred while updating the status.");
          }

          if (updateResults.affectedRows === 0) {
            return res
              .status(404)
              .send("No record found with the provided id.");
          }

          res.status(200).json({ message: "Status updated successfully." });
        });
      }
    });
  } catch (err) {
    console.log("Error updating status", err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});







module.exports = {
  getCropByCatogory,
  CropCalanderFeed,
  getCropById,
  enroll,
  OngoingCultivaionGetById,
  insertTasksToSlaveCropCalendarDays,
  getSlaveCropCalendarDaysByUserAndCrop,
  updateSlaveCropStatusById,
  updateCropCalendarStatus,
};
