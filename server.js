const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const { createClient } = require('redis')
const { createAdapter } = require('@socket.io/redis-adapter')
const { onConnection, gameLoop, startWeatherCycle } = require('./controllers/gameController')
const { errorHandler, socketErrorHandler } = require('./utils/errorHandler')

const app = express()
const path = require('path')
const server = http.createServer(app)
const io = socketIo(server)
const pubClient = createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()

const dotenv = require('dotenv')
dotenv.config()

const userRoutes = require('./routes/user')
const recordRoutes = require('./routes/record')

io.adapter(createAdapter(pubClient, subClient))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static('public'))

app.use('/user', userRoutes)
app.use('/record', recordRoutes)

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

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

setInterval(() => {
  gameLoop(io)
}, 50)

startWeatherCycle(io)

app.get('/*', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404page.html'))
})

app.use(errorHandler)

socketErrorHandler(server)

server.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
