import * as THREE from '../core/three.js';
import { scene } from '../core/setup.js';

class Particle {
  constructor(x, y, z, color) {
    const geo = new THREE.BoxGeometry(4, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(x, y, z);
    scene.add(this.mesh);

    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10 + 5;
    this.vz = (Math.random() - 0.5) * 10;
    this.life = 40;
  }

  update() {
    this.mesh.position.x += this.vx;
    this.mesh.position.y += this.vy;
    this.mesh.position.z += this.vz;
    this.vy -= 0.5;

    this.mesh.rotation.x += 0.1;
    this.mesh.rotation.y += 0.1;

    if (this.mesh.position.y < 0) {
      this.mesh.position.y = 0;
      this.vy *= -0.5;
    }

    this.life--;
    if (this.life <= 0) {
      scene.remove(this.mesh);
      return false;
    }
    return true;
  }
}

const effectParticles = [];
const steamEmitters = [];

function createSlashEffect(x, y, z, rotation) {
  const geo = new THREE.RingGeometry(30, 35, 32, 1, 0, Math.PI);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = rotation - Math.PI / 2;
  scene.add(mesh);

  let frames = 5;
  const animate = () => {
    if (frames <= 0) {
      scene.remove(mesh);
      return;
    }
    mesh.material.opacity -= 0.2;
    frames--;
    requestAnimationFrame(animate);
  };
  animate();
}

function createExplosion(x, y, z, color, count) {
  for (let i = 0; i < count; i++) {
    effectParticles.push(new Particle(x, y, z, color));
  }
}

function registerSteamEmitter(mesh, speed, offset, baseY) {
  steamEmitters.push({ mesh, speed, offset, baseY });
}

function updateParticles() {
  for (let i = effectParticles.length - 1; i >= 0; i--) {
    const alive = effectParticles[i].update();
    if (!alive) {
      effectParticles.splice(i, 1);
    }
  }
}

function updateSteamEmitters() {
  steamEmitters.forEach(emitter => {
    emitter.mesh.position.y += emitter.speed;
    emitter.mesh.rotation.y += 0.01;
    emitter.mesh.scale.setScalar(1 + Math.sin(Date.now() * 0.001 + emitter.offset) * 0.5);
    if (emitter.mesh.position.y > 30) {
      emitter.mesh.position.y = emitter.baseY;
    }
  });
}

export {
  Particle,
  createExplosion,
  createSlashEffect,
  registerSteamEmitter,
  updateParticles,
  updateSteamEmitters
};

