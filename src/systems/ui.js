const scoreEl = document.getElementById('score');
const healthBarEl = document.getElementById('health-bar');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');

function updateScore(score) {
  scoreEl.textContent = `Score: ${score}`;
}

function updateHealthBar(current, max) {
  const percent = Math.max(0, (current / max) * 100);
  healthBarEl.style.width = `${percent}%`;
}

function showGameOver(score) {
  finalScoreEl.textContent = score;
  gameOverEl.classList.remove('hidden');
}

function hideGameOver() {
  gameOverEl.classList.add('hidden');
}

export { updateScore, updateHealthBar, showGameOver, hideGameOver };

