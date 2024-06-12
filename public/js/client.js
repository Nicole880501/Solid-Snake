const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;

let gameState = {};

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
  }
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let playerId in gameState.players) {
    let player = gameState.players[playerId];
    ctx.fillStyle = "white";
    player.snake.forEach((segment) => {
      ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
    });
  }

  gameState.fruits.forEach((fruit) => {
    ctx.fillStyle = "yellow";
    ctx.fillRect(fruit.x * scale, fruit.y * scale, scale, scale);
  });
}
