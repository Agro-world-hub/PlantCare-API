const db = require('../startup/database');

// Get a current asset by ID
// Get a current asset by ID
exports.getAllCurrentAssets = async(req, res) => {
    try {
        const userId = req.user.id; // Get the logged-in user ID

        const sql = `
        SELECT category, SUM(total) AS totalSum 
        FROM currentasset 
        WHERE userId = ? 
        GROUP BY category
      `;

        const [results] = await db.plantcare.promise().query(sql, [userId]);

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




exports.handleAddFixedAsset = (req, res) => {
    console.log('Route hit'); // Confirms the route is hit

    // Destructuring incoming request body
    const userId = req.user.id;
    const {
        category,
        asset,
        brand,
        batchNum,
        volume,
        unit,
        numberOfUnits,
        unitPrice,
        totalPrice,
        purchaseDate,
        expireDate,
        warranty,
        status
    } = req.body;

    // Logging the received data
    console.log('Received asset data:', req.body);

    // Parsing volume to integer
    const volumeInt = parseInt(volume, 10);
    if (isNaN(volumeInt)) {
        console.log('Volume is not a valid number');
        return res.status(400).json({ status: 'error', message: 'Volume must be a valid number.' });
    }

    // Formatting the dates to SQL-compatible format
    const formattedPurchaseDate = new Date(purchaseDate).toISOString().slice(0, 19).replace('T', ' ');
    const formattedExpireDate = new Date(expireDate).toISOString().slice(0, 19).replace('T', ' ');

    // SQL to check if the asset already exists for the current user, category, asset, and brand
    const checkSql = `SELECT * FROM currentasset WHERE userId = ? AND category = ? AND asset = ? AND brand = ?`;

    // Executing query to check for existing asset
    db.plantcare.query(checkSql, [userId, category, asset, brand], (err, results) => {
        console.log('Executing asset check SQL...');

        if (err) {
            console.error('Error checking asset:', err);
            return res.status(500).json({ status: 'error', message: 'Error checking asset: ' + err.message });
        }

        console.log('Asset check results:', results);

        // If asset exists, update it
        if (results.length > 0) {
            const existingAsset = results[0];
            console.log('Existing asset found:', existingAsset);

            const updatedNumOfUnits = parseFloat(existingAsset.numOfUnit) + parseFloat(numberOfUnits);
            const updatedTotalPrice = (parseFloat(existingAsset.total) + parseFloat(totalPrice)).toFixed(2);

            // SQL to update the existing asset
            const updateSql = `
                UPDATE currentasset
                SET numOfUnit = ?, total = ?, unitVolume = ?, unitPrice = ?, purchaseDate = ?, expireDate = ?, status = ?
                WHERE id = ?
            `;
            const updateValues = [
                updatedNumOfUnits.toFixed(2),
                updatedTotalPrice,
                volumeInt,
                unitPrice,
                formattedPurchaseDate,
                formattedExpireDate,
                status,
                existingAsset.id
            ];

            console.log('Executing update SQL with values:', updateValues);
            db.plantcare.query(updateSql, updateValues, (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error updating asset:', updateErr);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Error updating asset: ' + updateErr.message,
                    });
                }

                console.log('Update result:', updateResult);

                if (updateResult.affectedRows === 0) {
                    console.log('No rows were updated');
                    return res.status(500).json({
                        status: 'error',
                        message: 'No asset was updated. Please check if the asset exists.',
                    });
                }

                console.log('Asset updated successfully with affected rows:', updateResult.affectedRows);

                // Add a record of the update in currentassetrecord table
                const recordSql = `
                    INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice)
                    VALUES (?, ?, 0, ?)
                `;
                const recordValues = [existingAsset.id, numberOfUnits, totalPrice];

                db.plantcare.query(recordSql, recordValues, (recordErr) => {
                    if (recordErr) {
                        console.error('Error adding asset record:', recordErr);
                        return res.status(500).json({
                            status: 'error',
                            message: 'Error adding asset record: ' + recordErr.message,
                        });
                    }

                    console.log('Asset record added successfully');
                    res.status(200).json({
                        status: 'success',
                        message: 'Asset updated successfully',
                    });
                });
            });

        } else {
            // If asset does not exist, insert a new one
            console.log('No existing asset found, inserting new one...');

            const insertSql = `
                INSERT INTO currentasset (userId, category, asset, brand, batchNum, unitVolume, unit, numOfUnit, unitPrice, total, purchaseDate, expireDate, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const insertValues = [
                userId, category, asset, brand, batchNum, volumeInt, unit,
                numberOfUnits, unitPrice, totalPrice, formattedPurchaseDate, formattedExpireDate, status
            ];

            console.log('Executing insert SQL with values:', insertValues);
            db.plantcare.query(insertSql, insertValues, (insertErr, insertResult) => {
                if (insertErr) {
                    console.error('Error inserting new asset:', insertErr);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Error inserting new asset: ' + insertErr.message,
                    });
                }

                console.log('New asset inserted successfully with ID:', insertResult.insertId);

                // Insert the record in currentassetrecord table
                const newRecordSql = `
                    INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice)
                    VALUES (?, ?, 0, ?)
                `;
                const newRecordValues = [insertResult.insertId, numberOfUnits, totalPrice];

                db.plantcare.query(newRecordSql, newRecordValues, (newRecordErr) => {
                    if (newRecordErr) {
                        console.error('Error adding new asset record:', newRecordErr);
                        return res.status(500).json({
                            status: 'error',
                            message: 'Error adding new asset record: ' + newRecordErr.message,
                        });
                    }

                    console.log('New asset record added successfully');
                    res.status(201).json({
                        status: 'success',
                        message: 'New asset created successfully',
                    });
                });
            });
        }
    });
};


// Delete an asset based on category and asset ID
exports.deleteAsset = (req, res) => {
    const { category, assetId } = req.params;
    const { numberOfUnits, totalPrice } = req.body;
    const userId = req.user.id;

    // SQL query to find the asset
    db.plantcare.execute('SELECT * FROM currentasset WHERE userId = ? AND category = ? AND id = ?', [userId, category, assetId], (err, results) => {
        if (err) {
            console.error('Error retrieving asset:', err);
            return res.status(500).json({ message: 'Server error.' });
        }

        if (!results.length) {
            return res.status(404).json({ message: 'Asset not found.' });
        }

        const currentAsset = results[0];
        const newNumOfUnit = currentAsset.numOfUnit - numberOfUnits;
        const newTotal = currentAsset.total - totalPrice;

        if (newNumOfUnit < 0 || newTotal < 0) {
            return res.status(400).json({ message: 'Invalid operation: insufficient units.' });
        }

        // If newNumOfUnit and newTotal are zero, delete the asset
        if (newNumOfUnit === 0 && newTotal === 0) {
            db.plantcare.execute('DELETE FROM currentasset WHERE userId = ? AND category = ? AND id = ?', [userId, category, assetId], (deleteErr) => {
                if (deleteErr) {
                    console.error('Error deleting asset:', deleteErr);
                    return res.status(500).json({ message: 'Server error.' });
                }

                db.plantcare.execute('INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice) VALUES (?, 0, ?, ?)', [currentAsset.id, numberOfUnits, totalPrice], (recordErr) => {
                    if (recordErr) {
                        console.error('Error adding asset record:', recordErr);
                        return res.status(500).json({ message: 'Server error.' });
                    }

                    res.status(200).json({ message: 'Asset removed successfully.' });
                });
            });
        } else {
            // Update the asset with new values
            db.plantcare.execute('UPDATE currentasset SET numOfUnit = ?, total = ? WHERE userId = ? AND category = ? AND id = ?', [newNumOfUnit, newTotal, userId, category, assetId], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating asset:', updateErr);
                    return res.status(500).json({ message: 'Server error.' });
                }

                db.plantcare.execute('INSERT INTO currentassetrecord (currentAssetId, numOfPlusUnit, numOfMinUnit, totalPrice) VALUES (?, 0, ?, ?)', [currentAsset.id, numberOfUnits, totalPrice], (recordErr) => {
                    if (recordErr) {
                        console.error('Error adding asset record:', recordErr);
                        return res.status(500).json({ message: 'Server error.' });
                    }

                    res.status(200).json({ message: 'Asset updated successfully.' });
                });
            });
        }
    });
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
    db.plantcare.query(query, values, (error, results) => {
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