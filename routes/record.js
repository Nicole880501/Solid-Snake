const router = require("express").Router();
const {
  getPersonalMaxScore,
  getRanking,
} = require("../controllers/recordController");

router.post("/maxScore", getPersonalMaxScore);

router.get("/ranking", getRanking);

module.exports = router;
