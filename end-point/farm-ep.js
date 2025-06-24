const asyncHandler = require("express-async-handler");
const farmDao = require("../dao/farm-dao");
const { createFarm } = require('../validations/farm-validation');

exports.CreateFarm = asyncHandler(async (req, res) => {

    console.log('kbAL JODA;FPI', req.data)
    try {
        const userId = req.user.id;
        const input = { ...req.body, userId };

        console.log(userId)

        // Validate input
        const { value, error } = createFarm.validate(input);
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message,
            });
        }

        console.log("dayyyyyyyyyyyyyyy", input)

        const {
            farmName,
            farmIndex,
            farmImage,
            extentha,
            extentac,
            extentp,
            district,
            plotNo,
            street,
            city,
            staffCount,
            appUserCount,
            staff // Array of staff objects
        } = value;

        // Create farm and staff in a transaction
        const result = await farmDao.createFarmWithStaff({

            userId,
            farmName,
            farmImage,
            farmIndex,
            extentha,
            extentac,
            extentp,
            district,
            plotNo,
            street,
            city,
            staffCount,
            appUserCount,
            staff
        });

        console.log("fffffffffff", input)

        res.status(201).json({
            status: "success",
            message: "Farm and staff created successfully.",
            farmId: result.farmId,
            staffIds: result.staffIds,
            totalStaffCreated: result.staffIds.length
        });

    } catch (err) {
        console.error("Error creating farm:", err);

        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});


exports.getFarms = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const farms = await farmDao.getAllFarmByUserId(userId);

        if (!farms || farms.length === 0) {
            return res.status(404).json({ message: "No farms found" });
        }

        res.status(200).json(farms);
    } catch (error) {
        console.error("Error fetching farms:", error);
        res.status(500).json({ message: "Failed to fetch farms" });
    }
});