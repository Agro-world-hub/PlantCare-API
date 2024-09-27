const db = require('../startup/database');

// Add a fixed asset

exports.addFixedAsset = (req, res) => {
    const userId = req.user.id; // Retrieve userId from req.user.id
    const {
        category,
        ownership,
        type,
        floorArea,
        generalCondition,
        district,
        extentha,
        extentac,
        extentp,
        landFenced,
        perennialCrop,
        asset,
        assetType,
        mentionOther,
        brand,
        numberOfUnits,
        unitPrice,
        totalPrice,
        warranty,
        issuedDate,
        purchaseDate,
        expireDate,
        warrantystatus,
        startDate,
        duration,
        leastAmountAnnually,
        permitFeeAnnually,
        paymentAnnually,
        estimateValue
    } = req.body;

    // Format all required date fields
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    };

    const formattedPurchaseDate = formatDate(purchaseDate);
    const formattedExpireDate = formatDate(expireDate);
    const formattedStartDate = formatDate(startDate);

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Transaction error', error: err });
        }

        // Insert into fixedasset table
        const fixedAssetSql = `INSERT INTO fixedasset (userId, category) VALUES (?, ?)`;
        db.query(fixedAssetSql, [userId, category], (fixedAssetErr, fixedAssetResult) => {
            if (fixedAssetErr) {
                return db.rollback(() => {
                    return res.status(500).json({ message: 'Error inserting into fixedasset table', error: fixedAssetErr });
                });
            }

            const fixedAssetId = fixedAssetResult.insertId;

            // Conditional inserts based on category and ownership
            if (category === 'Land') {
                const landSql = `INSERT INTO landfixedasset (fixedAssetId, extentha, extentac, extentp, ownership, district, landFenced, perennialCrop)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                db.query(landSql, [fixedAssetId, extentha, extentac, extentp, ownership, district, landFenced, perennialCrop], (landErr) => {
                    if (landErr) {
                        return db.rollback(() => {
                            return res.status(500).json({ message: 'Error inserting into landfixedasset table', error: landErr });
                        });
                    }
                    db.commit((commitErr) => {
                        if (commitErr) {
                            return db.rollback(() => {
                                return res.status(500).json({ message: 'Commit error', error: commitErr });
                            });
                        }
                        return res.status(201).json({ message: 'Land fixed asset created successfully.' });
                    });
                });
            } else if (category === 'Building and Infrastructures') {
                const buildingSql = `INSERT INTO buildingfixedasset (fixedAssetId, type, floorArea, ownership, generalCondition, district)
                                    VALUES (?, ?, ?, ?, ?, ?)`;
                db.query(buildingSql, [fixedAssetId, type, floorArea, ownership, generalCondition, district], (buildingErr, buildingResult) => {
                    if (buildingErr) {
                        return db.rollback(() => {
                            return res.status(500).json({ message: 'Error inserting into buildingfixedasset table', error: buildingErr });
                        });
                    }
                    const buildingAssetId = buildingResult.insertId
                        // Handle ownership conditions
                    if (ownership === 'Own') {
                        const sharedOwnershipSql = `INSERT INTO ownershipownerfixedasset (buildingAssetId,issuedDate,estimateValue)
                                                    VALUES (?, ?,?)`;
                        db.query(sharedOwnershipSql, [buildingAssetId, issuedDate, estimateValue], (sharedErr) => {
                            if (sharedErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Error inserting into ownershipsharedfixedasset table', error: sharedErr });
                                });
                            }
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        return res.status(500).json({ message: 'Commit error', error: commitErr });
                                    });
                                }
                                return res.status(201).json({ message: 'Building fixed asset with shared ownership created successfully.' });
                            });
                        });
                    } else
                    if (ownership === 'Lease') {
                        // Use formattedStartDate in your SQL query
                        const leastOwnershipSql = `INSERT INTO ownershipleastfixedasset (buildingAssetId, startDate, duration, leastAmountAnnually)
                                                   VALUES (?, ?, ?, ?)`;
                        db.query(leastOwnershipSql, [buildingAssetId, formattedStartDate, duration, leastAmountAnnually], (leastErr) => {
                            if (leastErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Error inserting into ownershipleastfixedasset table', error: leastErr });
                                });
                            }
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        return res.status(500).json({ message: 'Commit error', error: commitErr });
                                    });
                                }
                                return res.status(201).json({ message: 'Building fixed asset with lease ownership created successfully.' });
                            });
                        });

                    } else if (ownership === 'Permited') {
                        const permitOwnershipSql = `INSERT INTO ownershippermitfixedasset (buildingAssetId,issuedDate, permitFeeAnnually)
                                                    VALUES (?, ? , ?)`;
                        db.query(permitOwnershipSql, [buildingAssetId, issuedDate, permitFeeAnnually], (permitErr) => {
                            if (permitErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Error inserting into ownershippermitfixedasset table', error: permitErr });
                                });
                            }
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        return res.status(500).json({ message: 'Commit error', error: commitErr });
                                    });
                                }
                                return res.status(201).json({ message: 'Building fixed asset with permit ownership created successfully.' });
                            });
                        });
                    } else if (ownership === 'Shared') {
                        const sharedOwnershipSql = `INSERT INTO ownershipsharedfixedasset (buildingAssetId, paymentAnnually)
                                                    VALUES (?, ?)`;
                        db.query(sharedOwnershipSql, [buildingAssetId, paymentAnnually], (sharedErr) => {
                            if (sharedErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Error inserting into ownershipsharedfixedasset table', error: sharedErr });
                                });
                            }
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        return res.status(500).json({ message: 'Commit error', error: commitErr });
                                    });
                                }
                                return res.status(201).json({ message: 'Building fixed asset with shared ownership created successfully.' });
                            });
                        });
                    } else {
                        return db.rollback(() => {
                            return res.status(400).json({ message: 'Invalid ownership type provided.' });
                        });
                    }
                });
            } else if (category === 'Machine and Vehicles' || category === 'Tools') {
                const machToolsSql = `INSERT INTO machtoolsfixedasset (fixedAssetId, asset, assetType, mentionOther, brand, numberOfUnits, unitPrice, totalPrice, warranty)
                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                // Insert into machtoolsfixedasset table
                db.query(machToolsSql, [fixedAssetId, asset, assetType, mentionOther, brand, numberOfUnits, unitPrice, totalPrice, warranty], (machToolsErr, machToolsResult) => {
                    if (machToolsErr) {
                        return db.rollback(() => {
                            return res.status(500).json({ message: 'Error inserting into machtoolsfixedasset table', error: machToolsErr });
                        });
                    }

                    const machToolsId = machToolsResult.insertId; // Get the inserted machToolsId

                    // Check warranty status
                    if (warrantystatus === 'yes') {
                        // Insert into machtoolsfixedassetwarranty table
                        const machToolsWarrantySql = `INSERT INTO machtoolsfixedassetwarranty (machToolsId, purchaseDate, expireDate, warrantystatus)
                                                      VALUES (?, ?, ?, ?)`;
                        db.query(machToolsWarrantySql, [machToolsId, formattedPurchaseDate, formattedExpireDate, warrantystatus], (warrantyErr) => {
                            if (warrantyErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Error inserting into machtoolsfixedassetwarranty table', error: warrantyErr });
                                });
                            }

                            // Commit the transaction after successful insertions
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        return res.status(500).json({ message: 'Commit error', error: commitErr });
                                    });
                                }
                                return res.status(201).json({ message: 'Machine and tools fixed asset with warranty created successfully.' });
                            });
                        });
                    } else {
                        // If no warranty, just commit the transaction
                        db.commit((commitErr) => {
                            if (commitErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Commit error', error: commitErr });
                                });
                            }
                            return res.status(201).json({ message: 'Machine and tools fixed asset created successfully without warranty.' });
                        });
                    }
                });
            } else {
                return db.rollback(() => {
                    return res.status(400).json({ message: 'Invalid category provided.' });
                });
            }
        });
    });
};


