const { response } = require('express');
const db = require('../startup/database');
const {
    addFixedAssetSchema
} = require("../validations/fixedAssest-validation");

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
};

// Add a fixed asset
exports.addFixedAsset = (req, res) => {
    const { error } = addFixedAssetSchema.validate(req.body);
    if (error) {
        const errorMessages = error.details.map(detail => detail.message).join(', ');
        console.log("Validation Error Messages:", errorMessages); // Log error messages
        return res.status(400).json({ message: errorMessages });
    }

    const userId = req.user.id;
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
        durationYears,
        durationMonths,
        leastAmountAnnually,
        permitFeeAnnually,
        paymentAnnually,
        estimateValue,
        landownership,
        assetname,
        toolbrand
    } = req.body;

    console.log(req.body);

    const formattedIssuedDate = formatDate(issuedDate);
    const formattedPurchaseDate = formatDate(purchaseDate);
    const formattedExpireDate = formatDate(expireDate);
    const formattedStartDate = formatDate(startDate);

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ message: 'Transaction error', error: err });

        // Insert into fixedasset table
        const fixedAssetSql = `INSERT INTO fixedasset (userId, category) VALUES (?, ?)`;
        db.query(fixedAssetSql, [userId, category], (fixedAssetErr, fixedAssetResult) => {
            if (fixedAssetErr) {
                return db.rollback(() => {
                    return res.status(500).json({ message: 'Error inserting into fixedasset table', error: fixedAssetErr });
                });
            }

            const fixedAssetId = fixedAssetResult.insertId;
            console.log("Fixed asset id:", fixedAssetId);

            // Handle category 'Building and Infrastructures'
            if (category === 'Building and Infrastructures') {
                const buildingSql = `INSERT INTO buildingfixedasset (fixedAssetId, type, floorArea, ownership, generalCondition, district)
                                     VALUES (?, ?, ?, ?, ?, ?)`;

                db.query(buildingSql, [fixedAssetId, type, floorArea, ownership, generalCondition, district], (buildingErr, buildingResult) => {
                    if (buildingErr) {
                        return db.rollback(() => {
                            return res.status(500).json({ message: 'Error inserting into buildingfixedasset table', error: buildingErr });
                        });
                    }

                    const buildingAssetId = buildingResult.insertId;
                    console.log("Building asset id:", buildingAssetId);

                    // Insert into appropriate ownership table based on ownership type
                    let ownershipSql = '';
                    let ownershipParams = [];

                    switch (ownership) {
                        case 'Own Building (with title ownership)':
                            ownershipSql = `INSERT INTO ownershipownerfixedasset (buildingAssetId, issuedDate, estimateValue)
                                            VALUES (?, ?, ?)`;
                            ownershipParams = [buildingAssetId, formattedIssuedDate, estimateValue];
                            break;

                        case 'Leased Building':
                            ownershipSql = `INSERT INTO ownershipleastfixedasset (buildingAssetId, startDate, durationYears, durationMonths, leastAmountAnnually)
                                            VALUES (?, ?, ?, ?, ?)`;
                            ownershipParams = [buildingAssetId, formattedStartDate, durationYears, durationMonths, leastAmountAnnually];
                            break;

                        case 'Permit Building':
                            ownershipSql = `INSERT INTO ownershippermitfixedasset (buildingAssetId, issuedDate, permitFeeAnnually)
                                            VALUES (?, ?, ?)`;
                            ownershipParams = [buildingAssetId, formattedIssuedDate, permitFeeAnnually];
                            break;

                        case 'Shared / No Ownership':
                            ownershipSql = `INSERT INTO ownershipsharedfixedasset (buildingAssetId, paymentAnnually)
                                            VALUES (?, ?)`;
                            ownershipParams = [buildingAssetId, paymentAnnually];
                            break;

                        default:
                            return db.rollback(() => {
                                return res.status(400).json({ message: 'Invalid ownership type provided for building asset.' });
                            });
                    }

                    // Execute the ownership query
                    db.query(ownershipSql, ownershipParams, (ownershipErr) => {
                        if (ownershipErr) {
                            return db.rollback(() => {
                                return res.status(500).json({ message: 'Error inserting into ownership table', error: ownershipErr });
                            });
                        }

                        // Commit the transaction
                        db.commit((commitErr) => {
                            if (commitErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Commit error', error: commitErr });
                                });
                            }
                            return res.status(201).json({ message: 'Building fixed asset with ownership created successfully.' });
                        });
                    });
                });

                // Handle category 'Land'
            } else if (category === 'Land') {
                const landSql = `INSERT INTO landfixedasset (fixedAssetId, extentha, extentac, extentp, ownership, district, landFenced, perennialCrop)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                db.query(landSql, [fixedAssetId, extentha, extentac, extentp, landownership, district, landFenced, perennialCrop], (landErr, landResult) => {
                    if (landErr) {
                        return db.rollback(() => {
                            return res.status(500).json({ message: 'Error inserting into landfixedasset table', error: landErr });
                        });
                    }

                    const landAssetId = landResult.insertId;

                    // Handle ownership conditions
                    if (landownership === 'Own') {
                        const ownershipOwnerSql = `INSERT INTO ownershipownerfixedasset (landAssetId, issuedDate, estimateValue)
                                                   VALUES (?, ?, ?)`;
                        db.query(ownershipOwnerSql, [landAssetId, formattedIssuedDate, estimateValue], (ownershipErr) => {
                            if (ownershipErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Error inserting into ownershipownerfixedasset table', error: ownershipErr });
                                });
                            }
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        return res.status(500).json({ message: 'Commit error', error: commitErr });
                                    });
                                }
                                return res.status(201).json({ message: 'Land fixed asset with ownership created successfully.' });
                            });
                        });
                    } else if (landownership === 'Lease') {
                        const ownershipLeaseSql = `INSERT INTO ownershipleastfixedasset (landAssetId, startDate, durationYears,durationMonths, leastAmountAnnually)
                                                   VALUES (?, ?, ?, ?,?)`;
                        db.query(ownershipLeaseSql, [landAssetId, formattedStartDate, durationYears, durationMonths, leastAmountAnnually], (leaseErr) => {
                            if (leaseErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Error inserting into ownershipleastfixedasset table', error: leaseErr });
                                });
                            }
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => {
                                        return res.status(500).json({ message: 'Commit error', error: commitErr });
                                    });
                                }
                                return res.status(201).json({ message: 'Land fixed asset with lease ownership created successfully.' });
                            });
                        });
                    } else if (landownership === 'Permited') {
                        const ownershipPermitSql = `INSERT INTO ownershippermitfixedasset (landAssetId, issuedDate, permitFeeAnnually)
                                                    VALUES (?, ?, ?)`;
                        db.query(ownershipPermitSql, [landAssetId, formattedIssuedDate, permitFeeAnnually], (permitErr) => {
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
                                return res.status(201).json({ message: 'Land fixed asset with permit ownership created successfully.' });
                            });
                        });
                    } else if (landownership === 'Shared') {
                        const ownershipSharedSql = `INSERT INTO ownershipsharedfixedasset (landAssetId, paymentAnnually)
                                                    VALUES (?, ?)`;
                        db.query(ownershipSharedSql, [landAssetId, paymentAnnually], (sharedErr) => {
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
                                return res.status(201).json({ message: 'Land fixed asset with shared ownership created successfully.' });
                            });
                        });
                    } else {
                        return db.rollback(() => {
                            return res.status(400).json({ message: 'Invalid ownership type provided for land asset.' });
                        });
                    }
                });

            } else if (category === 'Machine and Vehicles') {
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
                    if (warranty === 'yes') {
                        // Insert into machtoolsfixedassetwarranty table
                        const machToolsWarrantySql = `INSERT INTO machtoolsfixedassetwarranty (machToolsId, purchaseDate, expireDate, warrantystatus)
                                                      VALUES (?, ?, ?, ?)`;
                        db.query(machToolsWarrantySql, [machToolsId, formattedPurchaseDate, formattedExpireDate, warranty], (warrantyErr) => {
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
                    } else if (warranty === 'no') {

                        const machToolsWarrantySql = `INSERT INTO machtoolsfixedassetwarranty (machToolsId, purchaseDate, expireDate, warrantystatus)
                                                      VALUES (?, ?, ?, ?)`;
                        db.query(machToolsWarrantySql, [machToolsId, formattedPurchaseDate, formattedExpireDate, warranty], (warrantyErr) => {
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
            } else if (category === 'Tools') {
                const machToolsSql = `INSERT INTO machtoolsfixedasset (fixedAssetId, asset, assetType, mentionOther, brand, numberOfUnits, unitPrice, totalPrice, warranty)
                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                // Insert into machtoolsfixedasset table
                db.query(machToolsSql, [fixedAssetId, assetname, assetType, mentionOther, toolbrand, numberOfUnits, unitPrice, totalPrice, warranty], (machToolsErr, machToolsResult) => {
                    if (machToolsErr) {
                        return db.rollback(() => {
                            return res.status(500).json({ message: 'Error inserting into machtoolsfixedasset table', error: machToolsErr });
                        });
                    }

                    const machToolsId = machToolsResult.insertId; // Get the inserted machToolsId

                    // Check warranty status
                    if (warranty === 'yes') {
                        // Insert into machtoolsfixedassetwarranty table
                        const machToolsWarrantySql = `INSERT INTO machtoolsfixedassetwarranty (machToolsId, purchaseDate, expireDate, warrantystatus)
                                                      VALUES (?, ?, ?, ?)`;
                        db.query(machToolsWarrantySql, [machToolsId, formattedPurchaseDate, formattedExpireDate, warranty], (warrantyErr) => {
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
                    } else if (warranty === 'no') {

                        const machToolsWarrantySql = `INSERT INTO machtoolsfixedassetwarranty (machToolsId, purchaseDate, expireDate, warrantystatus)
                                                      VALUES (?, ?, ?, ?)`;
                        db.query(machToolsWarrantySql, [machToolsId, formattedPurchaseDate, formattedExpireDate, warranty], (warrantyErr) => {
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


exports.getFixedAssetsByCategory = (req, res) => {
    const userId = req.user.id; // Retrieve the userId from req.user.id
    const { category } = req.params; // Get the category from request parameters

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Transaction error', error: err });
        }

        let sqlQuery = '';
        let queryParams = [userId]; // Initialize with userId

        // Determine which SQL to run based on category
        if (category === 'Land') {
            sqlQuery = `SELECT fa.id, fa.category, lfa.district FROM fixedasset fa
                    JOIN landfixedasset lfa ON fa.id = lfa.fixedAssetId
                    WHERE fa.userId = ? AND fa.category = 'Land'`;
        } else if (category === 'Building and Infrastructures') {
            sqlQuery = `SELECT fa.id, fa.category, bfa.type FROM fixedasset fa
                    JOIN buildingfixedasset bfa ON fa.id = bfa.fixedAssetId
                    WHERE fa.userId = ? AND fa.category = 'Building and Infrastructures'`;
        } else if (category === 'Machine and Vehicles') {
            sqlQuery = `SELECT fa.id, fa.category, mtfa.asset, mtfa.assetType FROM fixedasset fa
                    JOIN machtoolsfixedasset mtfa ON fa.id = mtfa.fixedAssetId
                    WHERE fa.userId = ? AND fa.category = 'Machine and Vehicles'`;
        } else if (category === 'Tools') {
            sqlQuery = `SELECT fa.id, fa.category, mtfa.asset, mtfa.assetType FROM fixedasset fa
                    JOIN machtoolsfixedasset mtfa ON fa.id = mtfa.fixedAssetId
                    WHERE fa.userId = ? AND fa.category = 'Tools'`;
        } else {
            return res.status(400).json({ message: 'Invalid category provided.' });
        }

        // Execute the query based on the category
        db.query(sqlQuery, queryParams, (queryErr, results) => {
            if (queryErr) {
                return db.rollback(() => {
                    return res.status(500).json({ message: 'Error retrieving fixed assets', error: queryErr });
                });
            }

            // Commit the transaction and return the results
            db.commit((commitErr) => {
                if (commitErr) {
                    return db.rollback(() => {
                        return res.status(500).json({ message: 'Commit error', error: commitErr });
                    });
                }
                return res.status(200).json({ message: 'Fixed assets retrieved successfully.', data: results });
            });
        });
    });
};


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Controller to get details for updating fixed assets
exports.getFixedAssetDetailsById = (req, res) => {
    const userId = req.user.id; // Retrieve userId from req.user.id
    const { assetId, category } = req.params; // Get the assetId and category from request parameters

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Transaction error', error: err });
        }

        let sqlQuery = '';
        let ownershipQuery = '';
        let queryParams = [userId, assetId]; // Initialize with userId and assetId

        // Determine which SQL query to run based on category
        if (category === 'Land') {
            sqlQuery = `
                SELECT fa.id AS faId, fa.category, lfa.district, lfa.extentha, lfa.extentac, lfa.extentp, lfa.ownership, lfa.landFenced, lfa.perennialCrop, lfa.id
                FROM fixedasset fa
                JOIN landfixedasset lfa ON fa.id = lfa.fixedAssetId
                WHERE fa.userId = ? AND fa.id = ?`;

        } else if (category === 'Building and Infrastructures') {
            sqlQuery = `
                SELECT fa.id AS faId, fa.category, bfa.type, bfa.floorArea, bfa.ownership, bfa.generalCondition, bfa.district, bfa.id
                FROM fixedasset fa
                JOIN buildingfixedasset bfa ON fa.id = bfa.fixedAssetId
                WHERE fa.userId = ? AND fa.id = ?`;

        } else if (category === 'Machine and Vehicles' || category === 'Tools') {
            sqlQuery = `
                SELECT fa.id AS faId, fa.category, mtfa.asset, mtfa.assetType, mtfa.mentionOther, mtfa.brand, mtfa.numberOfUnits, mtfa.unitPrice, mtfa.totalPrice, mtfa.warranty, mtfa.id 
                FROM fixedasset fa
                JOIN machtoolsfixedasset mtfa ON fa.id = mtfa.fixedAssetId
                WHERE fa.userId = ? AND fa.id = ?`;

            ownershipQuery = `
                SELECT 
                    mtw.purchaseDate, mtw.expireDate, mtw.warrantystatus
                FROM machtoolsfixedassetwarranty mtw
                WHERE mtw.machToolsId = ?`;

        } else {
            return res.status(400).json({ message: 'Invalid category provided.' });
        }

        // Execute the main asset query
        db.query(sqlQuery, queryParams, (queryErr, assetResults) => {
            if (queryErr) {
                return db.rollback(() => {
                    return res.status(500).json({ message: 'Error retrieving asset details', error: queryErr });
                });
            }

            if (assetResults.length === 0) {
                return res.status(404).json({ message: 'Asset not found.' });
            }

            const asset = assetResults[0];
            const assetOwnershipId = asset.id;
            const ownershipType = asset.ownership;

            // Adjust ownershipQuery based on ownershipType after retrieving asset details
            if (category === 'Building and Infrastructures') {
                if (ownershipType === 'Own Building (with title ownership)') {
                    ownershipQuery = `
                        SELECT 
                            oof.issuedDate, oof.estimateValue
                        FROM ownershipownerfixedasset oof
                        WHERE oof.buildingAssetId = ?`;
                } else if (ownershipType === 'Leased Building') {
                    ownershipQuery = `
                        SELECT 
                            olf.startDate, olf.durationYears, olf.leastAmountAnnually, olf.durationMonths
                        FROM ownershipleastfixedasset olf
                        WHERE olf.buildingAssetId = ?`;
                } else if (ownershipType === 'Permit Building') {
                    ownershipQuery = `
                        SELECT
                            opf.issuedDate, opf.permitFeeAnnually
                        FROM ownershippermitfixedasset opf
                        WHERE opf.buildingAssetId = ?`;
                } else if (ownershipType === 'Shared / No Ownership') {
                    ownershipQuery = `
                        SELECT
                            osf.paymentAnnually
                        FROM ownershipsharedfixedasset osf
                        WHERE osf.buildingAssetId = ?`;
                }
            } else if (category === 'Land') {
                if (ownershipType === 'Own') {
                    ownershipQuery = `
                        SELECT 
                            oof.issuedDate, oof.estimateValue
                        FROM ownershipownerfixedasset oof
                        WHERE oof.landAssetId = ?`;
                } else if (ownershipType === 'Lease') {
                    ownershipQuery = `
                        SELECT 
                            olf.startDate, olf.durationYears, olf.leastAmountAnnually, olf.durationMonths
                        FROM ownershipleastfixedasset olf
                        WHERE olf.landAssetId = ?`;
                } else if (ownershipType === 'Permited') {
                    ownershipQuery = `
                        SELECT
                            opf.issuedDate, opf.permitFeeAnnually
                        FROM ownershippermitfixedasset opf
                        WHERE opf.landAssetId = ?`;
                } else if (ownershipType === 'Shared') {
                    ownershipQuery = `
                        SELECT
                            osf.paymentAnnually
                        FROM ownershipsharedfixedasset osf
                        WHERE osf.landAssetId = ?`;
                }
            }

            // Execute the ownership query based on the asset type
            db.query(ownershipQuery, [assetOwnershipId], (ownershipErr, ownershipResults) => {
                if (ownershipErr) {
                    return db.rollback(() => {
                        return res.status(500).json({ message: 'Error retrieving ownership details', error: ownershipErr });
                    });
                }

                asset.ownershipDetails = ownershipResults[0] || null;

                // Commit the transaction and return the asset details with ownership
                db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => {
                            return res.status(500).json({ message: 'Commit error', error: commitErr });
                        });
                    }
                    return res.status(200).json(asset);
                });
            });
        });
    });
};



