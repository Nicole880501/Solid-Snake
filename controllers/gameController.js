const jwt = require('jsonwebtoken')
const {
  gameState,
  generateFruit,
  generateRainbowFruit,
  movePlayer,
  checkHeadCollision
} = require('../models/game')
const { getUser, updateUserLevel } = require('../models/user')
const { createRecord } = require('../models/record')

const INITIAL_SNAKE_LENGTH = 4
const DEFAULT_INTERVAL = 100
const SLOW_INTERVAL = 200
const ACCELERATED_INTERVAL = 50
const ACCELERATE_DURATION = 3000
const COOLDOWN_DURATION = 20000
const WEATHER_DURATION = 20000

const WEATHER_TYPES = ['sunny', 'rainy', 'snowy']

const isPrimaryServer = process.env.IS_PRIMARY_SERVER === 'true'
let pubClient

function onConnection (socket) {
  console.log('New player connected:', socket.id)
  let onConnectionTime

  socket.on('startGame', async (data) => {
    try {
      onConnectionTime = Date.now()
      const decoded = jwt.verify(data.token, process.env.JWT_KEY)
      const user = await getUser(decoded.name)

      if (user) {
        const initialX = Math.floor(Math.random() * 80)
        const initialY = Math.floor(Math.random() * 40)
        const initialSnake = []
        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
          initialSnake.push({ x: initialX, y: initialY })
        }

        const playerData = {
          id: socket.id,
          name: user.name,
          x: initialX,
          y: initialY,
          direction: 'right',
          lastMoveDirection: 'right',
          snake: initialSnake,
          grow: false,
          invincible: true,
          interval: DEFAULT_INTERVAL,
          accelerated: false,
          cooldown: false,
          score: 0,
          totalMoves: 0,
          kill: 0,
          color: data.color,
          level: user.level,
          experience: user.experience
        }

        gameState.players[socket.id] = playerData

        // Set player state based on current weather
        adjustPlayerStateForWeather(gameState.players[socket.id], gameState.weather)

        if (!isPrimaryServer) {
          // Send player information to the primary server
          pubClient.publish('playerJoined', JSON.stringify(playerData))
        }

        setTimeout(() => {
          if (gameState.players[socket.id]) {
            gameState.players[socket.id].invincible = false
          }
        }, 3000)
      }
    } catch (err) {
      console.error('JWT verification failed:', err)
    }
  })

  socket.on('changeDirection', async (newDirection) => {
    try {
      const player = gameState.players[socket.id]
      const currentDirection = player.direction
      if (
        (newDirection === 'left' &&
          currentDirection !== 'right' &&
          player.lastMoveDirection !== 'right') ||
        (newDirection === 'right' &&
          currentDirection !== 'left' &&
          player.lastMoveDirection !== 'left') ||
        (newDirection === 'up' &&
          currentDirection !== 'down' &&
          player.lastMoveDirection !== 'down') ||
        (newDirection === 'down' &&
          currentDirection !== 'up' &&
          player.lastMoveDirection !== 'up')
      ) {
        gameState.players[socket.id].direction = newDirection
        if (!isPrimaryServer) {
          pubClient.publish('changeDirection', JSON.stringify({ id: socket.id, direction: newDirection }))
        }
      }
    } catch (error) {
      console.error('Please press start game:', error)
    }
  })

  socket.on('setSpeed', async () => {
    try {
      const player = gameState.players[socket.id]
      if (!player.cooldown) {
        player.accelerated = true
        player.interval = ACCELERATED_INTERVAL

        if (!isPrimaryServer) {
          pubClient.publish('setSpeed', JSON.stringify({ id: socket.id }))
        }

        setTimeout(() => {
          player.accelerated = false
          player.interval = DEFAULT_INTERVAL
          player.cooldown = true

          setTimeout(() => {
            player.cooldown = false
          }, COOLDOWN_DURATION)
        }, ACCELERATE_DURATION)
      }
    } catch (error) {
      console.log('Something went wrong:', error)
    }
  })

  socket.on('disconnect', async () => {
    const disconnectTime = Date.now()
    const totalConnectionTime = (disconnectTime - onConnectionTime) / 1000
    console.log('Player disconnected:', socket.id)
    const player = gameState.players[socket.id]
    if (player) {
      try {
        const deathPosition = player.snake[0]
        await updateUserLevel(player.name, player.level, player.experience)
        await createRecord({
          user_name: player.name,
          skin: player.color,
          score: player.score,
          play_time: totalConnectionTime,
          player_kill: player.kill,
          total_moves: player.totalMoves,
          level: player.level,
          experience: player.experience,
          death_x: deathPosition.x,
          death_y: deathPosition.y
        })
        delete gameState.players[socket.id]

        if (!isPrimaryServer) {
          pubClient.publish('playerDisconnected', JSON.stringify({ id: socket.id }))
        }
      } catch (error) {
        console.log('Failed to create record:', error)
      }
    }
  })
}

function adjustPlayerStateForWeather (player, weather) {
  if (weather === 'rainy') {
    player.interval = SLOW_INTERVAL
  } else if (weather === 'snowy') {
    player.snake = player.snake.slice(0, 4)
    player.interval = DEFAULT_INTERVAL // Set speed to default during snowy weather
  } else if (weather === 'sunny') {
    player.interval = DEFAULT_INTERVAL
  }
}

async function handlePlayerDeath (playerId) {
  const player = gameState.players[playerId]
  if (player) {
    try {
      const deathPosition = player.snake[0]
      await createRecord({
        user_name: player.name,
        skin: player.color,
        score: player.score,
        level: player.level,
        experience: player.experience,
        death_x: deathPosition.x,
        death_y: deathPosition.y
      })
      delete gameState.players[playerId]
    } catch (error) {
      console.log('Failed to create record:', error)
    }
  }
}

