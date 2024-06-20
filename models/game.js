const WIDTH = 80;
const HEIGHT = 40;

const gameState = {
  players: {},
  fruits: [],
  badFruits: [],
  rainbowFruits: [],
  trapFruits: [],
};

function generateFruit() {
  return {
    x: Math.floor(Math.random() * WIDTH),
    y: Math.floor(Math.random() * HEIGHT),
  };
}

function generateRainbowFruit() {
  const fruit = {
    x: Math.floor(Math.random() * WIDTH),
    y: Math.floor(Math.random() * HEIGHT),
  };
  gameState.rainbowFruits.push(fruit);
  setTimeout(() => {
    const index = gameState.rainbowFruits.indexOf(fruit);
    if (index !== -1) {
      gameState.rainbowFruits.splice(index, 1);
    }
  }, 5000);

  setTimeout(generateRainbowFruit, Math.random() * 10000 + 5000);
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
          otherPlayer.kill += 1;
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
  player.totalMoves += 1;
  if (player.grow) {
    player.grow = false;
  } else {
    player.snake.pop();
  }

  // Check collisions only if not invincible
  if (
    !player.invincible &&
    (checkSelfCollision(player) ||
      checkOtherPlayersCollision(player, gameState))
  ) {
    return false; // Player is dead
  }

  return true; // Player is alive
}

module.exports = {
  gameState,
  generateFruit,
  generateRainbowFruit,
  movePlayer,
  checkCollision,
  checkHeadCollision,
};
