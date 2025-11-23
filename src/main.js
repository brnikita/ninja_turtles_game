import './core/lighting.js';
import { scene, camera, renderer } from './core/setup.js';
import { createCity } from './environment/city.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { Boss } from './entities/boss.js';
import { initPointerLock, mouseState } from './systems/input.js';
import { updateParticles, updateSteamEmitters } from './systems/particles.js';
import { updateScore, updateHealthBar, showGameOver } from './systems/ui.js';
import { checkCollision } from './core/collisions.js';
import gameState from './state/gameState.js';

createCity();
initPointerLock(renderer);

const player = new Player();
gameState.player = player;
updateHealthBar(player.health, player.maxHealth);
updateScore(gameState.score);

document.getElementById('restart-btn').addEventListener('click', () => window.location.reload());

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x;
  let z;
  const dist = 800;

  let attempts = 0;
  do {
    switch (side) {
      case 0:
        x = (Math.random() - 0.5) * dist;
        z = -dist;
        break;
      case 1:
        x = dist;
        z = (Math.random() - 0.5) * dist;
        break;
      case 2:
        x = (Math.random() - 0.5) * dist;
        z = dist;
        break;
      default:
        x = -dist;
        z = (Math.random() - 0.5) * dist;
        break;
    }
    attempts++;
  } while (checkCollision(x, z) && attempts < 10);

  if (attempts < 10) {
    gameState.enemies.push(new Enemy(x, z));
  }
}

function spawnBoss() {
  if (gameState.boss) return;
  gameState.boss = new Boss(0, -500);
}

function handleSpawns() {
  gameState.enemySpawnTimer++;
  if (gameState.enemySpawnTimer >= gameState.enemySpawnInterval) {
    spawnEnemy();
    gameState.enemySpawnTimer = 0;
  }

  if (gameState.score >= gameState.bossSpawnScore && !gameState.boss) {
    spawnBoss();
    gameState.bossSpawnScore += 500;
  }
}

function updateCamera() {
  const camDistance = 400;
  const camHeight = 200;
  camera.position.x = player.x + Math.sin(mouseState.x) * camDistance;
  camera.position.y = camHeight + mouseState.y * 200;
  camera.position.z = player.z + Math.cos(mouseState.x) * camDistance;
  camera.lookAt(player.x, 50, player.z);
}

function checkGameOver() {
  if (gameState.gameOver || player.health > 0) return false;
  gameState.gameOver = true;
  showGameOver(gameState.score);
  return true;
}

function gameLoop() {
  if (gameState.gameOver) return;

  player.update(gameState.enemies, gameState.boss);
  handleSpawns();

  gameState.enemies = gameState.enemies.filter(enemy => {
    enemy.update(player);
    return !enemy.isDead;
  });

  if (gameState.boss && !gameState.boss.isDead) {
    gameState.boss.update(player);
  }

  updateParticles();
  updateSteamEmitters();
  updateCamera();

  if (checkGameOver()) return;

  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

