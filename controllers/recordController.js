const jwt = require("jsonwebtoken");
const { getPersonalRecord, getAllPlayerRecord } = require("../models/record");

exports.getPersonalMaxScore = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const username = decoded.name;

    const userRecord = await getPersonalRecord(username);

    res.status(200).json({
      data: {
        name: userRecord.user_name,
        score: userRecord.score,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getRanking = async (req, res) => {
  try {
    const ranking = await getAllPlayerRecord();

    const playerData = [];

    ranking.map((data) => {
      playerData.push(data);
    });

    res.status(200).json({
      data: playerData,
    });
  } catch (error) {
    console.log(error);
  }
};
