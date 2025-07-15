const asyncHandler = require("express-async-handler");
const farmDao = require("../dao/farm-dao");
const { createFarm, createPayment } = require('../validations/farm-validation');



const {

    ongoingCultivationSchema,
    enrollSchema,

} = require("../validations/farm-validation");

exports.CreateFarm = asyncHandler(async (req, res) => {
    console.log('Farm creation request:', req.body);

    try {
        const userId = req.user.id;
        const input = { ...req.body, userId };

        console.log('User ID:', userId);

        // Validate input
        const { value, error } = createFarm.validate(input);
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message,
            });
        }

        console.log("Validated input:", value);

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

        console.log("Farm creation result:", result);

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


exports.getFarmById = asyncHandler(async (req, res) => {
    try {
        const farmId = req.params.id;
        const userId = req.user.id;

        // Get farm data with staff
        const farmData = await farmDao.getFarmByIdWithStaff(farmId, userId);

        if (!farmData) {
            return res.status(404).json({ message: "Farm not found" });
        }

        res.status(200).json(farmData);
    } catch (error) {
        console.error("Error fetching farm:", error);
        res.status(500).json({ message: "Failed to fetch farm" });
    }
});



exports.getMemberShip = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const userMembership = await farmDao.getMemberShip(userId);

        if (!userMembership) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: userMembership
        });
    } catch (error) {
        console.error("Error fetching user membership:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user membership"
        });
    }
});


exports.CreatePayment = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const input = { ...req.body, userId };

        console.log('Payment request data:', input);

        // Validate input using Joi schema
        const { value, error } = createPayment.validate(input);
        if (error) {
            return res.status(400).json({
                status: "error",
                message: error.details[0].message,
            });
        }

        const { payment, plan, expireDate } = value;

        // Create payment and update user membership
        const result = await farmDao.createPaymentAndUpdateMembership({
            userId,
            payment,
            plan,
            expireDate
        });

        res.status(201).json({
            status: "success",
            message: "Payment processed and membership updated successfully.",
            paymentId: result.paymentId,
            userUpdated: result.userUpdated
        });

    } catch (err) {
        console.error("Error processing payment:", err);

        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});


//////////////cultivation


exports.OngoingCultivaionGetById = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const farmId = req.params.farmId; // Get farmId from route parameter

        // Validate farmId
        if (!farmId) {
            return res.status(400).json({
                status: "error",
                message: "Farm ID is required",
            });
        }

        // Validate farmId is a number (if needed)
        if (isNaN(farmId)) {
            return res.status(400).json({
                status: "error",
                message: "Farm ID must be a valid number",
            });
        }

        farmDao.getOngoingCultivationsByUserIdAndFarmId(userId, farmId, (err, results) => {
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
                    message: "No ongoing cultivation found for this user and farm",
                });
            }
            res.status(200).json(results);
        });
    } catch (err) {
        console.error("Error in OngoingCultivationGetById:", err);
        res
            .status(500)
            .json({ status: "error", message: "Internal Server Error!" });
    }
});


// ENDPOINT - Updated to include farmId validation and usage
exports.enroll = asyncHandler(async (req, res) => {
    console.log("first")
    try {
        const cropId = req.body.cropId;
        const extentha = req.body.extentha || '0';
        const extentac = req.body.extentac || '0';
        const extentp = req.body.extentp || '0';
        const startDate = req.body.startDate;
        const userId = req.user.id;
        const farmId = req.params.farmId

        console.log("farmId", farmId)

        const { error } = enrollSchema.validate({
            extentha,
            extentac,
            extentp,
            startedAt: startDate,
            ongoingCultivationId: null,
            createdAt: undefined,
            farmId
        });

        console.log("valide after")
        console.log("Error:", error);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        let cultivationId;
        const ongoingCultivationResult = await farmDao.checkOngoingCultivation(userId);

        if (!ongoingCultivationResult[0]) {
            const newCultivationResult = await farmDao.createOngoingCultivation(userId);
            cultivationId = newCultivationResult.insertId;
        } else {
            cultivationId = ongoingCultivationResult[0].id;
        }

        // Updated: Check crop count for specific farm
        const cropCountResult = await farmDao.checkCropCountByFarm(cultivationId, farmId);
        const cropCount = cropCountResult[0].count;

        if (cropCount >= 3) {
            return res
                .status(400)
                .json({ message: "You have already enrolled in 3 crops for this farm" });
        }

        // Updated: Check enrolled crops for specific farm
        const enrolledCrops = await farmDao.checkEnrollCropByFarm(cultivationId, farmId);
        if (enrolledCrops.some((crop) => crop.cropCalendar == cropId)) {
            return res
                .status(400)
                .json({ message: "You are already enrolled in this crop for this farm!" });
        }

        const cultivationIndex = cropCount + 1;

        await farmDao.enrollOngoingCultivationCrop(cultivationId, cropId, extentha, extentac, extentp, startDate, cultivationIndex, farmId);
        const enroledoncultivationcrop = await farmDao.getEnrollOngoingCultivationCrop(cropId, userId, farmId);
        console.log("data", enroledoncultivationcrop);

        let onCulscropID;
        if (enroledoncultivationcrop.length > 0) {
            onCulscropID = enroledoncultivationcrop[0].id;
        } else {
            console.log("No records found for the given cultivationId.");
            return res.status(500).json({ message: "Failed to create cultivation record" });
        }

        const responseenrollSlaveCrop = await farmDao.enrollSlaveCrop(userId, cropId, startDate, onCulscropID, farmId);

        return res.json({ message: "Enrollment successful" });
    } catch (err) {
        console.error("Error during enrollment:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});