import { scene } from '../core/setup.js';
import * as THREE from '../core/three.js';
import materials from '../core/materials.js';
import { addObstacle } from '../core/collisions.js';
import { registerSteamEmitter } from '../systems/particles.js';

function createCity() {
  const blockSize = 500;
  const streetWidth = 250;
  const mapSize = 2;

  const groundGeo = new THREE.PlaneGeometry(4000, 4000);
  const ground = new THREE.Mesh(groundGeo, materials.asphalt);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const windowGeo = new THREE.PlaneGeometry(15, 25);
  const maxWindows = 3000;
  const windowsMesh = new THREE.InstancedMesh(windowGeo, materials.windowLight, maxWindows);
  const dummy = new THREE.Object3D();
  let windowCount = 0;

  for (let x = -mapSize; x <= mapSize; x++) {
    for (let z = -mapSize; z <= mapSize; z++) {
      const xPos = x * blockSize;
      const zPos = z * blockSize;

      if (Math.abs(x) < 1 && Math.abs(z) < 1) {
        createArenaDetails(xPos, zPos);
        continue;
      }

      const sidewalkSize = blockSize - streetWidth;
      const sidewalk = new THREE.Mesh(
        new THREE.BoxGeometry(sidewalkSize, 8, sidewalkSize),
        materials.sidewalk
      );
      sidewalk.position.set(xPos, 4, zPos);
      sidewalk.receiveShadow = true;
      scene.add(sidewalk);
      addObstacle(xPos, zPos, sidewalkSize, sidewalkSize);

      const width = sidewalkSize * 0.9;
      const depth = sidewalkSize * 0.9;
      const height = 300 + Math.random() * 600;

      const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        Math.random() > 0.5 ? materials.buildingBrick : materials.buildingGlass
      );
      building.position.set(xPos, height / 2, zPos);
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);

      if (windowCount < maxWindows - 100) {
        const rows = Math.floor(height / 50);
        const cols = Math.floor(width / 40);

        for (let r = 0; r < rows; r++) {
          if (Math.random() > 0.7) continue;
          for (let c = 0; c < cols; c++) {
            if (Math.random() > 0.5) continue;

            const side = Math.floor(Math.random() * 4);
            const yPos = 40 + r * 45;

            if (side === 0) { dummy.position.set(xPos, yPos, zPos + depth / 2 + 1); dummy.rotation.set(0, 0, 0); }
            else if (side === 1) { dummy.position.set(xPos, yPos, zPos - depth / 2 - 1); dummy.rotation.set(0, Math.PI, 0); }
            else if (side === 2) { dummy.position.set(xPos + width / 2 + 1, yPos, zPos); dummy.rotation.set(0, Math.PI / 2, 0); }
            else { dummy.position.set(xPos - width / 2 - 1, yPos, zPos); dummy.rotation.set(0, -Math.PI / 2, 0); }

            dummy.updateMatrix();
            windowsMesh.setMatrixAt(windowCount++, dummy.matrix);
          }
        }
      }
    }
  }

  windowsMesh.count = windowCount;
  scene.add(windowsMesh);

  createDecorations(blockSize, streetWidth, mapSize);
  createStatueOfLiberty(0, -2000);
}

function createDecorations(blockSize, streetWidth, mapSize) {
  for (let x = -mapSize; x <= mapSize; x++) {
    for (let z = -mapSize; z <= mapSize; z++) {
      if (Math.abs(x) < 1 && Math.abs(z) < 1) continue;

      const xPos = x * blockSize;
      const zPos = z * blockSize;
      const sidewalkOffset = (blockSize - streetWidth) / 2 + 10;

      const corners = [
        [xPos - sidewalkOffset, zPos - sidewalkOffset],
        [xPos + sidewalkOffset, zPos - sidewalkOffset],
        [xPos - sidewalkOffset, zPos + sidewalkOffset],
        [xPos + sidewalkOffset, zPos + sidewalkOffset]
      ];

      corners.forEach(([cx, cz]) => {
        createStreetLight(cx, cz);
        addObstacle(cx, cz, 5, 5);
        createTree(cx + (Math.random() - 0.5) * 30, cz + (Math.random() - 0.5) * 30);
        if (Math.random() > 0.7) {
          createManhole(cx + (Math.random() > 0.5 ? 40 : -40), cz + (Math.random() > 0.5 ? 40 : -40));
        }
      });

      if (Math.random() > 0.4) {
        const isVertical = Math.random() > 0.5;
        const carX = isVertical ? xPos + sidewalkOffset + 30 : xPos;
        const carZ = isVertical ? zPos : zPos + sidewalkOffset + 30;
        const rotation = isVertical ? 0 : Math.PI / 2;
        createCar(carX, carZ, rotation);
        addObstacle(carX, carZ, 30, 60);
      }
    }
  }

  createManhole(50, 50);
  createManhole(-80, -120);
}

function createTree(x, z) {
  const treeGroup = new THREE.Group();
  treeGroup.position.set(x, 0, z);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 7, 20, 6),
    materials.shell
  );
  trunk.position.y = 10;
  treeGroup.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.DodecahedronGeometry(25),
    materials.skin
  );
  leaves.position.y = 35;
  treeGroup.add(leaves);

  scene.add(treeGroup);
  addObstacle(x, z, 10, 10);
}

function createStreetLight(x, z) {
  const poleHeight = 80;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 3, poleHeight),
    materials.darkMetal
  );
  pole.position.set(x, poleHeight / 2, z);
  scene.add(pole);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(4),
    new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  );
  bulb.position.set(x, poleHeight, z);
  scene.add(bulb);
}

