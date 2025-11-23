import * as THREE from '../core/three.js';
import { scene } from '../core/setup.js';
import materials from '../core/materials.js';
import { checkCollision } from '../core/collisions.js';
import { createExplosion } from '../systems/particles.js';
import { updateHealthBar, updateScore } from '../systems/ui.js';
import gameState from '../state/gameState.js';

class Boss {
  constructor(x, z) {
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, z);
    this.buildMesh();
    scene.add(this.mesh);

    this.x = x;
    this.z = z;
    this.speed = 1.2;
    this.health = 300;
    this.maxHealth = 300;
    this.damage = 25;
    this.attackCooldown = 0;
    this.dashCooldown = 0;
    this.isDead = false;
  }

  buildMesh() {
    const bodyGeo = new THREE.BoxGeometry(40, 60, 25);
    const body = new THREE.Mesh(bodyGeo, materials.darkMetal);
    body.position.y = 30;
    body.castShadow = true;
    this.mesh.add(body);

    const headGeo = new THREE.ConeGeometry(15, 30, 8);
    const head = new THREE.Mesh(headGeo, materials.chrome);
    head.position.y = 75;
    head.castShadow = true;
    this.mesh.add(head);

    const eyeGeo = new THREE.BoxGeometry(6, 4, 4);
    const eye = new THREE.Mesh(eyeGeo, materials.redGlow);
    eye.position.set(0, 72, 10);
    this.mesh.add(eye);

    const spikeGeo = new THREE.ConeGeometry(10, 40, 4);
    const leftSpike = new THREE.Mesh(spikeGeo, materials.chrome);
    leftSpike.position.set(-25, 55, 0);
    leftSpike.rotation.z = 0.5;
    this.mesh.add(leftSpike);

    const rightSpike = new THREE.Mesh(spikeGeo, materials.chrome);
    rightSpike.position.set(25, 55, 0);
    rightSpike.rotation.z = -0.5;
    this.mesh.add(rightSpike);

    const clawGeo = new THREE.BoxGeometry(5, 40, 5);
    const leftClaw = new THREE.Mesh(clawGeo, materials.chrome);
    leftClaw.position.set(-30, 30, 15);
    leftClaw.rotation.x = Math.PI / 2;
    this.mesh.add(leftClaw);
    const rightClaw = new THREE.Mesh(clawGeo, materials.chrome);
    rightClaw.position.set(30, 30, 15);
    rightClaw.rotation.x = Math.PI / 2;
    this.mesh.add(rightClaw);
  }

  update(player) {
    if (this.isDead) return;

    const dx = player.x - this.x;
    const dz = player.z - this.z;
    const distance = Math.hypot(dx, dz);

    this.mesh.rotation.y = Math.atan2(dx, dz);

    if (this.dashCooldown <= 0 && distance > 150) {
      const dashX = (dx / distance) * 10;
      const dashZ = (dz / distance) * 10;
      if (!checkCollision(this.x + dashX, this.z)) this.x += dashX;
      if (!checkCollision(this.x, this.z + dashZ)) this.z += dashZ;
      this.dashCooldown = 5;
    } else if (distance > 50) {
      const moveX = (dx / distance) * this.speed;
      const moveZ = (dz / distance) * this.speed;
      if (!checkCollision(this.x + moveX, this.z)) this.x += moveX;
      if (!checkCollision(this.x, this.z + moveZ)) this.z += moveZ;
    }

    this.mesh.position.x = this.x;
    this.mesh.position.z = this.z;

    if (distance < 60 && this.attackCooldown <= 0) {
      player.health -= this.damage;
      this.attackCooldown = 40;
      updateHealthBar(player.health, player.maxHealth);
      if (player.health <= 0) player.health = 0;
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.dashCooldown > 0) this.dashCooldown--;
  }

  takeDamage(amount) {
    this.health -= amount;
    this.mesh.children.forEach(child => {
      if (child.material) child.material.wireframe = true;
    });
    setTimeout(() => {
      this.mesh.children.forEach(child => {
        if (child.material) child.material.wireframe = false;
      });
    }, 50);

    if (this.health <= 0) {
      this.isDead = true;
      scene.remove(this.mesh);
      gameState.boss = null;
      gameState.score += 1000;
      updateScore(gameState.score);
      createExplosion(this.x, 40, this.z, 0xffaa00, 50);
    }
  }
}

export { Boss };

