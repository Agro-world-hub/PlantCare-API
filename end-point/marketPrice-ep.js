const asyncHandler = require("express-async-handler");
const { getAllMarketSchema } = require("../validations/marketPrice-validation");
const { getAllMarketData } = require("../dao/marketPrice-dao");

// Controller to fetch all market data
// exports.getAllMarket = asyncHandler(async (req, res) => {
//   try {
//     // Validate the request using Joi schema
//     const userId = req.user.id; 
//     const { error } = getAllMarketSchema.validate(req.query);
//     if (error) {
//       return res
//         .status(400)
//         .json({ status: "error", message: error.details[0].message });
//     }

//     // Use DAO to get data from the database
//     const results = await getAllMarketData(userId);

//   //   if (results[0].image) {
//   //     const base64Image = Buffer.from(results[0].image).toString('base64');
//   //     const mimeType = 'image/png'; // Adjust MIME type if necessary, depending on the image type
//   //     results[0].image = `data:${mimeType};base64,${base64Image}`;
//   // }
  
//     res.status(200).json(results);
//   } catch (err) {
//     console.error("Error getAllMarket:", err);
//     res.status(500).json({ message: "Internal Server Error!" });
//   }
// });

exports.getAllMarket = asyncHandler(async (req, res) => {
  try {
    // Validate the request using Joi schema
    const userId = req.user.id;
    console.log('marcket', userId);
    const { error } = getAllMarketSchema.validate(req.query);
    if (error) {
      return res
        .status(400)
        .json({ status: "error", message: error.details[0].message });
    }

    // Fetch data from the database using DAO
    const results = await getAllMarketData(userId);

    // Group data by varietyId, then calculate the average price
    const groupedData = {};
    results.forEach((row) => {
      // Ensure price is a valid number
      if (row.price == null || isNaN(row.price)) return; // Skip invalid prices

      const varietyId = row.varietyId;
      if (!groupedData[varietyId]) {
        groupedData[varietyId] = {
          varietyId,
          varietyNameEnglish: row.varietyNameEnglish,
          varietyNameSinhala: row.varietyNameSinhala,
          varietyNameTamil: row.varietyNameTamil,
          bgColor: row.bgColor,
          image: row.image,
          totalPrice: 0,
          count: 0,
        };
      }
      groupedData[varietyId].totalPrice += parseFloat(row.price); // Convert price to float
      groupedData[varietyId].count += 1;
    });

    // Format the response
    const formattedResponse = Object.values(groupedData).map((item) => ({
      varietyId: item.varietyId,
      varietyNameEnglish: item.varietyNameEnglish,
      varietyNameSinhala: item.varietyNameSinhala,
      varietyNameTamil: item.varietyNameTamil,
      bgColor: item.bgColor,
      image: item.image,
      averagePrice: item.count > 0 ? item.totalPrice / item.count : 0, // Avoid division by zero
    }));

    res.status(200).json(formattedResponse);
    console.log("Formatted Response:", formattedResponse);
  } catch (err) {
    console.error("Error getAllMarket:", err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});


