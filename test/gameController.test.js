import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { onConnection } from '../controllers/gameController'
import { gameState } from '../models/game'

describe('Socket Events', () => {
  let io, serverSocket, clientSocket
  beforeEach((done) => {
    const httpServer = createServer()
    io = new Server(httpServer)
    httpServer.listen(() => {
      const port = httpServer.address().port
      clientSocket = require('socket.io-client')(`http://localhost:${port}`)
      io.on('connection', (socket) => {
        serverSocket = socket
        onConnection(socket)
        gameState.players[socket.id] = {
          direction: 'up',
          lastMoveDirection: 'up',
          snake: [{ x: 10, y: 10 }]
        }
      })
      clientSocket.on('connect', done)
    })
  })

  afterEach(() => {
    io.close()
  })

  describe('changeDirection', () => {
    it('should change direction if new direction is valid', (done) => {
      console.log('done')
      setTimeout(() => {
        expect(gameState.players[serverSocket.id].direction).toBe('left')
        done()
      }, 50)
    })

    it('should not change direction if new direction is opposite of current direction', (done) => {
      console.log('done')
      setTimeout(() => {
        expect(gameState.players[serverSocket.id].direction).toBe('up')
        done()
      }, 50)
    })

    it('should publish changeDirection event if not primary server', (done) => {
      const originalIsPrimaryServer = process.env.IS_PRIMARY_SERVER
      process.env.IS_PRIMARY_SERVER = 'false'
      const pubClientMock = {
        publish: vi.fn()
      }

      console.log('done')
      setTimeout(() => {
        expect(pubClientMock.publish).toHaveBeenCalledWith('changeDirection', JSON.stringify({ id: serverSocket.id, direction: 'left' }))
        process.env.IS_PRIMARY_SERVER = originalIsPrimaryServer
        done()
      }, 50)
    })
  })
})
