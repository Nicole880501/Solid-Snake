const {
  gameState,
  generateFruit,
  movePlayer,
  checkCollision,
} = require("../models/game");

const INITIAL_SNAKE_LENGTH = 4;

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
    invincible: true,
  };

  if (gameState.fruits.length === 0) {
    gameState.fruits.push(generateFruit());
  }

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

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete gameState.players[socket.id];
  });
}

function gameLoop(io) {
  const playersToRemove = [];
  for (let playerId in gameState.players) {
    let player = gameState.players[playerId];
    const alive = movePlayer(player, gameState);

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
