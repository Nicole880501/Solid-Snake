function getCookie (name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

const buttons = window.document.querySelectorAll('.btn')

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const token = getCookie('access_token')

    if (token) {
      window.location.href = '/game'
    } else {
      window.location.href = '/signin'
    }
  })
})

const canvas = document.getElementById('backgroundCanvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const scale = 20

const snake = [
  { x: scale * 5, y: scale * 28 },
  { x: scale * 4, y: scale * 28 },
  { x: scale * 3, y: scale * 28 },
  { x: scale * 2, y: scale * 28 }
]
let direction = 'right'

function drawSnake () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'white'

  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, scale, scale)
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 2
    ctx.strokeRect(segment.x, segment.y, scale, scale)
  })
}

function updateSnake () {
  const head = { ...snake[0] }

  switch (direction) {
    case 'right':
      head.x += scale
      break
    case 'left':
      head.x -= scale
      break
    case 'up':
      head.y -= scale
      break
    case 'down':
      head.y += scale
      break
  }

  if (head.x < 0) {
    head.x = canvas.width - 1
  } else if (head.x >= canvas.width) {
    head.x = 0
  }
  if (head.y < 0) {
    head.y = canvas.height - 1
  } else if (head.y >= canvas.height) {
    head.y = 0
  }

  snake.unshift(head)
  snake.x = head.x
  snake.y = head.y
  snake.pop()
}

function changeDirection (event) {
  switch (event.keyCode) {
    case 37:
      if (direction !== 'right') direction = 'left'
      break
    case 38:
      if (direction !== 'down') direction = 'up'
      break
    case 39:
      if (direction !== 'left') direction = 'right'
      break
    case 40:
      if (direction !== 'up') direction = 'down'
      break
  }
}

document.addEventListener('keydown', changeDirection)

function gameLoop () {
  updateSnake()
  drawSnake()
}

setInterval(gameLoop, 100)
