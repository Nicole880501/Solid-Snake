const router = require('express').Router()
const {
  getPersonalMaxScore,
  sortScoreRanking,
  sortKillRanking,
  sortTimeRanking,
  sortMoveRanking,
  getPlayerScore,
  getPlayerKill,
  getPlayerGame,
  getPlayerTime,
  getPlayerMove,
  getPlayerSkin
} = require('../controllers/recordController')

router.get('/maxScore', getPersonalMaxScore)

router.get('/scoreRanking', sortScoreRanking)

router.get('/killRanking', sortKillRanking)

router.get('/timeRanking', sortTimeRanking)

router.get('/moveRanking', sortMoveRanking)

router.get('/playerScore', getPlayerScore)

router.get('/playerKill', getPlayerKill)

router.get('/playerGame', getPlayerGame)

router.get('/playerTime', getPlayerTime)

router.get('/playerMove', getPlayerMove)

router.get('/playerSkin', getPlayerSkin)

module.exports = router
