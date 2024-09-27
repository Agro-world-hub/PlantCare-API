const db = require('../startup/database');

// Get a current asset by ID
// Get a current asset by ID
exports.getAllCurrentAssets = async (req, res) => {
    try {
      const userId = req.user.id; // Get the logged-in user ID
  
      const sql = `
        SELECT category, SUM(total) AS totalSum 
        FROM currentasset 
        WHERE userId = ? 
        GROUP BY category
      `;
  
      const [results] = await db.promise().query(sql, [userId]);
  
      if (results.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No assets found for the user',
        });
      }
  
      return res.status(200).json({
        status: 'success',
        currentAssetsByCategory: results,
      });
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: `Database error: ${err.message}`,
      });
    }
  };
  



// Add or update a current asset for a specific category
exports.handleAddFixedAsset = (req, res) => {
    const userId = req.user.id;
    const { category, asset, brand, batchNum, volume, unit, numberOfUnits, unitPrice, totalPrice, purchaseDate, expireDate, warranty, status } = req.body;

    // Convert volume to an integer
    const volumeInt = parseInt(volume, 10);

    if (isNaN(volumeInt)) {
        return res.status(400).json({
            status: 'error',
            message: 'Volume must be a number',
        });
    }

    // Convert purchaseDate and expireDate to MySQL datetime format
    const formattedPurchaseDate = new Date(purchaseDate).toISOString().slice(0, 19).replace('T', ' ');
    const formattedExpireDate = new Date(expireDate).toISOString().slice(0, 19).replace('T', ' ');

    // Step 1: Check if the asset with the same category already exists for this user
    const checkSql = `
        SELECT * FROM currentasset WHERE userId = ? AND category = ? AND asset = ?
    `;

    db.query(checkSql, [userId, category, asset], (err, results) => {
        if (err) {
            console.error('Error checking asset:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Error checking asset: ' + err.message,
            });
        }

        if (results.length > 0) {
            // Asset exists, update the existing record
            const existingAsset = results[0];
            const updatedNumOfUnits = existingAsset.numOfUnit + numberOfUnits;
            const updatedTotalPrice = existingAsset.total + totalPrice;

            const updateSql = `
                UPDATE currentasset
                SET numOfUnit = ?, total = ?, volume = ?, unitPrice = ?, purchaseDate = ?, expireDate = ?, warranty = ?, status = ?
                WHERE id = ?
            `;

            const updateValues = [
                updatedNumOfUnits, updatedTotalPrice, volumeInt, unitPrice, formattedPurchaseDate, formattedExpireDate, warranty, status, existingAsset.id
            ];

            db.query(updateSql, updateValues, (updateErr) => {
                if (updateErr) {
                    console.error('Error updating asset:', updateErr);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Error updating asset: ' + updateErr.message,
                    });
                }

                // Step 2: Add a record to currentassetrecord
                const recordSql = `
                    INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice)
                    VALUES (?, ?, 0, ?)
                `;
                const recordValues = [existingAsset.id, numberOfUnits, totalPrice];

                db.query(recordSql, recordValues, (recordErr) => {
                    if (recordErr) {
                        console.error('Error adding record:', recordErr);
                        return res.status(500).json({
                            status: 'error',
                            message: 'Error adding asset record: ' + recordErr.message,
                        });
                    }

                    res.status(200).json({
                        status: 'success',
                        message: 'Asset updated successfully',
                    });
                });
            });
        } else {
            // Asset doesn't exist, insert a new record
            const insertSql = `
            INSERT INTO currentasset (
                userId, category, asset, brand, batchNum, unit, unitVolume, numOfUnit, unitPrice, total, purchaseDate, expireDate, warranty, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertValues = [
            userId, category, asset, brand, batchNum, unit, volumeInt, numberOfUnits, unitPrice, totalPrice, formattedPurchaseDate, formattedExpireDate, warranty, status
        ];
        

            db.query(insertSql, insertValues, (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Error adding asset:', insertErr);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Error adding asset: ' + insertErr.message,
                    });
                }

                const newAssetId = insertResults.insertId;

                // Step 2: Add a record to currentassetrecord
                const recordSql = `
                    INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice)
                    VALUES (?, ?, 0, ?)
                `;
                const recordValues = [newAssetId, numberOfUnits, totalPrice];

                db.query(recordSql, recordValues, (recordErr) => {
                    if (recordErr) {
                        console.error('Error adding record:', recordErr);
                        return res.status(500).json({
                            status: 'error',
                            message: 'Error adding asset record: ' + recordErr.message,
                        });
                    }

                    res.status(200).json({
                        status: 'success',
                        message: 'Asset added successfully',
                    });
                });
            });
        }
    });
};


// Delete an asset according to the logged user, category, and asset name
exports.deleteAsset = (req, res) => {
    const { category, assetId } = req.params;
    const { numberOfUnits, totalPrice } = req.body;
    const userId = req.user.id;

    console.log(category, assetId, numberOfUnits, totalPrice, userId);

    // Retrieve the current asset record for the user using assetId
    db.execute('SELECT * FROM currentasset WHERE userId = ? AND category = ? AND id = ?', [userId, category, assetId],
        (err, results) => {
            if (err) {
                console.error('Error retrieving asset:', err);
                return res.status(500).json({ message: 'Server error.' });
            }

            const rows = results; // results is the entire rows array
            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: 'Asset not found for this user.' });
            }

            const currentAsset = rows[0]; // Now, accessing the first element safely
            const newNumOfUnit = currentAsset.numOfUnit - numberOfUnits;
            const newTotal = currentAsset.total - totalPrice;

            // Check if new values are valid
            if (newNumOfUnit < 0 || newTotal < 0) {
                return res.status(400).json({ message: 'Invalid operation: insufficient units to deduct.' });
            }

            const recordData = {
                currentAssetId: currentAsset.id,
                numOfPlusUnit: 0, // Deduction only
                numOfMinUnit: numberOfUnits,
                totalPrice: totalPrice,
            };

            // If new values are zero, delete the asset
            if (newNumOfUnit === 0 && newTotal === 0) {
                db.execute('DELETE FROM currentasset WHERE userId = ? AND category = ? AND id = ?', [userId, category, assetId],
                    (deleteErr) => {
                        if (deleteErr) {
                            console.error('Error deleting asset:', deleteErr);
                            return res.status(500).json({ message: 'Server error.' });
                        }

                        db.execute(
                            'INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice) VALUES (?, ?, ?, ?)', [recordData.currentAssetId, recordData.numOfPlusUnit, recordData.numOfMinUnit, recordData.totalPrice],
                            (insertErr) => {
                                if (insertErr) {
                                    console.error('Error inserting record:', insertErr);
                                    return res.status(500).json({ message: 'Server error.' });
                                }

                                return res.status(200).json({ message: 'Asset removed successfully.' });
                            }
                        );
                    }
                );
            } else {
                // Otherwise, update the asset
                db.execute('UPDATE currentasset SET numOfUnit = ?, total = ? WHERE userId = ? AND category = ? AND id = ?', [newNumOfUnit, newTotal, userId, category, assetId],
                    (updateErr) => {
                        if (updateErr) {
                            console.error('Error updating asset:', updateErr);
                            return res.status(500).json({ message: 'Server error.' });
                        }

                        db.execute(
                            'INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice) VALUES (?, ?, ?, ?)', [currentAsset.id, 0, numberOfUnits, totalPrice],
                            (insertErr) => {
                                if (insertErr) {
                                    console.error('Error inserting record:', insertErr);
                                    return res.status(500).json({ message: 'Server error.' });
                                }

                                return res.status(200).json({ message: 'Asset updated successfully.' });
                            }
                        );
                    }
                );
            }
        }
    );
};





//get current assets according the selected category
exports.getAssetsByCategory = (req, res) => {
    // Get the userId from the request object (from your middleware)
    const userId = req.user.id;
    console.log('User ID:', userId);

    // Extract category from query parameters
    const category = req.query.category;
    console.log('Category:', category);

    // Check if the category is provided
    if (!category) {
        return res.status(400).json({ message: 'Category is required.' });
    }

    // If category is an array, handle each category separately
    let query;
    let values;

    if (Array.isArray(category)) {
        // Create placeholders for multiple categories
        const placeholders = category.map(() => '?').join(',');
        query = `SELECT * FROM currentasset WHERE userId = ? AND category IN (${placeholders})`;
        values = [userId, ...category];
    } else {
        // Handle single category
        query = 'SELECT * FROM currentasset WHERE userId = ? AND category = ?';
        values = [userId, category];
    }

    // Query the database to get assets based on category and userId
    db.query(query, values, (error, results) => {
        if (error) {
            console.error('Error fetching assets by category:', error);
            return res.status(500).json({ message: 'Server error, please try again later.' });
        }

        // If no assets are found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No assets found for this category.' });
        }

        // Return the assets in the response
        res.status(200).json({ assets: results });
        console.log('Assets:', results);
    });
};