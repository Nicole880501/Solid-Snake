// eslint-disable-next-line no-undef
const socket = io()

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const scale = 20

let gameState = {}
let weather = 'sunny'
let particles = []
let previousWeather = null

document.getElementById('startButton').addEventListener('click', () => {
  const token = getCookie('access_token')
  const playerColor = document.getElementById('color').value
  socket.emit('startGame', { token, color: playerColor })
})

socket.on('gameState', (state) => {
  gameState = state
  draw()
})

socket.on('weatherChange', (newWeather) => {
  weather = newWeather
  initParticles()
})

socket.on('death', () => {
  socket.disconnect()
  if (window.confirm('You died ! try again ?') === true) {
    window.location.href = '/game'
  } else {
    window.location.href = '/leaderboard'
  }
})

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      socket.emit('changeDirection', 'up')
      break
    case 'ArrowDown':
      socket.emit('changeDirection', 'down')
      break
    case 'ArrowLeft':
      socket.emit('changeDirection', 'left')
      break
    case 'ArrowRight':
      socket.emit('changeDirection', 'right')
      break
    case ' ':
      socket.emit('setSpeed', true)
      break
  }
})

function getCookie (name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

function initParticles () {
  if (previousWeather) {
    particles = particles.filter(p => p.weather === previousWeather)
  } else {
    particles = []
  }

  if (weather === 'rainy') {
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        speedY: Math.random() * 2 + 1,
        length: Math.random() * 10 + 10,
        weather: 'rainy'
      })
    }
  } else if (weather === 'snowy') {
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        speedY: Math.random() * 1 + 0.5,
        radius: Math.random() * 2 + 1,
        weather: 'snowy'
      })
    }
  }
  previousWeather = weather
}

function drawParticles () {
  particles = particles.filter(p => p.y <= canvas.height)

  particles.forEach(particle => {
    if (particle.weather === 'rainy') {
      ctx.strokeStyle = 'blue'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(particle.x, particle.y + particle.length)
      ctx.stroke()
      particle.y += particle.speedY
    } else if (particle.weather === 'snowy') {
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fill()
      particle.y += particle.speedY
    }
  })
}

function drawPlayer () {
  for (const playerId in gameState.players) {
    const player = gameState.players[playerId]
    if (player.color === 'rainbow') {
      drawRainbowSnake(player)
    } else {
      drawSnake(player)
    }
  }
}

function drawSnake (player) {
  ctx.fillStyle = player.color
  ctx.strokeStyle = 'white'
  player.snake.forEach((segment) => {
    ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale)
    ctx.strokeRect(segment.x * scale, segment.y * scale, scale, scale)
  })
}

function drawRainbowSnake (player) {
  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet'
  ]
  player.snake.forEach((segment, index) => {
    ctx.fillStyle = colors[index % colors.length]
    ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale)
    ctx.strokeStyle = 'white'
    ctx.strokeRect(segment.x * scale, segment.y * scale, scale, scale)
  })
}

function drawFruits () {
  gameState.fruits.forEach((fruit) => {
    ctx.fillStyle = 'yellow'
    ctx.fillRect(fruit.x * scale, fruit.y * scale, scale, scale)
  })
}

function drawBadFruits () {
  gameState.badFruits.forEach((badFruit) => {
    ctx.fillStyle = 'red'
    ctx.fillRect(badFruit.x * scale, badFruit.y * scale, scale, scale)
  })
}

function drawRainbowFruits () {
  gameState.rainbowFruits.forEach((fruit) => {
    const gradient = ctx.createLinearGradient(
      fruit.x * scale,
      fruit.y * scale,
      (fruit.x + 1) * scale,
      (fruit.y + 1) * scale
    )

    gradient.addColorStop(0, 'red')
    gradient.addColorStop(0.16, 'orange')
    gradient.addColorStop(0.33, 'yellow')
    gradient.addColorStop(0.5, 'green')
    gradient.addColorStop(0.66, 'blue')
    gradient.addColorStop(0.83, 'indigo')
    gradient.addColorStop(1, 'violet')

    ctx.fillStyle = gradient
    ctx.fillRect(fruit.x * scale, fruit.y * scale, scale, scale)
  })
}

function drawTrapFruits () {
  gameState.trapFruits.forEach((trapFruits) => {
    ctx.fillStyle = 'grey'
    ctx.fillRect(trapFruits.x * scale, trapFruits.y * scale, scale, scale)
  })
}

function drawLeaderboard () {
  const leaderboard = document.getElementById('leaderboard')
  leaderboard.innerHTML = '<h3>Leaderboard</h3>'
  const players = Object.values(gameState.players)
  players.sort((a, b) => b.score - a.score)
  players.forEach((player) => {
    const playerElement = document.createElement('div')
    playerElement.textContent = `${player.name}: ${player.score} score | ${player.kill} kill`
    leaderboard.appendChild(playerElement)
  })
}

let lastUpdateTime = 0
function draw (timestamp) {
  const deltaTime = timestamp - lastUpdateTime
  if (deltaTime < 16) {
    window.requestAnimationFrame(draw)
    return
  }
  lastUpdateTime = timestamp

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawParticles()
  drawPlayer()
  drawFruits()
  drawBadFruits()
  drawRainbowFruits()
  drawTrapFruits()
  drawLeaderboard()

  window.requestAnimationFrame(draw)
}

window.requestAnimationFrame(draw)
