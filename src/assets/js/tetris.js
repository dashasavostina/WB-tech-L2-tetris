import { saveProgress, loadProgress } from './localStorage.js';


document.addEventListener('DOMContentLoaded', () => {
    let grid = createGrid();
    let currentPiece;
    let interval;
    let score = 0;

    function createGrid() {
        return Array.from({ length: 20 }, () => Array(10).fill(0));
    }

    function getRandomPiece() {
        const pieces = [
            [[1, 1, 1, 1]],
            [[1, 1, 1], [1]],
            [[1, 1, 1], [0, 0, 1]],
            [[1, 1, 1], [1, 0]],
            [[1, 1], [1, 1]],
            [[1, 1, 1], [0, 1]]
        ];

        const piece = pieces[Math.floor(Math.random() * pieces.length)];
        const color = Math.floor(Math.random() * 6) + 1;

        return { piece, color, row: 0, col: 4 };
    }

    function draw() {
        const container = document.getElementById('tetris-container');
        container.innerHTML = ''; // Очищаем контейнер

        // Отобразим текущую фигуру только если она определена
        if (currentPiece) {
            drawPiece(currentPiece, container);
        }

        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                if (grid[row][col] !== 0) {
                    drawBlock(row, col, grid[row][col], container);
                }
            }
        }

        document.getElementById('score').innerText = `Score: ${score}`;
    }

    function drawPiece(piece, container) {
        for (let i = 0; i < piece.piece.length; i++) {
            for (let j = 0; j < piece.piece[i].length; j++) {
                if (piece.piece[i][j]) {
                    drawBlock(piece.row + i, piece.col + j, piece.color, container);
                }
            }
        }
    }

    function drawBlock(row, col, color, container) {
        const block = document.createElement('div');
        block.classList.add('block', `color-${color}`);
        container.appendChild(block);
        block.style.top = `${row * 30}px`;
        block.style.left = `${col * 30}px`;
    }

    function moveDown() {
        if (currentPiece) {
            currentPiece.row++;

            if (collision()) {
                currentPiece.row--;
                merge();
                clearLines();
                currentPiece = getRandomPiece();

                if (collision()) {
                    clearInterval(interval);
                    alert('Game Over! Your score: ' + score);
                    resetGame();
                }
            }
        }
    }

    function moveLeft() {
        if (currentPiece) {
            currentPiece.col--;
            if (collision()) {
                currentPiece.col++;
            }
        }
    }

    function moveRight() {
        if (currentPiece) {
            currentPiece.col++;
            if (collision()) {
                currentPiece.col--;
            }
        }
    }

    function rotate() {
        if (currentPiece) {
            const originalPiece = currentPiece.piece;
            currentPiece.piece = currentPiece.piece[0].map((_, i) => currentPiece.piece.map(row => row[i])).reverse();

            if (collision()) {
                currentPiece.piece = originalPiece;
            }
        }
    }

    function collision() {
        if (!currentPiece) {
            return false;
        }

        for (let i = 0; i < currentPiece.piece.length; i++) {
            for (let j = 0; j < currentPiece.piece[i].length; j++) {
                if (
                    currentPiece.piece[i][j] &&
                    (grid[currentPiece.row + i] === undefined ||
                        grid[currentPiece.row + i][currentPiece.col + j] !== 0)
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function merge() {
        if (currentPiece) {
            for (let i = 0; i < currentPiece.piece.length; i++) {
                for (let j = 0; j < currentPiece.piece[i].length; j++) {
                    if (currentPiece.piece[i][j]) {
                        grid[currentPiece.row + i][currentPiece.col + j] = currentPiece.color;
                    }
                }
            }
        }
    }

    function clearLines() {
        for (let row = 0; row < 20; row++) {
            if (grid[row].every(cell => cell !== 0)) {
                grid.splice(row, 1);
                grid.unshift(new Array(10).fill(0));
                score += 100;
            }
        }
    }

    function resetGame() {
        grid.forEach(row => row.fill(0));
        score = 0;
        startGame();
    }

    function startGame() {
        currentPiece = getRandomPiece();
        interval = setInterval(() => {
            moveDown();
            draw();
        }, 1000);
    }

    function pauseGame() {
        clearInterval(interval);
    }

    function resumeGame() {
        interval = setInterval(() => {
            moveDown();
            draw();
        }, 1000);
    }

    // Кнопки сохранения и загрузки
    const saveButton = document.getElementById('save-button');
    const loadButton = document.getElementById('load-button');

    saveButton.addEventListener('click', () => {
        saveProgress(grid, currentPiece, interval, score);
        alert('Игра сохранена!');
    });

    loadButton.addEventListener('click', () => {
        let loadedData = loadProgress();
        if (loadedData) {
            grid = loadedData.grid;
            currentPiece = loadedData.currentPiece;
            interval = loadedData.interval;
            score = loadedData.score;
            alert('Игра загружена!');
        } else {
            alert('Сохраненной игры не найдено.');
        }
        draw();
    });

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                rotate();
                break;
            case ' ':
                pauseGame();
                break;
            case 'Enter':
                resumeGame();
                break;
                case 's':
                    saveProgress(grid, currentPiece, interval, score);
                    alert('Игра сохранена!');
                    break;
                case 'l':
                    const loadedData = loadProgress();
                    if (loadedData) {
                        grid = loadedData.grid;
                        currentPiece = loadedData.currentPiece;
                        interval = loadedData.interval;
                        score = loadedData.score;
                        alert('Игра загружена!');
                    } else {
                        alert('Сохраненной игры не найдено.');
                    }
                break;
                case 'Escape': 
            clearInterval(interval);
            alert('Игра завершена. Ваш счет: ' + score);
            resetGame();
            break;
        }
        draw();
    });

    draw();
    startGame();
});
