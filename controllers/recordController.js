const jwt = require('jsonwebtoken')
const {
  getPersonalRecord,
  sortAllPlayerScore,
  sortAllPlayerKill,
  sortAllPlayerTime,
  sortAllPlayerMove,
  getAllScore,
  getAllKill,
  getAllGame,
  getAllTime,
  getAllMove,
  getMostUsedSkin
} = require('../models/record')

exports.getPersonalMaxScore = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const username = decoded.name

    const userRecord = await getPersonalRecord(username)

    res.status(200).json({
      data: {
        name: userRecord.user_name,
        score: userRecord.score
      }
    })
  } catch (error) {
    console.log(error)
  }
}

exports.sortScoreRanking = async (req, res) => {
  try {
    const ranking = await sortAllPlayerScore()

    const playerData = []

    ranking.map((data) => {
      return playerData.push(data)
    })

    res.status(200).json({
      data: playerData
    })
  } catch (error) {
    console.log(error)
  }
}

exports.sortKillRanking = async (req, res) => {
  try {
    const ranking = await sortAllPlayerKill()

    const playerData = []

    ranking.map((data) => {
      return playerData.push(data)
    })

    res.status(200).json({
      data: playerData
    })
  } catch (error) {
    console.log(error)
  }
}

exports.sortTimeRanking = async (req, res) => {
  try {
    const ranking = await sortAllPlayerTime()

    const playerData = []

    ranking.map((data) => {
      return playerData.push(data)
    })

    res.status(200).json({
      data: playerData
    })
  } catch (error) {
    console.log(error)
  }
}

exports.sortMoveRanking = async (req, res) => {
  try {
    const ranking = await sortAllPlayerMove()

    const playerData = []

    ranking.map((data) => {
      return playerData.push(data)
    })

    res.status(200).json({
      data: playerData
    })
  } catch (error) {
    console.log(error)
  }
}

exports.getPlayerScore = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const username = decoded.name

    const userRecord = await getAllScore(username)

    if (userRecord) {
      res.status(200).json(userRecord)
    } else {
      res.status(404).json({ message: 'player not found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.getPlayerKill = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const username = decoded.name

    const userRecord = await getAllKill(username)

    if (userRecord) {
      res.status(200).json(userRecord)
    } else {
      res.status(404).json({ message: 'player not found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.getPlayerGame = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const username = decoded.name

    const userRecord = await getAllGame(username)

    if (userRecord) {
      res.status(200).json(userRecord)
    } else {
      res.status(404).json({ message: 'player not found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.getPlayerTime = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const username = decoded.name

    const userRecord = await getAllTime(username)

    if (userRecord) {
      res.status(200).json(userRecord)
    } else {
      res.status(404).json({ message: 'player not found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.getPlayerMove = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const username = decoded.name

    const userRecord = await getAllMove(username)

    if (userRecord) {
      res.status(200).json(userRecord)
    } else {
      res.status(404).json({ message: 'player not found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.getPlayerSkin = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    const username = decoded.name

    const userRecord = await getMostUsedSkin(username)

    if (userRecord) {
      res.status(200).json(userRecord)
    } else {
      res.status(404).json({ message: 'player not found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
