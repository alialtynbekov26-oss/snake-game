const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const gameOverScreen = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");

const grid = 20;
let snake = [{ x: 320, y: 320 }];
let dx = grid;
let dy = 0;
let food = {};
let score = 0;
let highscore = localStorage.getItem("skySnakeHS") || 0;
let gameInterval;
let isPaused = false;
let speed = 110;

highscoreEl.textContent = highscore;

function randomFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / grid)) * grid,
    y: Math.floor(Math.random() * (canvas.height / grid)) * grid
  };
}

function drawBackground() {
  ctx.fillStyle = "#81d4fa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Булуттар
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath(); ctx.ellipse(180, 140, 70, 40, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(250, 110, 55, 35, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(420, 160, 80, 38, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(520, 90, 45, 30, 0, 0, Math.PI*2); ctx.fill();
}

function drawSnake() {
  snake.forEach((part, i) => {
    ctx.fillStyle = i === 0 ? "#2e7d32" : "#66bb6a";
    ctx.fillRect(part.x, part.y, grid, grid);
    ctx.strokeStyle = "#1b5e20";
    ctx.lineWidth = 2;
    ctx.strokeRect(part.x, part.y, grid, grid);
  });
}

function drawFood() {
  ctx.fillStyle = "#f50057";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#f50057";
  ctx.beginPath();
  ctx.arc(food.x + grid/2, food.y + grid/2, grid/2 - 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0) head.x = canvas.width - grid;
  if (head.x >= canvas.width) head.x = 0;
  if (head.y < 0) head.y = canvas.height - grid;
  if (head.y >= canvas.height) head.y = 0;

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    randomFood();
    if (speed > 60) speed -= 4;
  } else {
    snake.pop();
  }
}

function checkCollision() {
  const head = snake[0];
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return true;
  }
  return false;
}

function gameLoop() {
  if (isPaused) return;

  if (checkCollision()) {
    clearInterval(gameInterval);
    finalScoreEl.textContent = score;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("skySnakeHS", highscore);
      highscoreEl.textContent = highscore;
    }
    gameOverScreen.style.display = "flex";
    return;
  }

  drawBackground();
  moveSnake();
  drawSnake();
  drawFood();
}

// Баскычтар
document.getElementById("startBtn").onclick = () => {
  if (!gameInterval) {
    randomFood();
    gameInterval = setInterval(gameLoop, speed);
  }
};

document.getElementById("pauseBtn").onclick = () => {
  isPaused = !isPaused;
};

document.getElementById("restartBtn").onclick = () => location.reload();
document.getElementById("playAgain").onclick = () => location.reload();

// Клавиатура
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && dy !== grid) { dx = 0; dy = -grid; }
  if (e.key === "ArrowDown" && dy !== -grid) { dx = 0; dy = grid; }
  if (e.key === "ArrowLeft" && dx !== grid) { dx = -grid; dy = 0; }
  if (e.key === "ArrowRight" && dx !== -grid) { dx = grid; dy = 0; }
});

drawBackground();
drawSnake();
