import * as THREE from '../core/three.js';
import { scene, camera } from '../core/setup.js';
import materials from '../core/materials.js';
import { keys } from '../systems/input.js';
import { checkCollision } from '../core/collisions.js';
import { createSlashEffect } from '../systems/particles.js';
import { checkAttackHit } from '../systems/combat.js';

class Player {
  constructor() {
    this.mesh = new THREE.Group();
    this.buildBody();
    scene.add(this.mesh);

    this.x = 0;
    this.z = 0;
    this.speed = 4;
    this.health = 100;
    this.maxHealth = 100;
    this.attacking = false;
    this.attackCooldown = 0;
    this.attackRange = 70;
    this.targetRotation = 0;
  }

  buildBody() {
    const torsoGeo = new THREE.BoxGeometry(32, 40, 18);
    const torso = new THREE.Mesh(torsoGeo, materials.skin);
    torso.position.y = 50;
    torso.castShadow = true;
    this.mesh.add(torso);

    const plastronGeo = new THREE.BoxGeometry(26, 34, 2);
    const plastron = new THREE.Mesh(plastronGeo, materials.plastron);
    plastron.position.set(0, 50, 10);
    this.mesh.add(plastron);

    const shellGeo = new THREE.BoxGeometry(34, 44, 10);
    const shell = new THREE.Mesh(shellGeo, materials.shell);
    shell.position.set(0, 52, -10);
    shell.castShadow = true;
    this.mesh.add(shell);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 78, 0);

    const headGeo = new THREE.BoxGeometry(22, 24, 22);
    const head = new THREE.Mesh(headGeo, materials.skin);
    head.castShadow = true;
    headGroup.add(head);

    const maskGeo = new THREE.BoxGeometry(23, 6, 23);
    const mask = new THREE.Mesh(maskGeo, materials.mask);
    mask.position.y = 2;
    headGroup.add(mask);

    const eyeGeo = new THREE.BoxGeometry(6, 3, 2);
    const leftEye = new THREE.Mesh(eyeGeo, materials.eye);
    leftEye.position.set(-6, 2, 12);
    headGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, materials.eye);
    rightEye.position.set(6, 2, 12);
    headGroup.add(rightEye);

    const scarGeo = new THREE.BoxGeometry(2, 12, 1);
    const scar = new THREE.Mesh(scarGeo, materials.scar);
    scar.position.set(6, 4, 12.5);
    scar.rotation.z = 0.2;
    headGroup.add(scar);

    const tailGeo = new THREE.BoxGeometry(40, 6, 2);
    this.tail = new THREE.Mesh(tailGeo, materials.mask);
    this.tail.position.set(20, 2, -12);
    this.tail.rotation.y = -0.5;
    headGroup.add(this.tail);

    this.mesh.add(headGroup);

    const pauldronGroup = new THREE.Group();
    pauldronGroup.position.set(-20, 68, 0);

    const plate1 = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 24), materials.darkMetal);
    plate1.rotation.z = -0.2;
    plate1.position.y = 4;
    pauldronGroup.add(plate1);

    const plate2 = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 26), materials.darkMetal);
    plate2.rotation.z = -0.4;
    pauldronGroup.add(plate2);

    const ropeGeo = new THREE.BoxGeometry(17, 1, 27);
    const rope1 = new THREE.Mesh(ropeGeo, materials.mask);
    rope1.position.y = 2;
    rope1.rotation.z = -0.4;
    pauldronGroup.add(rope1);

    this.mesh.add(pauldronGroup);

    const strapGeo = new THREE.BoxGeometry(34, 4, 22);
    const strap = new THREE.Mesh(strapGeo, materials.leather);
    strap.position.set(0, 52, 0);
    strap.rotation.z = -0.6;
    strap.scale.z = 1.1;
    this.mesh.add(strap);

    const armGeo = new THREE.BoxGeometry(10, 24, 10);
    const leftArm = new THREE.Mesh(armGeo, materials.skin);
    leftArm.position.set(-22, 50, 0);
    leftArm.castShadow = true;
    this.mesh.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, materials.skin);
    rightArm.position.set(22, 50, 0);
    rightArm.castShadow = true;
    this.mesh.add(rightArm);

    const legGeo = new THREE.BoxGeometry(14, 30, 16);
    this.legs = new THREE.Group();
    this.mesh.add(this.legs);

    this.leftLeg = new THREE.Mesh(legGeo, materials.skin);
    this.leftLeg.position.set(-10, 15, 0);
    this.leftLeg.castShadow = true;
    this.legs.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, materials.skin);
    this.rightLeg.position.set(10, 15, 0);
    this.rightLeg.castShadow = true;
    this.legs.add(this.rightLeg);

    const handleGeo = new THREE.BoxGeometry(4, 4, 15);
    const handle = new THREE.Mesh(handleGeo, materials.darkMetal);
    handle.position.set(24, 40, 10);
    this.mesh.add(handle);

    const bladeGeo = new THREE.BoxGeometry(2, 70, 4);
    this.blade = new THREE.Mesh(bladeGeo, materials.blade);
    this.blade.position.set(24, 75, 10);
    this.blade.rotation.x = Math.PI / 4;
    this.blade.castShadow = true;
    this.mesh.add(this.blade);
  }

  update(enemies, boss) {
    let dx = 0;
    let dz = 0;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (keys.w) { dx += forward.x; dz += forward.z; }
    if (keys.s) { dx -= forward.x; dz -= forward.z; }
    if (keys.a) { dx -= right.x; dz -= right.z; }
    if (keys.d) { dx += right.x; dz += right.z; }

    const isMoving = dx !== 0 || dz !== 0;

    if (isMoving) {
      const length = Math.sqrt(dx * dx + dz * dz);
      dx /= length;
      dz /= length;
      this.targetRotation = Math.atan2(dx, dz);

      const walkCycle = Math.sin(Date.now() * 0.015) * 0.6;
      this.leftLeg.position.z = walkCycle * 8;
      this.rightLeg.position.z = -walkCycle * 8;
    } else {
      this.leftLeg.position.z = 0;
      this.rightLeg.position.z = 0;
    }

    const nextX = this.x + dx * this.speed;
    const nextZ = this.z + dz * this.speed;

    if (!checkCollision(nextX, this.z)) this.x = nextX;
    if (!checkCollision(this.x, nextZ)) this.z = nextZ;

    this.x = Math.max(-1000, Math.min(1000, this.x));
    this.z = Math.max(-1000, Math.min(1000, this.z));
    this.mesh.position.set(this.x, 0, this.z);

    if (isMoving) {
      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, this.targetRotation, 0.2);
    }

    this.tail.rotation.z = Math.sin(Date.now() * 0.01) * 0.5;

    if (keys.space && this.attackCooldown <= 0) {
      this.attack(enemies, boss);
    }

    if (this.attackCooldown > 0) this.attackCooldown--;

    if (this.attacking) {
      this.blade.rotation.x = Math.PI / 2;
      this.blade.position.y = 55;
      this.blade.position.z = 30;
      if (this.attackCooldown < 20) {
        this.attacking = false;
        this.blade.rotation.x = Math.PI / 4;
        this.blade.position.y = 75;
        this.blade.position.z = 10;
      }
    }
  }

  attack(enemies, boss) {
    this.attacking = true;
    this.attackCooldown = 30;

    createSlashEffect(this.x, 30, this.z, this.mesh.rotation.y);
    checkAttackHit(this, enemies, boss);
  }
}

export { Player };