exports.updateFixedAsset = (req, res) => {
    const userId = req.user.id;
    const { assetId, category } = req.params;
    const assetData = req.body;

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Transaction error', error: err });
        }

        let updateAssetQuery = '';
        let updateParams = [];

        if (category === 'Land') {
            updateAssetQuery = `
                UPDATE landfixedasset lfa
                JOIN fixedasset fa ON fa.id = lfa.fixedAssetId
                SET lfa.district = COALESCE(NULLIF(?, ''), lfa.district),
                    lfa.extentha = COALESCE(NULLIF(?, ''), lfa.extentha),
                    lfa.extentac = COALESCE(NULLIF(?, ''), lfa.extentac),
                    lfa.extentp = COALESCE(NULLIF(?, ''), lfa.extentp),
                    lfa.ownership = COALESCE(NULLIF(?, ''), lfa.ownership),
                    lfa.landFenced = COALESCE(NULLIF(?, ''), lfa.landFenced),
                    lfa.perennialCrop = COALESCE(NULLIF(?, ''), lfa.perennialCrop)
                WHERE fa.userId = ? AND fa.id = ?`;

            updateParams = [
                assetData.district,
                assetData.extentha,
                assetData.extentac,
                assetData.extentp,
                assetData.ownership,
                assetData.landFenced,
                assetData.perennialCrop,
                userId,
                assetData.faId
            ];

            db.query(updateAssetQuery, updateParams, (queryErr) => {
                if (queryErr) {
                    return db.rollback(() => res.status(500).json({ message: 'Error updating asset', error: queryErr }));
                }

                // Proceed with ownership updates based on the ownership type
                const ownershipDetails = assetData.ownershipDetails || {};
                const { ownership, oldOwnership } = assetData;

                if (ownership !== oldOwnership) {
                    let deleteQueries = [];
                    let insertQueries = [];
                    let insertParams = [];

                    if (ownership === 'Own') {
                        deleteQueries = [
                            `DELETE FROM ownershipleastfixedasset WHERE landAssetId = ?`,
                            `DELETE FROM ownershippermitfixedasset WHERE landAssetId = ?`,
                            `DELETE FROM ownershipsharedfixedasset WHERE landAssetId = ?`
                        ];

                        insertQueries.push(`
                            INSERT INTO ownershipownerfixedasset (landAssetId, issuedDate, estimateValue)
                            VALUES (?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))
                        `);
                        insertParams.push([
                            assetData.id,
                            ownershipDetails.issuedDate || null,
                            ownershipDetails.estimateValue || null
                        ]);

                    } else if (ownership === 'Lease') {
                        deleteQueries = [
                            `DELETE FROM ownershipownerfixedasset WHERE landAssetId = ?`,
                            `DELETE FROM ownershippermitfixedasset WHERE landAssetId = ?`,
                            `DELETE FROM ownershipsharedfixedasset WHERE landAssetId = ?`
                        ];

                        insertQueries.push(`
                            INSERT INTO ownershipleastfixedasset (landAssetId, startDate, durationYears, durationMonths, leastAmountAnnually)
                            VALUES (?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))
                        `);
                        insertParams.push([
                            assetData.id,
                            ownershipDetails.startDate || null,
                            ownershipDetails.durationYears || null,
                            ownershipDetails.durationMonths || null,
                            ownershipDetails.leastAmountAnnually || null
                        ]);

                    } else if (ownership === 'Permited') {
                        deleteQueries = [
                            `DELETE FROM ownershipownerfixedasset WHERE landAssetId = ?`,
                            `DELETE FROM ownershipleastfixedasset WHERE landAssetId = ?`,
                            `DELETE FROM ownershipsharedfixedasset WHERE landAssetId = ?`
                        ];

                        insertQueries.push(`
                            INSERT INTO ownershippermitfixedasset (landAssetId, issuedDate, permitFeeAnnually)
                            VALUES (?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))
                        `);
                        insertParams.push([
                            assetData.id,
                            ownershipDetails.issuedDate || null,
                            ownershipDetails.permitFeeAnnually || null
                        ]);

                    } else if (ownership === 'Shared') {
                        deleteQueries = [
                            `DELETE FROM ownershipownerfixedasset WHERE landAssetId = ?`,
                            `DELETE FROM ownershipleastfixedasset WHERE landAssetId = ?`,
                            `DELETE FROM ownershippermitfixedasset WHERE landAssetId = ?`
                        ];

                        insertQueries.push(`
                            INSERT INTO ownershipsharedfixedasset (landAssetId, paymentAnnually)
                            VALUES (?, COALESCE(NULLIF(?, ''), NULL))
                        `);
                        insertParams.push([
                            assetData.id,
                            ownershipDetails.paymentAnnually || null
                        ]);
                    }

                    // Execute delete and insert queries
                    executeDeleteAndInsertQueries(res, deleteQueries, [assetData.id, ], insertQueries, insertParams, updateAssetQuery, updateParams);
                } else {
                    // Ownership type did not change, update relevant fields directly
                    let ownershipUpdateQueries = [];
                    let ownershipUpdateParams = [];

                    if (ownership === 'Own') {
                        ownershipUpdateQueries.push(`
                            UPDATE ownershipownerfixedasset 
                            SET issuedDate = COALESCE(NULLIF(?, ''), issuedDate),
                                estimateValue = COALESCE(NULLIF(?, ''), estimateValue)
                            WHERE landAssetId = ?`);
                        ownershipUpdateParams.push([
                            ownershipDetails.issuedDate || null,
                            ownershipDetails.estimateValue || null,
                            assetId
                        ]);

                    } else if (ownership === 'Lease') {
                        ownershipUpdateQueries.push(`
                            UPDATE ownershipleastfixedasset 
                            SET startDate = COALESCE(NULLIF(?, ''), startDate),
                                durationYears = COALESCE(NULLIF(?, ''), durationYears),
                                durationMonths = COALESCE(NULLIF(?, ''), durationMonths),
                                leastAmountAnnually = COALESCE(NULLIF(?, ''), leastAmountAnnually)
                            WHERE landAssetId = ?`);
                        ownershipUpdateParams.push([
                            ownershipDetails.startDate || null,
                            ownershipDetails.durationYears || null,
                            ownershipDetails.durationMonths || null,
                            ownershipDetails.leastAmountAnnually || null,
                            assetId
                        ]);

                    } else if (ownership === 'Permited') {
                        ownershipUpdateQueries.push(`
                            UPDATE ownershippermitfixedasset 
                            SET issuedDate = COALESCE(NULLIF(?, ''), issuedDate),
                                permitFeeAnnually = COALESCE(NULLIF(?, ''), permitFeeAnnually)
                            WHERE landAssetId = ?`);
                        ownershipUpdateParams.push([
                            ownershipDetails.issuedDate || null,
                            ownershipDetails.permitFeeAnnually || null,
                            assetId
                        ]);

                    } else if (ownership === 'Shared') {
                        ownershipUpdateQueries.push(`
                            UPDATE ownershipsharedfixedasset
                            SET paymentAnnually = COALESCE(NULLIF(?, ''), paymentAnnually)
                            WHERE landAssetId = ?`);
                        ownershipUpdateParams.push([
                            ownershipDetails.paymentAnnually || null,
                            assetId
                        ]);
                    }

                    // Execute ownership updates
                    executeUpdateQueries(res, assetId, ownershipUpdateQueries, ownershipUpdateParams, updateAssetQuery, updateParams);
                }
            });
        } else if (category === 'Building and Infrastructures') {
            updateAssetQuery = `
                UPDATE buildingfixedasset bfa
                JOIN fixedasset fa ON fa.id = bfa.fixedAssetId
                SET bfa.type = COALESCE(NULLIF(?, ''), bfa.type),
                    bfa.floorArea = COALESCE(NULLIF(?, ''), bfa.floorArea),
                    bfa.ownership = COALESCE(NULLIF(?, ''), bfa.ownership),
                    bfa.generalCondition = COALESCE(NULLIF(?, ''), bfa.generalCondition),
                    bfa.district = COALESCE(NULLIF(?, ''), bfa.district)
                WHERE fa.userId = ? AND fa.id = ?`;

            updateParams = [
                assetData.type,
                assetData.floorArea,
                assetData.ownership,
                assetData.generalCondition,
                assetData.district,
                userId,
                assetData.faId
            ];

            // Execute the buildingfixedasset update query
            db.query(updateAssetQuery, updateParams, (queryErr, result) => {
                if (queryErr) {
                    console.error("Error executing updateAssetQuery:", queryErr);
                    return db.rollback(() => res.status(500).json({ message: 'Error updating asset', error: queryErr }));
                }


                // Proceed with ownership updates
                const ownershipDetails = assetData.ownershipDetails || {};
                const { ownership, oldOwnership } = assetData;

                if (ownership !== oldOwnership) {
                    let deleteQueries = [];
                    let insertQueries = [];
                    let insertParams = [];

                    if (ownership === 'Own Building (with title ownership)') {
                        deleteQueries = [
                            `DELETE FROM ownershipleastfixedasset WHERE buildingAssetId = ?`,
                            `DELETE FROM ownershippermitfixedasset WHERE buildingAssetId = ?`,
                            `DELETE FROM ownershipsharedfixedasset WHERE buildingAssetId = ?`
                        ];

                        insertQueries.push(`
                            INSERT INTO ownershipownerfixedasset (buildingAssetId, issuedDate, estimateValue)
                            VALUES (?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))
                        `);
                        insertParams.push([
                            assetData.id,
                            ownershipDetails.issuedDate || null,
                            ownershipDetails.estimateValue || null
                        ]);

                    } else if (ownership === 'Leased Building') {
                        deleteQueries = [
                            `DELETE FROM ownershipownerfixedasset WHERE buildingAssetId = ?`,
                            `DELETE FROM ownershippermitfixedasset WHERE buildingAssetId = ?`,
                            `DELETE FROM ownershipsharedfixedasset WHERE buildingAssetId = ?`
                        ];

                        insertQueries.push(`
                            INSERT INTO ownershipleastfixedasset (buildingAssetId, startDate, durationYears, durationMonths, leastAmountAnnually)
                            VALUES (?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))
                        `);
                        insertParams.push([
                            assetData.id,
                            ownershipDetails.startDate || null,
                            ownershipDetails.durationYears || null,
                            ownershipDetails.durationMonths || null,
                            ownershipDetails.leastAmountAnnually || null
                        ]);
                    } else if (ownership === 'Permit Building') {
                        deleteQueries = [
                            `DELETE FROM ownershipownerfixedasset WHERE buildingAssetId = ?`,
                            `DELETE FROM ownershipleastfixedasset WHERE buildingAssetId = ?`,
                            `DELETE FROM ownershipsharedfixedasset WHERE buildingAssetId = ?`
                        ];

                        insertQueries.push(`
                            INSERT INTO ownershippermitfixedasset (buildingAssetId, issuedDate, permitFeeAnnually)
                            VALUES (?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))
                        `);
                        insertParams.push([
                            assetData.id,
                            ownershipDetails.issuedDate || null,
                            ownershipDetails.permitFeeAnnually || null,
                        ]);
                    } else if (ownership === 'Shared / No Ownership') {
                        deleteQueries = [
                            `DELETE FROM ownershipownerfixedasset WHERE buildingAssetId = ?`,
                            `DELETE FROM ownershipleastfixedasset WHERE buildingAssetId = ?`,
                            `DELETE FROM ownershippermitfixedasset WHERE buildingAssetId = ?`
                        ];

                        insertQueries.push(`
                            INSERT INTO ownershipsharedfixedasset (buildingAssetId, paymentAnnually)
                            VALUES (?, COALESCE(NULLIF(?, ''), NULL))
                        `);
                        insertParams.push([
                            assetData.id,
                            ownershipDetails.paymentAnnually || null,
                        ]);
                    }

                    executeDeleteAndInsertQueries(res, deleteQueries, [assetData.id], insertQueries, insertParams, updateAssetQuery, updateParams);
                } else {
                    let ownershipUpdateQueries = [];
                    let ownershipUpdateParams = [];
                    console.log(assetData.id)

                    if (ownership === 'Own Building (with title ownership)') {
                        ownershipUpdateQueries.push(`
                            UPDATE ownershipownerfixedasset 
                            SET issuedDate = COALESCE(NULLIF(?, ''), issuedDate),
                                estimateValue = COALESCE(NULLIF(?, ''), estimateValue)
                            WHERE buildingAssetId = ?`);
                        ownershipUpdateParams.push([
                            ownershipDetails.issuedDate || null,
                            ownershipDetails.estimateValue || null,
                            assetId
                        ]);
                        console.log(ownershipUpdateParams)
                    } else if (ownership === 'Leased Building') {
                        ownershipUpdateQueries.push(`
                            UPDATE ownershipleastfixedasset 
                            SET startDate = COALESCE(NULLIF(?, ''), startDate),
                                durationYears = COALESCE(NULLIF(?, ''), durationYears),
                                durationMonths = COALESCE(NULLIF(?, ''), durationMonths),
                                leastAmountAnnually = COALESCE(NULLIF(?, ''), leastAmountAnnually)
                            WHERE buildingAssetId = ?`);
                        ownershipUpdateParams.push([
                            ownershipDetails.startDate || null,
                            ownershipDetails.durationYears || null,
                            ownershipDetails.durationMonths || null,
                            ownershipDetails.leastAmountAnnually || null,
                            assetId
                        ]);
                    } else if (ownership === 'Permit Building') {
                        ownershipUpdateQueries.push(`
                            UPDATE  ownershippermitfixedasset 
                            SET issuedDate = COALESCE(NULLIF(?, ''), issuedDate),
                                permitFeeAnnually = COALESCE(NULLIF(?, ''), permitFeeAnnually)
                            WHERE buildingAssetId = ?`);
                        ownershipUpdateParams.push([
                            ownershipDetails.issuedDate || null,
                            ownershipDetails.permitFeeAnnually || null,
                            assetId
                        ]);
                    } else if (ownership === 'Shared / No Ownership') {
                        ownershipUpdateQueries.push(`
                            UPDATE ownershipsharedfixedasset
                            SET paymentAnnually = COALESCE(NULLIF(?, ''), paymentAnnually)
                            WHERE buildingAssetId = ?`);
                        ownershipUpdateParams.push([
                            ownershipDetails.paymentAnnually || null,
                            assetId
                        ]);
                    }
                    executeUpdateQueries(res, assetId, ownershipUpdateQueries, ownershipUpdateParams, updateAssetQuery, updateParams);
                }
            });
        } else if (category === 'Machine and Vehicles' || category === 'Tools') {
            console.log('Category matched:', category);

            const updateAssetQuery = `
                UPDATE machtoolsfixedasset mtfa
                JOIN fixedasset fa ON fa.id = mtfa.fixedAssetId
                SET mtfa.asset = COALESCE(NULLIF(?, ''), mtfa.asset),
                    mtfa.assetType = COALESCE(NULLIF(?, ''), mtfa.assetType),
                    mtfa.brand = COALESCE(NULLIF(?, ''), mtfa.brand),
                    mtfa.numberOfUnits = COALESCE(NULLIF(?, ''), mtfa.numberOfUnits),
                    mtfa.unitPrice = COALESCE(NULLIF(?, ''), mtfa.unitPrice),
                    mtfa.totalPrice = COALESCE(NULLIF(?, ''), mtfa.totalPrice),
                    mtfa.warranty = COALESCE(NULLIF(?, ''), mtfa.warranty),
                    mtfa.mentionOther = COALESCE(NULLIF(?, ''), mtfa.mentionOther)
                WHERE fa.userId = ? AND fa.id = ?`;

            const updateParams = [
                assetData.asset,
                assetData.assetType,
                assetData.brand,
                assetData.numberOfUnits,
                assetData.unitPrice,
                assetData.totalPrice,
                assetData.warranty,
                assetData.mentionOther,
                userId,
                assetData.faId
            ];

            console.log('Update parameters:', updateParams);

            const warrantyDetails = assetData.ownershipDetails || {};

            const warrantyQuery = `
                UPDATE machtoolsfixedassetwarranty 
                SET purchaseDate = COALESCE(NULLIF(?, ''), purchaseDate),
                    expireDate = COALESCE(NULLIF(?, ''), expireDate),
                    warrantystatus = COALESCE(NULLIF(?, ''), warrantystatus)
                WHERE machToolsId = ?`;

            const warrantyParams = [
                warrantyDetails.purchaseDate || null,
                warrantyDetails.expireDate || null,
                warrantyDetails.warrantystatus || null,
                assetId
            ];

            // Execute the update queries in sequence with enhanced error logging
            db.query(updateAssetQuery, updateParams, (queryErr) => {
                if (queryErr) {
                    console.error('Error executing updateAssetQuery:', queryErr);
                    return db.rollback(() => res.status(500).json({ message: 'Error updating asset', error: queryErr }));
                }

                console.log('Asset updated successfully'); // Should appear if update was successful

                db.query(warrantyQuery, warrantyParams, (warrantyErr) => {
                    if (warrantyErr) {
                        console.error('Error executing warrantyQuery:', warrantyErr);
                        return db.rollback(() => res.status(500).json({ message: 'Error updating warranty details', error: warrantyErr }));
                    }

                    console.log('Warranty details updated successfully'); // Should appear if warranty update was successful

                    db.commit((commitErr) => {
                        if (commitErr) {
                            console.error('Error committing transaction:', commitErr);
                            return db.rollback(() => res.status(500).json({ message: 'Commit error', error: commitErr }));
                        }

                        console.log('Transaction committed successfully'); // Confirms successful transaction commit
                        return res.status(200).json({ message: 'Asset and ownership details updated successfully.' });
                    });
                });
            });
        } else {
            return res.status(400).json({ message: 'Invalid category provided.' });
        }

    });
};