function createManhole(x, z) {
  const manhole = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 10, 1, 16),
    materials.manhole
  );
  manhole.position.set(x, 0.5, z);
  scene.add(manhole);
  createSteam(x, z);
}

function createSteam(x, z) {
  for (let i = 0; i < 3; i++) {
    const steam = new THREE.Mesh(
      new THREE.DodecahedronGeometry(4),
      new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.2 })
    );
    steam.position.set(x, 5 + i * 10, z);
    scene.add(steam);
    registerSteamEmitter(steam, 0.1 + Math.random() * 0.1, Math.random() * Math.PI, 5);
  }
}

function createArenaDetails(x, z) {
  const lineGeo = new THREE.PlaneGeometry(10, 80);
  for (let i = -3; i <= 3; i++) {
    const line = new THREE.Mesh(lineGeo, materials.roadMarking);
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 1, z + i * 150);
    scene.add(line);
  }

  const manholeGeo = new THREE.CylinderGeometry(12, 12, 1, 16);
  const manhole = new THREE.Mesh(manholeGeo, materials.manhole);
  manhole.position.set(x + 50, 0.5, z + 50);
  scene.add(manhole);

  const manhole2 = new THREE.Mesh(manholeGeo, materials.manhole);
  manhole2.position.set(x - 80, 0.5, z - 120);
  scene.add(manhole2);

  createSteam(x - 80, z - 120);
}

function createCar(x, z, rotation) {
  const carGroup = new THREE.Group();
  carGroup.position.set(x, 0, z);
  carGroup.rotation.y = rotation;

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(30, 12, 60), materials.carYellow);
  chassis.position.y = 10;
  carGroup.add(chassis);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(26, 10, 30), materials.buildingGlass);
  cabin.position.y = 20;
  carGroup.add(cabin);

  const wheelGeo = new THREE.CylinderGeometry(5, 5, 2, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const wheelPositions = [[-15, 5, 20], [15, 5, 20], [-15, 5, -20], [15, 5, -20]];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    carGroup.add(wheel);
  });

  const headlight = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 1), materials.headlight);
  headlight.position.set(-10, 12, 30);
  carGroup.add(headlight);
  const headlight2 = headlight.clone();
  headlight2.position.set(10, 12, 30);
  carGroup.add(headlight2);

  const taillight = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 1), materials.taillight);
  taillight.position.set(-10, 12, -30);
  carGroup.add(taillight);
  const taillight2 = taillight.clone();
  taillight2.position.set(10, 12, -30);
  carGroup.add(taillight2);

  carGroup.castShadow = true;
  scene.add(carGroup);
}

function createStatueOfLiberty(x, z) {
  const statueGroup = new THREE.Group();
  statueGroup.position.set(x, 0, z);
  statueGroup.rotation.y = Math.PI;

  const baseGeo = new THREE.CylinderGeometry(80, 100, 60, 8);
  const base = new THREE.Mesh(baseGeo, materials.buildingBrick);
  base.position.y = 30;
  statueGroup.add(base);

  const pedestalGeo = new THREE.BoxGeometry(50, 60, 50);
  const pedestal = new THREE.Mesh(pedestalGeo, materials.buildingBrick);
  pedestal.position.y = 90;
  statueGroup.add(pedestal);

  const bodyGeo = new THREE.CylinderGeometry(15, 25, 120, 16);
  const body = new THREE.Mesh(bodyGeo, materials.copper);
  body.position.y = 180;
  statueGroup.add(body);

  const headGeo = new THREE.BoxGeometry(12, 15, 12);
  const head = new THREE.Mesh(headGeo, materials.copper);
  head.position.y = 250;
  statueGroup.add(head);

  for (let i = 0; i < 7; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(1, 8), materials.copper);
    spike.position.set(0, 260, 0);
    spike.rotation.z = (i - 3) * 0.3;
    statueGroup.add(spike);
  }

  const armGeo = new THREE.CylinderGeometry(4, 4, 60);
  const arm = new THREE.Mesh(armGeo, materials.copper);
  arm.position.set(-15, 230, 10);
  arm.rotation.z = -0.3;
  arm.rotation.x = -0.2;
  statueGroup.add(arm);

  const torchGeo = new THREE.CylinderGeometry(3, 1, 10);
  const torch = new THREE.Mesh(torchGeo, new THREE.MeshBasicMaterial({ color: 0xffd700 }));
  torch.position.set(-25, 260, 15);
  statueGroup.add(torch);

  const fireGeo = new THREE.DodecahedronGeometry(4);
  const fire = new THREE.Mesh(fireGeo, new THREE.MeshBasicMaterial({ color: 0xff5500 }));
  fire.position.set(-25, 268, 15);
  statueGroup.add(fire);

  const torchLight = new THREE.PointLight(0xff5500, 2, 300);
  torchLight.position.set(-25, 270, 15);
  statueGroup.add(torchLight);

  const arm2 = new THREE.Mesh(new THREE.BoxGeometry(8, 30, 8), materials.copper);
  arm2.position.set(15, 200, 5);
  arm2.rotation.z = 0.2;
  arm2.rotation.x = -0.5;
  statueGroup.add(arm2);

  const tablet = new THREE.Mesh(new THREE.BoxGeometry(15, 20, 2), materials.copper);
  tablet.position.set(15, 200, 10);
  tablet.rotation.x = -0.5;
  tablet.rotation.z = 0.2;
  statueGroup.add(tablet);

  statueGroup.scale.set(3, 3, 3);
  scene.add(statueGroup);
}

export { createCity };

