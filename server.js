const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const { createAdapter } = require('@socket.io/redis-adapter')
const { onConnection, gameLoop, startWeatherCycle, updateGameState, addPlayer, setPubClient } = require('./controllers/gameController')
const { gameState } = require('./models/game')
const { errorHandler, socketErrorHandler } = require('./utils/errorHandler')
const {
  DEFAULT_INTERVAL,
  ACCELERATED_INTERVAL,
  ACCELERATE_DURATION,
  COOLDOWN_DURATION
} = require('./config/gameConstant')
const { pubClient, subClient, connectRedisClients } = require('./service/redisClient')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const path = require('path')
const server = http.createServer(app)
const io = socketIo(server)

const isPrimaryServer = process.env.IS_PRIMARY_SERVER === 'true'

const userRoutes = require('./routes/user')
const recordRoutes = require('./routes/record')

connectRedisClients().then(() => {
  io.adapter(createAdapter(pubClient, subClient))

  setPubClient(pubClient)

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(express.static('public'))

  app.use('/user', userRoutes)
  app.use('/record', recordRoutes)

  app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })

  // this route is for AWS load balancer check health state
  app.get('/health', async (req, res) => {
    res.status(200).send('ok')
  })

  app.get('/signin', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'))
  })
  app.get('/signup', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'))
  })
  app.get('/game', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'))
  })

  app.get('/leaderboard', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'leaderboard.html'))
  })

  app.get('/analytics', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analytics.html'))
  })

  app.get('/deathZone', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'deathZone.html'))
  })

  io.on('connection', (socket) => {
    onConnection(socket)
  })

  if (isPrimaryServer) {
    setInterval(() => {
      gameLoop(io)
    }, 50)
    startWeatherCycle(io)

    setInterval(() => {
      pubClient.publish('gameStateUpdate', JSON.stringify(gameState))
    }, 100)

    subClient.subscribe('playerJoined', (message) => {
      const playerData = JSON.parse(message)
      addPlayer(playerData)
    })

    subClient.subscribe('changeDirection', (message) => {
      const { id, direction } = JSON.parse(message)
      if (gameState.players[id]) {
        gameState.players[id].direction = direction
      }
    })

    subClient.subscribe('setSpeed', (message) => {
      const { id } = JSON.parse(message)
      const player = gameState.players[id]
      if (player && !player.cooldown) {
        player.accelerated = true
        player.interval = ACCELERATED_INTERVAL
        setTimeout(() => {
          player.accelerated = false
          player.interval = DEFAULT_INTERVAL
          player.cooldown = true
          setTimeout(() => {
            player.cooldown = false
          }, COOLDOWN_DURATION)
        }, ACCELERATE_DURATION)
      }
    })

    subClient.subscribe('playerDisconnected', (message) => {
      const { id } = JSON.parse(message)
      const player = gameState.players[id]
      if (player) {
        delete gameState.players[id]
      }
    })
  } else {
    subClient.subscribe('gameStateUpdate', (message) => {
      const newState = JSON.parse(message)
      updateGameState(newState)
    })
  }

  app.get('/*', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '404page.html'))
  })

  app.use(errorHandler)

  socketErrorHandler(server)

  const PORT = process.env.PORT || 4000
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
