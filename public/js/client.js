const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scale = 20;

let gameState = {};
let boostAvailable = true;

document.getElementById("startButton").addEventListener("click", () => {
  const token = getCookie("access_token");
  const playerColor = document.getElementById("color").value;
  socket.emit("startGame", { token: token, color: playerColor });
});

socket.on("gameState", (state) => {
  gameState = state;
  draw();
});

socket.on("death", () => {
  if (confirm("You died ! try again ?") === true) {
    window.location.href = "/game";
  } else {
    socket.disconnect();
    window.location.href = "/leaderboard";
  }
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

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function drawPlayer() {
  for (let playerId in gameState.players) {
    let player = gameState.players[playerId];
    if (player.color === "rainbow") {
      drawRainbowSnake(player);
    } else {
      drawSnake(player);
    }
  }
}

function drawSnake(player) {
  ctx.fillStyle = player.color;
  ctx.strokeStyle = "white";
  player.snake.forEach((segment) => {
    ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
    ctx.strokeRect(segment.x * scale, segment.y * scale, scale, scale);
  });
}

function drawRainbowSnake(player) {
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
  ];
  player.snake.forEach((segment, index) => {
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
    ctx.strokeStyle = "white";
    ctx.strokeRect(segment.x * scale, segment.y * scale, scale, scale);
  });
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

function drawRainbowFruits() {
  gameState.rainbowFruits.forEach((fruit) => {
    const gradient = ctx.createLinearGradient(
      fruit.x * scale,
      fruit.y * scale,
      (fruit.x + 1) * scale,
      (fruit.y + 1) * scale
    );

    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.16, "orange");
    gradient.addColorStop(0.33, "yellow");
    gradient.addColorStop(0.5, "green");
    gradient.addColorStop(0.66, "blue");
    gradient.addColorStop(0.83, "indigo");
    gradient.addColorStop(1, "violet");

    ctx.fillStyle = gradient;
    ctx.fillRect(fruit.x * scale, fruit.y * scale, scale, scale);
  });
}

function drawTrapFruits() {
  gameState.trapFruits.forEach((trapFruits) => {
    ctx.fillStyle = "grey";
    ctx.fillRect(trapFruits.x * scale, trapFruits.y * scale, scale, scale);
  });
}

function drawLeaderboard() {
  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = `<h3>Leaderboard</h3>`;
  const players = Object.values(gameState.players);
  players.sort((a, b) => b.score - a.score);
  players.forEach((player) => {
    const playerElement = document.createElement("div");
    playerElement.textContent = `player ${player.name}: ${player.score}`;
    leaderboard.appendChild(playerElement);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawFruits();
  drawBadFruits();
  drawRainbowFruits();
  drawTrapFruits();
  drawLeaderboard();
}
