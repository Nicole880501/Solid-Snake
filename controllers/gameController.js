const {
  gameState,
  generateFruit,
  movePlayer,
  checkCollision,
} = require("../models/game");

const INITIAL_SNAKE_LENGTH = 4;
const DEFAULT_INTERVAL = 100;
const ACCELERATED_INTERVAL = 50;
const ACCELERATE_DURATION = 3000;
const COOLDOWN_DURATION = 20000;

function onConnection(socket) {
  console.log("New player connected:", socket.id);

  // Initialize the snake with a length of 4
  const initialX = Math.floor(Math.random() * 20);
  const initialY = Math.floor(Math.random() * 20);
  const initialSnake = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    initialSnake.push({ x: initialX, y: initialY });
  }

  gameState.players[socket.id] = {
    id: socket.id,
    x: initialX,
    y: initialY,
    direction: "right",
    lastMoveDirection: "right",
    snake: initialSnake,
    grow: false,
    invincible: true, // Set player as invincible initially
    interval: DEFAULT_INTERVAL,
    accelerated: false,
    cooldown: false,
  };

  if (gameState.fruits.length === 0) {
    gameState.fruits.push(generateFruit());
  }

  // Remove invincibility after 3 seconds
  setTimeout(() => {
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].invincible = false;
    }
  }, 3000);

  socket.on("changeDirection", (newDirection) => {
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

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete gameState.players[socket.id];
  });
}

function gameLoop(io) {
  const playersToRemove = [];
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
            gameState.fruits.splice(index, 1);
            gameState.fruits.push(generateFruit());
          }
        });
      }
    }
  }

  setTimeout(() => {
    playersToRemove.forEach((playerId) => {
      delete gameState.players[playerId];
    });
  }, 1000);

  io.sockets.emit("gameState", gameState);
}

module.exports = {
  onConnection,
  gameLoop,
};
