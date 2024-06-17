const { getPersonalRecord, getAllPlayerRecord } = require("../models/record");

exports.getPersonalMaxScore = async (req, res) => {
  try {
    const { username } = req.body;

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

    playerData.sort((a, b) => b.score - a.score);

    res.status(200).json({
      data: playerData,
    });
  } catch (error) {
    console.log(error);
  }
};