function startWeatherCycle (io) {
  let currentWeatherIndex = 0

  setInterval(() => {
    gameState.weather = WEATHER_TYPES[currentWeatherIndex]

    // Handle weather effects
    adjustGameStateForWeather(gameState.weather)

    io.sockets.emit('weatherChange', gameState.weather)
    currentWeatherIndex = (currentWeatherIndex + 1) % WEATHER_TYPES.length
  }, WEATHER_DURATION)
}

function adjustGameStateForWeather (weather) {
  gameState.rainbowFruits = []
  if (weather === 'sunny') {
    gameState.fruits = Array(10).fill().map(generateFruit)
    gameState.badFruits = [generateFruit()]
    gameState.trapFruits = Array(10).fill().map(generateFruit)
    generateRainbowFruit()
    for (const playerId in gameState.players) {
      gameState.players[playerId].interval = DEFAULT_INTERVAL
    }
  } else if (weather === 'rainy') {
    gameState.fruits = Array(20).fill().map(generateFruit)
    gameState.badFruits = [generateFruit()]
    gameState.trapFruits = Array(10).fill().map(generateFruit)
    generateRainbowFruit()
    for (const playerId in gameState.players) {
      gameState.players[playerId].interval = SLOW_INTERVAL
    }
  } else if (weather === 'snowy') {
    gameState.fruits = []
    gameState.badFruits = []
    gameState.trapFruits = []
    for (const playerId in gameState.players) {
      const player = gameState.players[playerId]
      player.snake = player.snake.slice(0, 4)
      player.interval = DEFAULT_INTERVAL // Set speed to default during snowy weather
    }
  }
}

function calculateLevel (experience) {
  let level = 1
  let requiredExperience = 300
  let totalRequiredExperience = 300

  while (experience >= totalRequiredExperience) {
    level += 1
    requiredExperience += 200
    totalRequiredExperience += requiredExperience
  }

  return level
}

function addExperience (player, experience) {
  player.experience += experience
  const newLevel = calculateLevel(player.experience)
  if (newLevel > player.level) {
    player.level = newLevel
    console.log(`Player ${player.name} leveled up to ${player.level}`)
  }
}

function gameLoop (io) {
  const playersToRemove = []
  const headCollisions = []
  const fruitMap = new Map()
  const badFruitMap = new Map()
  const trapFruitMap = new Map()
  const rainbowFruitMap = new Map()

  gameState.fruits.forEach((fruit, index) => {
    fruitMap.set(`${fruit.x},${fruit.y}`, index)
  })

  gameState.badFruits.forEach((badFruit, index) => {
    badFruitMap.set(`${badFruit.x},${badFruit.y}`, index)
  })

  gameState.trapFruits.forEach((trapFruit, index) => {
    trapFruitMap.set(`${trapFruit.x},${trapFruit.y}`, index)
  })

  gameState.rainbowFruits.forEach((rainbowFruit, index) => {
    rainbowFruitMap.set(`${rainbowFruit.x},${rainbowFruit.y}`, index)
  })

  for (const playerId in gameState.players) {
    const player = gameState.players[playerId]
    const now = Date.now()

    if (!player.lastMove || now - player.lastMove >= player.interval) {
      const alive = movePlayer(player, gameState)
      player.lastMove = now

      if (!alive) {
        playersToRemove.push(playerId)
        io.to(playerId).emit('death')
      } else {
        const head = player.snake[0]
        const headPos = `${head.x},${head.y}`

        if (fruitMap.has(headPos)) {
          player.grow = true
          player.score += 10
          addExperience(player, 10)
          const fruitIndex = fruitMap.get(headPos)
          gameState.fruits.splice(fruitIndex, 1)
          gameState.fruits.push(generateFruit())
        }

        if (badFruitMap.has(headPos)) {
          if (player.snake.length > 1) {
            player.snake.pop()
            player.score -= 10
          }
          const badFruitIndex = badFruitMap.get(headPos)
          gameState.badFruits.splice(badFruitIndex, 1)
          gameState.badFruits.push(generateFruit())
        }

        if (rainbowFruitMap.has(headPos)) {
          player.grow = true
          player.score += 50
          addExperience(player, 50)
          for (let i = 0; i < 5; i++) {
            player.snake.push({ ...player.snake[player.snake.length - 1] })
          }
          const rainbowFruitIndex = rainbowFruitMap.get(headPos)
          gameState.rainbowFruits.splice(rainbowFruitIndex, 1)
        }

        if (trapFruitMap.has(headPos)) {
          playersToRemove.push(playerId)
          io.to(playerId).emit('death')
        }
      }
    }
  }

  // Check head collisions after all moves
  for (const playerId in gameState.players) {
    const player = gameState.players[playerId]
    if (checkHeadCollision(player, gameState)) {
      headCollisions.push(playerId)
    }
  }

  headCollisions.forEach((playerId) => {
    const player = gameState.players[playerId]
    addExperience(player, 50)
    playersToRemove.push(playerId)
    io.to(playerId).emit('death')
  })

  setTimeout(() => {
    playersToRemove.forEach((playerId) => {
      handlePlayerDeath(playerId)
    })
  }, 1000)

  if (isPrimaryServer) {
    io.sockets.emit('gameState', gameState) // 主服务器广播游戏状态
  }
}

function updateGameState (newState) {
  Object.assign(gameState, newState)
}

function addPlayer (playerData) {
  gameState.players[playerData.id] = playerData
  adjustPlayerStateForWeather(gameState.players[playerData.id], gameState.weather)
}

function setPubClient (client) {
  pubClient = client
}

module.exports = {
  onConnection,
  gameLoop,
  startWeatherCycle,
  updateGameState,
  addPlayer,
  setPubClient
}
