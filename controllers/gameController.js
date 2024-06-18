const jwt = require("jsonwebtoken");
const {
  gameState,
  generateFruit,
  generateRainbowFruit,
  movePlayer,
  checkCollision,
  checkHeadCollision,
} = require("../models/game");
const { getUser } = require("../models/user");
const { createRecord } = require("../models/record");

const INITIAL_SNAKE_LENGTH = 4;
const DEFAULT_INTERVAL = 100;
const ACCELERATED_INTERVAL = 50;
const ACCELERATE_DURATION = 3000;
const COOLDOWN_DURATION = 20000;

function onConnection(socket) {
  console.log("New player connected:", socket.id);

  socket.on("startGame", async (data) => {
    try {
      const decoded = jwt.verify(data.token, process.env.JWT_KEY);
      const user = await getUser(decoded.name);

      if (user) {
        const initialX = Math.floor(Math.random() * 80);
        const initialY = Math.floor(Math.random() * 40);
        const initialSnake = [];
        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
          initialSnake.push({ x: initialX, y: initialY });
        }

        gameState.players[socket.id] = {
          id: socket.id,
          name: user.name,
          x: initialX,
          y: initialY,
          direction: "right",
          lastMoveDirection: "right",
          snake: initialSnake,
          grow: false,
          invincible: true,
          interval: DEFAULT_INTERVAL,
          accelerated: false,
          cooldown: false,
          score: 0,
          color: data.color, // Store player color
        };

        if (gameState.fruits.length === 0) {
          gameState.fruits.push(generateFruit());
        }
        if (gameState.badFruits.length === 0) {
          gameState.badFruits.push(generateFruit());
        }
        if (gameState.trapFruits.length === 0) {
          for (let i = 0; i < 10; i++) {
            gameState.trapFruits.push(generateFruit());
          }
        }
        if (gameState.rainbowFruits.length === 0) {
          generateRainbowFruit();
        }

        setTimeout(() => {
          if (gameState.players[socket.id]) {
            gameState.players[socket.id].invincible = false;
          }
        }, 3000);
      }
    } catch (err) {
      console.error("JWT verification failed:", err);
    }
  });

  socket.on("changeDirection", async (newDirection) => {
    try {
      const player = gameState.players[socket.id];
      const currentDirection = player.direction;
      if (
        (newDirection === "left" &&
          currentDirection !== "right" &&
          player.lastMoveDirection !== "right") ||
        (newDirection === "right" &&
          currentDirection !== "left" &&
          player.lastMoveDirection !== "left") ||
        (newDirection === "up" &&
          currentDirection !== "down" &&
          player.lastMoveDirection !== "down") ||
        (newDirection === "down" &&
          currentDirection !== "up" &&
          player.lastMoveDirection !== "up")
      ) {
        gameState.players[socket.id].direction = newDirection;
      }
    } catch {
      console.log("plz press start game");
    }
  });

  socket.on("setSpeed", () => {
    const player = gameState.players[socket.id];
    if (!player.cooldown) {
      player.accelerated = true;
      player.interval = ACCELERATED_INTERVAL;

      setTimeout(() => {
        player.accelerated = false;
        player.interval = DEFAULT_INTERVAL;
        player.cooldown = true;

        setTimeout(() => {
          player.cooldown = false;
        }, COOLDOWN_DURATION);
      }, ACCELERATE_DURATION);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Player disconnected:", socket.id);
    const player = gameState.players[socket.id];
    if (player) {
      try {
        await createRecord({
          user_name: player.name,
          skin: player.color,
          score: player.score,
        });
        delete gameState.players[socket.id];
      } catch (error) {
        console.log("failed to create record:", error);
      }
    }
  });
}

async function handlePlayerDeath(playerId) {
  const player = gameState.players[playerId];
  if (player) {
    try {
      await createRecord({
        user_name: player.name,
        skin: player.color,
        score: player.score,
      });
      delete gameState.players[playerId];
    } catch (error) {
      console.log("failed to create record:", error);
    }
  }
}

function gameLoop(io) {
  const playersToRemove = [];
  const headCollisions = [];
  for (let playerId in gameState.players) {
    let player = gameState.players[playerId];

    const now = Date.now();
    if (!player.lastMove || now - player.lastMove >= player.interval) {
      const alive = movePlayer(player, gameState);
      player.lastMove = now;

      if (!alive) {
        playersToRemove.push(playerId);
        io.to(playerId).emit("death");
      } else {
        gameState.fruits.forEach((fruit, index) => {
          if (checkCollision(player, fruit)) {
            player.grow = true;
            player.score += 10;
            gameState.fruits.splice(index, 1);
            gameState.fruits.push(generateFruit());
          }
        });

        gameState.badFruits.forEach((badFruit, index) => {
          if (checkCollision(player, badFruit)) {
            if (player.snake.length > 1) {
              player.snake.pop();
              player.score -= 10;
            }
            gameState.badFruits.splice(index, 1);
            gameState.badFruits.push(generateFruit());
          }
        });

        gameState.rainbowFruits.forEach((rainbowFruit, index) => {
          if (checkCollision(player, rainbowFruit)) {
            player.grow = true;
            player.score += 50;

            for (let i = 0; i < 5; i++) {
              player.snake.push({ ...player.snake[player.snake.length - 1] });
            }
            gameState.rainbowFruits.splice(index, 1);
          }
        });

        gameState.trapFruits.forEach((trapFruits) => {
          if (checkCollision(player, trapFruits)) {
            playersToRemove.push(playerId);
            io.to(playerId).emit("death");
          }
        });
      }
    }
  }
  // Check head collisions after all moves
  for (let playerId in gameState.players) {
    let player = gameState.players[playerId];
    if (checkHeadCollision(player, gameState)) {
      headCollisions.push(playerId);
    }
  }

  headCollisions.forEach((playerId) => {
    playersToRemove.push(playerId);
    io.to(playerId).emit("death");
  });

  setTimeout(() => {
    playersToRemove.forEach((playerId) => {
      handlePlayerDeath(playerId);
    });
  }, 1000);

  io.sockets.emit("gameState", gameState);
}

module.exports = {
  onConnection,
  gameLoop,
};
