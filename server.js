const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;
const WIDTH = 40;
const HEIGHT = 30;
const INITIAL_SNAKE_LENGTH = 4;
const gameState = {
  players: {},
  fruits: [],
};

function generateFruit() {
  return {
    x: Math.floor(Math.random() * WIDTH),
    y: Math.floor(Math.random() * HEIGHT),
  };
}

function checkCollision(player, fruit) {
  return player.x === fruit.x && player.y === fruit.y;
}

function checkSelfCollision(player) {
  const head = player.snake[0];
  for (let i = 1; i < player.snake.length; i++) {
    if (head.x === player.snake[i].x && head.y === player.snake[i].y) {
      return true;
    }
  }
  return false;
}

function checkOtherPlayersCollision(player, gameState) {
  const head = player.snake[0];
  for (let playerId in gameState.players) {
    if (playerId !== player.id) {
      const otherPlayer = gameState.players[playerId];
      for (let segment of otherPlayer.snake) {
        if (head.x === segment.x && head.y === segment.y) {
          return true;
        }
      }
    }
  }
  return false;
}

function checkHeadCollision(player, gameState) {
  const head = player.snake[0];
  for (let playerId in gameState.players) {
    if (playerId !== player.id) {
      const otherPlayer = gameState.players[playerId];
      const otherHead = otherPlayer.snake[0];
      if (head.x === otherHead.x && head.y === otherHead.y) {
        return true;
      }
    }
  }
  return false;
}

function movePlayer(player, gameState) {
  let newHead = { x: player.x, y: player.y };
  switch (player.direction) {
    case "up":
      newHead.y -= 1;
      break;
    case "down":
      newHead.y += 1;
      break;
    case "left":
      newHead.x -= 1;
      break;
    case "right":
      newHead.x += 1;
      break;
  }

  // Wrap around logic
  if (newHead.x < 0) {
    newHead.x = WIDTH - 1;
  } else if (newHead.x >= WIDTH) {
    newHead.x = 0;
  }
  if (newHead.y < 0) {
    newHead.y = HEIGHT - 1;
  } else if (newHead.y >= HEIGHT) {
    newHead.y = 0;
  }

  player.snake.unshift(newHead);
  player.x = newHead.x;
  player.y = newHead.y;
  player.lastMoveDirection = player.direction;
  if (player.grow) {
    player.grow = false;
  } else {
    player.snake.pop();
  }

  // Check collisions
  if (
    checkSelfCollision(player) ||
    checkOtherPlayersCollision(player, gameState) ||
    checkHeadCollision(player, gameState)
  ) {
    return false; // Player is dead
  }

  return true; // Player is alive
}

io.on("connection", (socket) => {
  console.log("New player connected:", socket.id);

  // Initialize the snake with a length of 4
  const initialX = Math.floor(Math.random() * WIDTH);
  const initialY = Math.floor(Math.random() * HEIGHT);
  const initialSnake = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    initialSnake.push({ x: initialX, y: initialY });
  }

  gameState.players[socket.id] = {
    id: socket.id,
    x: initialX,
    y: initialY,
    direction: "right",
    lastMoveDirection: "right", // Track the last move direction
    snake: initialSnake,
    grow: false,
  };

  if (gameState.fruits.length === 0) {
    gameState.fruits.push(generateFruit());
  }

  socket.on("changeDirection", (newDirection) => {
    const player = gameState.players[socket.id];
    const currentDirection = player.direction;

    // Prevent the snake from reversing direction
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
});

setInterval(() => {
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

  // Remove dead players
  playersToRemove.forEach((playerId) => {
    delete gameState.players[playerId];
  });

  io.sockets.emit("gameState", gameState);
}, 100);

app.use(express.static("public"));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