// Helper functions for executing delete/insert and update sequences
function executeDeleteAndInsertQueries(res, deleteQueries, deleteParams, insertQueries, insertParams, updateAssetQuery, updateParams) {
    let deletePromises = deleteQueries.map(query => new Promise((resolve, reject) => {
        db.query(query, deleteParams, (err) => {
            if (err) reject(err);
            else resolve();
        });
    }));

    Promise.all(deletePromises)
        .then(() => {
            let insertPromises = insertQueries.map((query, i) => new Promise((resolve, reject) => {
                db.query(query, insertParams[i], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            }));

            return Promise.all(insertPromises);
        })
        .then(() => {
            db.query(updateAssetQuery, updateParams, (queryErr) => {
                if (queryErr) return db.rollback(() => res.status(500).json({ message: 'Error updating asset', error: queryErr }));
                db.commit((commitErr) => {
                    if (commitErr) return db.rollback(() => res.status(500).json({ message: 'Commit error', error: commitErr }));
                    return res.status(200).json({ message: 'Asset and ownership details updated successfully.' });
                });
            });
        })
        .catch((err) => {
            db.rollback(() => res.status(500).json({ message: 'Error executing ownership change', error: err }));
        });
}

function executeUpdateQueries(res, assetId, updateQueries = [], updateParams = [], updateAssetQuery, updateParamsAsset) {
    if (!Array.isArray(updateQueries) || !Array.isArray(updateParams)) {
        console.error("Error: updateQueries and updateParams must be arrays");
        return res.status(500).json({ message: 'Invalid parameters for update queries' });
    }

    let updatePromises = updateQueries.map((query, i) => new Promise((resolve, reject) => {
        db.query(query, updateParams[i], (err) => {
            if (err) reject(err);
            else resolve();
        });
    }));

    Promise.all(updatePromises)
        .then(() => {
            db.query(updateAssetQuery, updateParamsAsset, (queryErr) => {
                if (queryErr) return db.rollback(() => res.status(500).json({ message: 'Error updating asset', error: queryErr }));
                db.commit((commitErr) => {
                    if (commitErr) return db.rollback(() => res.status(500).json({ message: 'Commit error', error: commitErr }));
                    return res.status(200).json({ message: 'Asset and ownership details updated successfully.' });
                });
            });
        })
        .catch((err) => {
            db.rollback(() => res.status(500).json({ message: 'Error executing ownership update', error: err }));
        });
}



// Helper function to execute multiple ownership updates in sequence
function executeOwnershipUpdates(res, ...queries) {
    function executeNext(i) {
        if (i >= queries.length) {
            return db.commit((commitErr) => {
                if (commitErr) {
                    return db.rollback(() => res.status(500).json({ message: 'Commit error', error: commitErr }));
                }
                return res.status(200).json({ message: 'Update successful.' });
            });
        }

        const currentQuery = queries[i];
        if (!currentQuery || !Array.isArray(currentQuery) || currentQuery.length < 2) {
            return executeNext(i + 1);
        }

        const [query, params] = currentQuery;

        db.query(query, params, (err) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ message: 'Ownership update error', error: err }));
            }
            executeNext(i + 1);
        });
    }
    executeNext(0);
}


