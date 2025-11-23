import * as THREE from './three.js';

const container = document.getElementById('game-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0xe0f6ff, 500, 2500);

const camera = new THREE.PerspectiveCamera(45, 1000 / 600, 0.1, 2000);
camera.position.set(0, 400, 300);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(1000, 600);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
container.insertBefore(renderer.domElement, document.getElementById('ui'));

export { THREE, container, scene, camera, renderer };

