const router = require("express").Router();
const {
  getPersonalMaxScore,
  getRanking,
  getPlayerScore,
  getPlayerKill,
  getPlayerGame,
  getPlayerTime,
  getPlayerMove,
  getPlayerSkin,
} = require("../controllers/recordController");

router.get("/maxScore", getPersonalMaxScore);

router.get("/ranking", getRanking);

router.get("/playerScore", getPlayerScore);

router.get("/playerKill", getPlayerKill);

router.get("/playerGame", getPlayerGame);

router.get("/playerTime", getPlayerTime);

router.get("/playerMove", getPlayerMove);

router.get("/playerSkin", getPlayerSkin);

module.exports = router;