//delete fixed asset
// exports.deleteFixedAsset = (req, res) => {
//     const userId = req.user.id; // Retrieve userId from req.user.id
//     const { assetId, category } = req.params; // Get assetId and category from request parameters

//     // Start a transaction
//     db.beginTransaction((err) => {
//         if (err) {
//             return res.status(500).json({ message: 'Transaction error', error: err });
//         }

//         let deleteAssetQuery = '';
//         let deleteOwnershipQuery = '';

//         // Prepare the delete query based on the asset category
//         if (category === 'Land') {
//             deleteAssetQuery = `
//                 DELETE lfa, fa
//                 FROM landfixedasset lfa
//                 JOIN fixedasset fa ON fa.id = lfa.fixedAssetId
//                 WHERE fa.userId = ? AND fa.id = ?`;

//             deleteOwnershipQuery = `
//                 DELETE oof, olf, opf, osf
//                 FROM ownershipownerfixedasset oof
//                 LEFT JOIN ownershipleastfixedasset olf ON oof.landAssetId = olf.landAssetId
//                 LEFT JOIN ownershippermitfixedasset opf ON oof.landAssetId = opf.landAssetId
//                 LEFT JOIN ownershipsharedfixedasset osf ON oof.landAssetId = osf.landAssetId
//                 WHERE oof.landAssetId = ?`;
//         } else if (category === 'Building and Infrastructures') {
//             deleteAssetQuery = `
//                 DELETE bfa, fa
//                 FROM buildingfixedasset bfa
//                 JOIN fixedasset fa ON fa.id = bfa.fixedAssetId
//                 WHERE fa.userId = ? AND fa.id = ?`;

