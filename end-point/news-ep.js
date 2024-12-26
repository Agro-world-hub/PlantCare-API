const asyncHandler = require('express-async-handler');
const { getAllNewsSchema,getNewsByIdSchema  } = require('../validations/news-validation');
const { getAllNewsData,getNewsByIdData } = require('../dao/news-dao');

// Controller to fetch all news content
exports.getAllNews = asyncHandler(async (req, res) => {
  try {
    // Validate the request (future-proofing for potential query parameters)
    const { error } = getAllNewsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    // Use DAO to get the news content from the database
    const results = await getAllNewsData();

  //   if (results[0].image) {
  //     const base64Image = Buffer.from(results[0].image).toString('base64');
  //     const mimeType = 'image/png'; // Adjust MIME type if necessary, depending on the image type
  //     results[0].image = `data:${mimeType};base64,${base64Image}`;
  // }

    res.status(200).json(results);

  } catch (err) {
    console.error('Error getAllNews:', err);
    res.status(500).json({ message: 'Internal Server Error!' });
  }
});


exports.getNewsById = asyncHandler(async (req, res) => {
    try {
      // Validate the request parameters
      const { error } = getNewsByIdSchema.validate(req.params);
      if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
      }
  
      const newsId = req.params.newsId;
  
      // Use DAO to get the news content from the database
      const results = await getNewsByIdData(newsId);
  
      if (results.length === 0) {
        return res.status(404).json({ status: 'error', message: 'No news found for the given ID' });
      }

    //   if (results[0].image) {
    //     const base64Image = Buffer.from(results[0].image).toString('base64');
    //     const mimeType = 'image/png'; // Adjust MIME type if necessary, depending on the image type
    //     results[0].image = `data:${mimeType};base64,${base64Image}`;
    // }
  
      res.status(200).json([results[0]]); // Return the first result
    } catch (err) {
      console.error('Error getNewsById:', err);
      res.status(500).json({ message: 'Internal Server Error!' });
    }
  });


