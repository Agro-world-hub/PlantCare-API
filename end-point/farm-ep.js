const asyncHandler = require("express-async-handler");
const farmDao = require("../dao/farm-dao");
const { createFarm, createPayment } = require('../validations/farm-validation');

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