const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;
const WIDTH = 40;
const HEIGHT = 30;
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

function movePlayer(player) {
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
  if (player.grow) {
    player.grow = false;
  } else {
    player.snake.pop();
  }
}

io.on("connection", (socket) => {
  console.log("New player connected:", socket.id);

  gameState.players[socket.id] = {
    x: Math.floor(Math.random() * WIDTH),
    y: Math.floor(Math.random() * HEIGHT),
    direction: "right",
    snake: [
      {
        x: Math.floor(Math.random() * WIDTH),
        y: Math.floor(Math.random() * HEIGHT),
      },
    ],
    grow: false,
  };

  if (gameState.fruits.length === 0) {
    gameState.fruits.push(generateFruit());
  }

  socket.on("changeDirection", (direction) => {
    gameState.players[socket.id].direction = direction;
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete gameState.players[socket.id];
  });
});

setInterval(() => {
  for (let playerId in gameState.players) {
    let player = gameState.players[playerId];
    movePlayer(player);

    gameState.fruits.forEach((fruit, index) => {
      if (checkCollision(player, fruit)) {
        player.grow = true;
        gameState.fruits.splice(index, 1);
        gameState.fruits.push(generateFruit());
      }
    });
  }
  io.sockets.emit("gameState", gameState);
}, 100);

app.use(express.static("public"));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
