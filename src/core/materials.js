import * as THREE from './three.js';

const materials = {
  skin: new THREE.MeshStandardMaterial({ color: 0x556b2f, roughness: 0.6 }),
  shell: new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 }),
  plastron: new THREE.MeshStandardMaterial({ color: 0xc2b280, roughness: 0.9 }),
  mask: new THREE.MeshStandardMaterial({ color: 0x0044aa, roughness: 0.8 }),
  eye: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  redEye: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.8, roughness: 0.2 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.4 }),
  leather: new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }),
  scar: new THREE.MeshBasicMaterial({ color: 0x880000 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1.0, roughness: 0.1 }),
  blade: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.1,
    emissive: 0x222222
  }),
  enemyBody: new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.4 }),
  footSymbol: new THREE.MeshBasicMaterial({ color: 0xcc0000 }),
  redGlow: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  spark: new THREE.MeshBasicMaterial({ color: 0xffaa00 }),
  asphalt: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 }),
  roadMarking: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  manhole: new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.4 }),
  buildingBrick: new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 }),
  buildingGlass: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 }),
  windowLight: new THREE.MeshBasicMaterial({ color: 0xffeeb0 }),
  neonBlue: new THREE.MeshBasicMaterial({ color: 0x00ffff }),
  neonPink: new THREE.MeshBasicMaterial({ color: 0xff00ff }),
  copper: new THREE.MeshStandardMaterial({ color: 0x2c5a4c, roughness: 0.6 }),
  carYellow: new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2, metalness: 0.5 }),
  headlight: new THREE.MeshBasicMaterial({ color: 0xffffaa }),
  taillight: new THREE.MeshBasicMaterial({ color: 0xff0000 })
};

export default materials;

