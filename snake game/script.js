        // Core game settings
        const GRID_SIZE = 20;
        const BASE_SPEED = 140; // ms per step at score 0
        const MIN_SPEED = 65;   // top speed cap
        const SPEED_STEP = 4;   // speed increase per score point
        const STORAGE_KEY = "cyberpunkSnakeHighScore";

        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const scoreEl = document.getElementById("score");
        const highScoreEl = document.getElementById("highScore");
        const startOverlay = document.getElementById("startOverlay");
        const gameOverOverlay = document.getElementById("gameOverOverlay");
        const shell = document.querySelector(".game-shell");

        const startBtn = document.getElementById("startBtn");
        const startBtnBottom = document.getElementById("startBtnBottom");
        const restartBtn = document.getElementById("restartBtn");
        const restartBtnBottom = document.getElementById("restartBtnBottom");
        const dpadButtons = document.querySelectorAll(".dpad-btn");

        const cellSize = canvas.width / GRID_SIZE;

        let snake = [];
        let direction = { x: 1, y: 0 };
        let queuedDirection = { x: 1, y: 0 };
        let food = { x: 10, y: 10 };
        let score = 0;
        let highScore = Number(localStorage.getItem(STORAGE_KEY)) || 0;
        let gameRunning = false;
        let gameLoopId = null;

        highScoreEl.textContent = String(highScore);

        function resetState() {
            snake = [
                { x: 8, y: 10 },
                { x: 7, y: 10 },
                { x: 6, y: 10 }
            ];
            direction = { x: 1, y: 0 };
            queuedDirection = { x: 1, y: 0 };
            score = 0;
            scoreEl.textContent = "0";
            placeFood();
            draw();
        }

        // Places food on any free cell not occupied by snake
        function placeFood() {
            let newFood;
            do {
                newFood = {
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE)
                };
            } while (snake.some((part) => part.x === newFood.x && part.y === newFood.y));
            food = newFood;
        }

        function drawGridGlow() {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(0, 240, 255, 0.4)";
            ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        function drawFood() {
            const x = food.x * cellSize;
            const y = food.y * cellSize;
            ctx.save();
            ctx.fillStyle = "#ff2d55";
            ctx.shadowColor = "rgba(255, 45, 85, 0.95)";
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.33, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function drawSnake() {
            snake.forEach((part, idx) => {
                const x = part.x * cellSize;
                const y = part.y * cellSize;
                const isHead = idx === 0;
                ctx.save();
                ctx.fillStyle = isHead ? "#78ff57" : "#39ff14";
                ctx.shadowColor = "rgba(57, 255, 20, 0.95)";
                ctx.shadowBlur = isHead ? 20 : 12;
                ctx.fillRect(x + 1.2, y + 1.2, cellSize - 2.4, cellSize - 2.4);
                ctx.restore();
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGridGlow();
            drawFood();
            drawSnake();
        }

        function currentSpeed() {
            return Math.max(MIN_SPEED, BASE_SPEED - score * SPEED_STEP);
        }

        function update() {
            direction = queuedDirection;
            const head = snake[0];
            const nextHead = { x: head.x + direction.x, y: head.y + direction.y };

            const hitWall =
                nextHead.x < 0 ||
                nextHead.y < 0 ||
                nextHead.x >= GRID_SIZE ||
                nextHead.y >= GRID_SIZE;

            const hitSelf = snake.some((part) => part.x === nextHead.x && part.y === nextHead.y);

            if (hitWall || hitSelf) {
                gameOver();
                return;
            }

            snake.unshift(nextHead);

            if (nextHead.x === food.x && nextHead.y === food.y) {
                score += 1;
                scoreEl.textContent = String(score);
                if (score > highScore) {
                    highScore = score;
                    highScoreEl.textContent = String(highScore);
                    localStorage.setItem(STORAGE_KEY, String(highScore));
                }
                placeFood();
            } else {
                snake.pop();
            }

            draw();
            if (gameRunning) {
                gameLoopId = setTimeout(update, currentSpeed());
            }
        }

        function startGame() {
            if (gameRunning) return;
            resetState();
            gameRunning = true;
            startOverlay.classList.add("hidden");
            gameOverOverlay.classList.add("hidden");
            clearTimeout(gameLoopId);
            gameLoopId = setTimeout(update, currentSpeed());
        }

        function gameOver() {
            gameRunning = false;
            clearTimeout(gameLoopId);
            gameOverOverlay.classList.remove("hidden");
            shell.classList.remove("shake");
            // Force reflow so animation can re-trigger on repeated game overs
            void shell.offsetWidth;
            shell.classList.add("shake");
        }

        function restartGame() {
            gameOverOverlay.classList.add("hidden");
            startOverlay.classList.add("hidden");
            gameRunning = false;
            clearTimeout(gameLoopId);
            startGame();
        }

        function setDirection(dir) {
            if (!gameRunning) return;

            // Prevent instant 180 degree turns that would self-collide
            if (dir === "up" && direction.y !== 1) queuedDirection = { x: 0, y: -1 };
            if (dir === "down" && direction.y !== -1) queuedDirection = { x: 0, y: 1 };
            if (dir === "left" && direction.x !== 1) queuedDirection = { x: -1, y: 0 };
            if (dir === "right" && direction.x !== -1) queuedDirection = { x: 1, y: 0 };
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "ArrowUp") setDirection("up");
            if (event.key === "ArrowDown") setDirection("down");
            if (event.key === "ArrowLeft") setDirection("left");
            if (event.key === "ArrowRight") setDirection("right");
        });

        dpadButtons.forEach((button) => {
            button.addEventListener("click", () => {
                setDirection(button.dataset.dir);
            });
        });

        startBtn.addEventListener("click", startGame);
        startBtnBottom.addEventListener("click", startGame);
        restartBtn.addEventListener("click", restartGame);
        restartBtnBottom.addEventListener("click", restartGame);

        // Initial render
        resetState();