//             deleteOwnershipQuery = `
//                 DELETE oof, olf, opf, osf
//                 FROM ownershipownerfixedasset oof
//                 LEFT JOIN ownershipleastfixedasset olf ON oof.buildingAssetId = olf.buildingAssetId
//                 LEFT JOIN ownershippermitfixedasset opf ON oof.buildingAssetId = opf.buildingAssetId
//                 LEFT JOIN ownershipsharedfixedasset osf ON oof.buildingAssetId = osf.buildingAssetId
//                 WHERE oof.buildingAssetId = ?`;
//         } else if (category === 'Machine and Vehicles' || category === 'Tools') {
//             deleteAssetQuery = `
//                 DELETE mtfa, fa
//                 FROM machtoolsfixedasset mtfa
//                 JOIN fixedasset fa ON fa.id = mtfa.fixedAssetId
//                 WHERE fa.userId = ? AND fa.id = ?`;

//             deleteOwnershipQuery = `
//                 DELETE mtw
//                 FROM machtoolsfixedassetwarranty mtw
//                 WHERE mtw.machToolsId = ?`;
//         } else {
//             return res.status(400).json({ message: 'Invalid category provided.' });
//         }

//         // Execute the delete asset query
//         db.query(deleteAssetQuery, [userId, assetId], (queryErr, results) => {
//             if (queryErr) {
//                 return db.rollback(() => {
//                     return res.status(500).json({ message: 'Error deleting asset details', error: queryErr });
//                 });
//             }

