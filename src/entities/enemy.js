import * as THREE from '../core/three.js';
import { scene } from '../core/setup.js';
import materials from '../core/materials.js';
import { checkCollision } from '../core/collisions.js';
import { createExplosion } from '../systems/particles.js';
import { updateHealthBar, updateScore } from '../systems/ui.js';
import gameState from '../state/gameState.js';

class Enemy {
  constructor(x, z) {
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, z);
    this.buildMesh();
    scene.add(this.mesh);

    this.x = x;
    this.z = z;
    this.speed = 1.5 + Math.random();
    this.health = 50;
    this.maxHealth = 50;
    this.damage = 10;
    this.attackCooldown = 0;
    this.isDead = false;
  }

  buildMesh() {
    const bodyGeo = new THREE.CylinderGeometry(12, 10, 45, 8);
    const body = new THREE.Mesh(bodyGeo, materials.enemyBody);
    body.position.y = 22.5;
    body.castShadow = true;
    this.mesh.add(body);

    const headGeo = new THREE.BoxGeometry(14, 14, 14);
    const head = new THREE.Mesh(headGeo, materials.metal);
    head.position.y = 50;
    head.castShadow = true;
    this.mesh.add(head);

    const eyeGeo = new THREE.BoxGeometry(4, 2, 2);
    const leftEye = new THREE.Mesh(eyeGeo, materials.redEye);
    leftEye.position.set(-3, 50, 8);
    this.mesh.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, materials.redEye);
    rightEye.position.set(3, 50, 8);
    this.mesh.add(rightEye);

    const symbolGeo = new THREE.PlaneGeometry(10, 10);
    const symbol = new THREE.Mesh(symbolGeo, materials.footSymbol);
    symbol.position.set(0, 30, 10);
    symbol.rotation.z = Math.PI;
    this.mesh.add(symbol);

    const armGeo = new THREE.BoxGeometry(6, 30, 6);
    const leftArm = new THREE.Mesh(armGeo, materials.enemyBody);
    leftArm.position.set(-16, 30, 0);
    this.mesh.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, materials.enemyBody);
    rightArm.position.set(16, 30, 0);
    this.mesh.add(rightArm);
  }

  update(player) {
    if (this.isDead) return;

    const dx = player.x - this.x;
    const dz = player.z - this.z;
    const distance = Math.hypot(dx, dz);

    this.mesh.rotation.y = Math.atan2(dx, dz);

    if (distance > 35) {
      const moveX = (dx / distance) * this.speed;
      const moveZ = (dz / distance) * this.speed;

      if (!checkCollision(this.x + moveX, this.z)) this.x += moveX;
      if (!checkCollision(this.x, this.z + moveZ)) this.z += moveZ;

      this.mesh.position.x = this.x;
      this.mesh.position.z = this.z;
      this.mesh.rotation.z = Math.sin(Date.now() * 0.01) * 0.05;
    }

    if (distance < 45 && this.attackCooldown <= 0) {
      player.health -= this.damage;
      this.attackCooldown = 60;
      updateHealthBar(player.health, player.maxHealth);

      this.mesh.position.add(new THREE.Vector3((dx / distance) * 5, 0, (dz / distance) * 5));

      if (player.health <= 0) {
        player.health = 0;
      }
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
  }

  takeDamage(amount) {
    this.health -= amount;

    this.mesh.children.forEach(child => {
      if (child.material && child.material.emissive) child.material.emissive.setHex(0xff0000);
    });
    setTimeout(() => {
      this.mesh.children.forEach(child => {
        if (child.material && child.material.emissive) child.material.emissive.setHex(0x000000);
      });
    }, 100);

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    scene.remove(this.mesh);
    gameState.score += 100;
    updateScore(gameState.score);
    createExplosion(this.x, 25, this.z, 0xff0000, 15);
  }
}

export { Enemy };

