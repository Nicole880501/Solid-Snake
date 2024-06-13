const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;

let gameState = {};
let boostAvailable = true;

socket.on("gameState", (state) => {
  gameState = state;
  draw();
});

socket.on("death", () => {
  alert("You have died!");
  socket.disconnect();
});

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      socket.emit("changeDirection", "up");
      break;
    case "ArrowDown":
      socket.emit("changeDirection", "down");
      break;
    case "ArrowLeft":
      socket.emit("changeDirection", "left");
      break;
    case "ArrowRight":
      socket.emit("changeDirection", "right");
      break;
    case " ":
      socket.emit("setSpeed", true);
      break;
  }
});

function drawPlayer() {
  for (let playerId in gameState.players) {
    let player = gameState.players[playerId];
    ctx.fillStyle = "white";
    player.snake.forEach((segment) => {
      ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
    });
  }
}

function drawFruits() {
  gameState.fruits.forEach((fruit) => {
    ctx.fillStyle = "yellow";
    ctx.fillRect(fruit.x * scale, fruit.y * scale, scale, scale);
  });
}

function drawBadFruits() {
  gameState.badFruits.forEach((badFruit) => {
    ctx.fillStyle = "red";
    ctx.fillRect(badFruit.x * scale, badFruit.y * scale, scale, scale);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawFruits();
  drawBadFruits();
}