//             // Execute the ownership delete query
//             db.query(deleteOwnershipQuery, [assetId], (ownershipErr, ownershipResults) => {
//                 if (ownershipErr) {
//                     return db.rollback(() => {
//                         return res.status(500).json({ message: 'Error deleting ownership details', error: ownershipErr });
//                     });
//                 }

//                 // Commit the transaction
//                 db.commit((commitErr) => {
//                     if (commitErr) {
//                         return db.rollback(() => {
//                             return res.status(500).json({ message: 'Commit error', error: commitErr });
//                         });
//                     }
//                     return res.status(200).json({ message: 'Asset and ownership details deleted successfully.' });
//                 });
//             });
//         });
//     });
// };

exports.deleteFixedAsset = (req, res) => {
    const userId = req.user.id;
    const { assetId, category } = req.params;

    // Retrieve the assetData to confirm the asset exists
    db.query(`SELECT id FROM fixedasset WHERE id = ? AND userId = ?`, [assetId, userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Asset not found or error occurred', error: err });
        }

        const assetData = results[0];

        // Start a transaction
        db.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({ message: 'Transaction error', error: err });
            }

            let deleteAssetQuery = '';
            let deleteOwnershipQueries = [];

            // Prepare delete queries based on the asset category
            if (category === 'Land') {
                deleteAssetQuery = `
                    DELETE lfa, fa
                    FROM landfixedasset lfa
                    JOIN fixedasset fa ON fa.id = lfa.fixedAssetId
                    WHERE fa.userId = ? AND fa.id = ?`;

                deleteOwnershipQueries = [
                    `DELETE FROM ownershipownerfixedasset WHERE landAssetId = ?`,
                    `DELETE FROM ownershipleastfixedasset WHERE landAssetId = ?`,
                    `DELETE FROM ownershippermitfixedasset WHERE landAssetId = ?`,
                    `DELETE FROM ownershipsharedfixedasset WHERE landAssetId = ?`
                ];
            } else if (category === 'Building and Infrastructures') {
                deleteAssetQuery = `
                    DELETE bfa, fa
                    FROM buildingfixedasset bfa
                    JOIN fixedasset fa ON fa.id = bfa.fixedAssetId
                    WHERE fa.userId = ? AND fa.id = ?`;

                deleteOwnershipQueries = [
                    `DELETE FROM ownershipownerfixedasset WHERE buildingAssetId = ?`,
                    `DELETE FROM ownershipleastfixedasset WHERE buildingAssetId = ?`,
                    `DELETE FROM ownershippermitfixedasset WHERE buildingAssetId = ?`,
                    `DELETE FROM ownershipsharedfixedasset WHERE buildingAssetId = ?`
                ];
            } else if (category === 'Machine and Vehicles' || category === 'Tools') {
                deleteAssetQuery = `
                    DELETE mtfa, fa
                    FROM machtoolsfixedasset mtfa
                    JOIN fixedasset fa ON fa.id = mtfa.fixedAssetId
                    WHERE fa.userId = ? AND fa.id = ?`;

                deleteOwnershipQueries = [
                    `DELETE FROM machtoolsfixedassetwarranty WHERE machToolsId = ?`
                ];
            } else {
                return res.status(400).json({ message: 'Invalid category provided.' });
            }

            // Step 1: Execute all ownership delete queries one by one
            const ownershipDeletionPromises = deleteOwnershipQueries.map(query => {
                return new Promise((resolve, reject) => {
                    db.query(query, [assetData.id], (ownershipErr) => {
                        if (ownershipErr) reject(ownershipErr);
                        else resolve();
                    });
                });
            });

            Promise.all(ownershipDeletionPromises)
                .then(() => {
                    // Step 2: Execute the asset delete query after all ownership data is deleted
                    db.query(deleteAssetQuery, [userId, assetData.id], (queryErr) => {
                        if (queryErr) {
                            return db.rollback(() => {
                                return res.status(500).json({ message: 'Error deleting asset details', error: queryErr });
                            });
                        }

                        // Step 3: Commit the transaction if both deletes are successful
                        db.commit((commitErr) => {
                            if (commitErr) {
                                return db.rollback(() => {
                                    return res.status(500).json({ message: 'Commit error', error: commitErr });
                                });
                            }
                            return res.status(200).json({ message: 'Asset and ownership details deleted successfully.' });
                        });
                    });
                })
                .catch((ownershipDeletionErr) => {
                    db.rollback(() => {
                        return res.status(500).json({ message: 'Error deleting ownership details', error: ownershipDeletionErr });
                    });
                });
        });
    });
};