const asyncHandler = require("express-async-handler");

const db = require("../startup/database");

const getCropByCatogory = asyncHandler(async (req, res) => {
  try {
    const categorie = req.params.categorie;
    const sql = "SELECT * FROM cropCalender WHERE Category=?";
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
    const sql = "SELECT * FROM cropCalender WHERE id=?";
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
      "SELECT * FROM ongoingCultivations oc, ongoingCultivationsCrops ocr, cropcalendardays cd WHERE oc.id= ocr.ongoingCultivationId and ocr.cropCalendar = cd.cropId and oc.userId=? and cd.cropId=?";

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

    const check_ongoingcultivation_sql = "SELECT id FROM ongoingCultivations WHERE userId = ?";
    const create_ongoingcultivation_sql = "INSERT INTO ongoingCultivations(userId) VALUES (?)";
    const check_crop_count_sql = "SELECT COUNT(id) as count FROM ongoingcultivationscrops WHERE ongoingCultivationId = ?";
    const check_enroll_crop_sql = "SELECT cropCalendar FROM ongoingcultivationscrops WHERE ongoingCultivationId = ?";
    const enroll_ongoingcultivationCrop_sql = "INSERT INTO ongoingCultivationsCrops(ongoingCultivationId, cropCalendar) VALUES (?, ?)";


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

    const check_ongoingcultivation_result = await query(check_ongoingcultivation_sql, [userId]);

    if (!check_ongoingcultivation_result[0]) {
      const create_ongoingcultivation_result = await query(create_ongoingcultivation_sql, [userId]);
      cultivationId = create_ongoingcultivation_result.insertId;
      console.log("create_ongoingcultivation_result--", create_ongoingcultivation_result.insertId);
    } else {
      cultivationId = check_ongoingcultivation_result[0].id;
    }

    const crop_count = await query(check_crop_count_sql, [cultivationId]);
    console.log("crop count : ", crop_count[0].count);

    if (crop_count[0].count < 3) {
      const check_enroll_crop = await query(check_enroll_crop_sql, [cultivationId]);

      if (check_enroll_crop.length > 0) {
        const cropAlreadyEnrolled = check_enroll_crop.some(crop => crop.cropCalendar == cropId);

        if (cropAlreadyEnrolled) {
          return res.json({ message: "You are already enrolled in this crop!" });
        }
      }

      const enroll_ongoingcultivationCrop_result = await query(enroll_ongoingcultivationCrop_sql, [cultivationId, cropId]);
      console.log("enrollment successful", enroll_ongoingcultivationCrop_result);

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

module.exports = {
  getCropByCatogory,
  CropCalanderFeed,
  getCropById,
  enroll,
  OngoingCultivaionGetById,
};
