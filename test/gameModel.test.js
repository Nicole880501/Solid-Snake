import { describe, it, expect } from 'vitest'
import { gameState, checkOtherPlayersCollision, checkSelfCollision } from '../models/game'

describe('checkOtherPlayersCollision', () => {
  it('should return true and increase kill count when a player collides with another player', () => {
    gameState.players = {
      player1: {
        id: 'player1',
        snake: [{ x: 5, y: 5 }],
        kill: 0
      },
      player2: {
        id: 'player2',
        snake: [{ x: 5, y: 5 }],
        kill: 0
      }
    }

    const player = gameState.players.player1
    const result = checkOtherPlayersCollision(player, gameState)

    // 断言函数返回值和击杀数增加
    expect(result).toBe(true)
    expect(gameState.players.player2.kill).toBe(1)
  })

  it('should return false when a player does not collide with another player', () => {
    // 设置游戏状态和玩家数据
    gameState.players = {
      player1: {
        id: 'player1',
        snake: [{ x: 5, y: 5 }],
        kill: 0
      },
      player2: {
        id: 'player2',
        snake: [{ x: 10, y: 10 }],
        kill: 0
      }
    }

    const player = gameState.players.player1
    const result = checkOtherPlayersCollision(player, gameState)

    // 断言函数返回值
    expect(result).toBe(false)
    expect(gameState.players.player2.kill).toBe(0)
  })

  it('should ignore checking collision with itself', () => {
    // 设置游戏状态和玩家数据
    gameState.players = {
      player1: {
        id: 'player1',
        snake: [{ x: 5, y: 5 }],
        kill: 0
      }
    }

    const player = gameState.players.player1
    const result = checkOtherPlayersCollision(player, gameState)

    // 断言函数返回值
    expect(result).toBe(false)
    expect(gameState.players.player1.kill).toBe(0)
  })
})

describe('checkSelfCollision', () => {
  it('should return false if there is no collision', () => {
    const player = {
      snake: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 }
      ]
    }
    expect(checkSelfCollision(player)).toBe(false)
  })

  it('should return true if the snake collides with itself', () => {
    const player = {
      snake: [
        { x: 2, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
        { x: 5, y: 1 }
      ]
    }
    expect(checkSelfCollision(player)).toBe(true)
  })

  it('should return false for a snake with only one segment', () => {
    const player = {
      snake: [
        { x: 1, y: 1 }
      ]
    }
    expect(checkSelfCollision(player)).toBe(false)
  })

  it('should return false if head does not collide with any part of the snake', () => {
    const player = {
      snake: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 }
      ]
    }
    expect(checkSelfCollision(player)).toBe(false)
  })
})
