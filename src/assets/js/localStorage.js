export function saveProgress(grid, currentPiece, interval, score) {
    const savedData = {
        grid,
        currentPiece,
        interval,
        score
    };
    localStorage.setItem('tetrisProgress', JSON.stringify(savedData));
}

export function loadProgress() {
    const savedData = localStorage.getItem('tetrisProgress');
    return savedData ? JSON.parse(savedData) : null;
}
