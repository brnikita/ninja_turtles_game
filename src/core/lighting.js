import * as THREE from './three.js';
import { scene } from './setup.js';

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffddaa, 1.2);
sunLight.position.set(800, 300, -800);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.far = 3000;
sunLight.shadow.camera.left = -1500;
sunLight.shadow.camera.right = 1500;
sunLight.shadow.camera.top = 1500;
sunLight.shadow.camera.bottom = -1500;
scene.add(sunLight);

export { ambientLight, sunLight };