exports.getFixedAssetsByCategoryAndUser = (req, res) => {
    const { category } = req.params;
    const userId = req.user.id; // Assuming the `userId` is available in `req.user`

    if (!category) {
        return res.status(400).json({ message: 'No category provided.' });
    }

    const query = `SELECT * FROM fixedasset WHERE category = ? AND userId = ?`;

    db.query(query, [category, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching fixed assets by category and user', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No fixed assets found for this category and user.' });
        }

        return res.status(200).json({ message: 'Fixed assets retrieved successfully', data: results });
    });
};





// Delete a fixed asset
exports.deleteFixedAsset = (req, res) => {
    const { ids } = req.body; // Expecting an array of IDs or a single ID

    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
        return res.status(400).json({ message: 'No fixed asset ID(s) provided.' });
    }

    // Convert to an array if only one ID is provided
    const idArray = Array.isArray(ids) ? ids : [ids];

    // Start a transaction to delete fixed asset(s)
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Transaction error', error: err });
        }

        // Use the array of IDs to delete the corresponding rows from the fixed asset tables
        const deleteSql = `DELETE FROM fixedasset WHERE id IN (?)`;
        db.query(deleteSql, [idArray], (deleteErr, deleteResult) => {
            if (deleteErr) {
                return db.rollback(() => {
                    return res.status(500).json({ message: 'Error deleting from fixedasset table', error: deleteErr });
                });
            }

            if (deleteResult.affectedRows === 0) {
                return db.rollback(() => {
                    return res.status(404).json({ message: 'No matching fixed assets found for deletion.' });
                });
            }

            // Commit the transaction
            db.commit((commitErr) => {
                if (commitErr) {
                    return db.rollback(() => {
                        return res.status(500).json({ message: 'Commit error', error: commitErr });
                    });
                }

                return res.status(200).json({
                    message: `Successfully deleted ${deleteResult.affectedRows} fixed asset(s).`,
                });
            });
        });
    });
};