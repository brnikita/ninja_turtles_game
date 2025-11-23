// === НАСТРОЙКА THREE.JS ===
const container = document.getElementById('game-container');

// Сцена (Раннее утро Нью-Йорк)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Светло-голубое небо
scene.fog = new THREE.Fog(0xe0f6ff, 500, 2500); // Утренний туман

// Камера
const camera = new THREE.PerspectiveCamera(45, 1000 / 600, 0.1, 2000);
camera.position.set(0, 400, 300);
camera.lookAt(0, 0, 0);

// Рендерер
const renderer = new THREE.WebGLRenderer({ antialias: false }); // Отключаем сглаживание для скорости
renderer.setSize(1000, 600);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Ограничиваем пиксели
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // Более быстрые тени
container.insertBefore(renderer.domElement, document.getElementById('ui'));

// === ОСВЕЩЕНИЕ ===
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Яркое утреннее освещение
scene.add(ambientLight);

// Солнце (Восход)
const sunLight = new THREE.DirectionalLight(0xffddaa, 1.2); // Теплый свет
sunLight.position.set(800, 300, -800); // Низкое солнце
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.far = 3000;
sunLight.shadow.camera.left = -1500;
sunLight.shadow.camera.right = 1500;
sunLight.shadow.camera.top = 1500;
sunLight.shadow.camera.bottom = -1500;
scene.add(sunLight);

// Массив препятствий для коллизий
const obstacles = [];

// Хелпер для создания границ препятствия
function addObstacle(x, z, width, depth) {
    obstacles.push({
        x: x,
        z: z,
        halfWidth: width / 2 + 10,
        halfDepth: depth / 2 + 10
    });
}

// Функция проверки коллизий
function checkCollision(x, z) {
    for (const obs of obstacles) {
        if (x > obs.x - obs.halfWidth && x < obs.x + obs.halfWidth &&
            z > obs.z - obs.halfDepth && z < obs.z + obs.halfDepth) {
            return true;
        }
    }
    return false;
}

// === МАТЕРИАЛЫ ===
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
    blade: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0, roughness: 0.1, emissive: 0x222222 }),
    enemyBody: new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.4 }),
    footSymbol: new THREE.MeshBasicMaterial({ color: 0xcc0000 }),
    redGlow: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    spark: new THREE.MeshBasicMaterial({ color: 0xffaa00 }),
    
    // Окружение
    asphalt: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
    sidewalk: new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 }),
    roadMarking: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    manhole: new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.4 }),
    buildingBrick: new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 }),
    buildingGlass: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 }),
    windowLight: new THREE.MeshBasicMaterial({ color: 0xffeeb0 }), // Свет в окне
    neonBlue: new THREE.MeshBasicMaterial({ color: 0x00ffff }),
    neonPink: new THREE.MeshBasicMaterial({ color: 0xff00ff }),
    copper: new THREE.MeshStandardMaterial({ color: 0x2c5a4c, roughness: 0.6 }), // Статуя свободы
    carYellow: new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2, metalness: 0.5 }),
    headlight: new THREE.MeshBasicMaterial({ color: 0xffffaa }),
    taillight: new THREE.MeshBasicMaterial({ color: 0xff0000 })
};

// === ИГРОВЫЕ ПЕРЕМЕННЫЕ ===
let score = 0;
let gameOver = false;
let enemies = [];
let particles = [];
let boss = null;
let bossSpawnScore = 500;
let steamParticles = []; // Объявляем ДО использования

const keys = { w: false, a: false, s: false, d: false, space: false };

// Управление мышью
let mouseX = 0;
let mouseY = 0;
let isPointerLocked = false;

// === ГЕНЕРАЦИЯ ГОРОДА (Оптимизированная) ===
function createCity() {
    const blockSize = 500; // Увеличили квартал
    const streetWidth = 250; // Широкие улицы
    const mapSize = 2; // Город чуть меньше в кварталах, но масштабнее

    // 1. Земля (Асфальт)
    const groundGeo = new THREE.PlaneGeometry(4000, 4000);
    const ground = new THREE.Mesh(groundGeo, materials.asphalt);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Подготовка InstancedMesh для окон
    const windowGeo = new THREE.PlaneGeometry(15, 25); // Окна больше
    const maxWindows = 3000;
    const windowsMesh = new THREE.InstancedMesh(windowGeo, materials.windowLight, maxWindows);
    let windowCount = 0;
    const dummy = new THREE.Object3D();

    // 2. Кварталы
    for (let x = -mapSize; x <= mapSize; x++) {
        for (let z = -mapSize; z <= mapSize; z++) {
            const xPos = x * blockSize;
            const zPos = z * blockSize;
            
            if (Math.abs(x) < 1 && Math.abs(z) < 1) {
                createArenaDetails(xPos, zPos);
                continue;
            }

            // Тротуар
            const swSize = blockSize - streetWidth;
            const sw = new THREE.Mesh(
                new THREE.BoxGeometry(swSize, 8, swSize), // Тротуар выше
                materials.sidewalk
            );
            sw.position.set(xPos, 4, zPos);
            sw.receiveShadow = true;
            scene.add(sw);
            
            // Добавляем тротуар как препятствие (нельзя заходить в здания)
            addObstacle(xPos, zPos, swSize, swSize);

            // Здания (Гигантские)
            const buildingCount = 1; // Одно огромное здание на блок (небоскреб)
            
            const w = swSize * 0.9;
            const d = swSize * 0.9;
            const h = 300 + Math.random() * 600; // Высота до 900

            const building = new THREE.Mesh(
                new THREE.BoxGeometry(w, h, d),
                Math.random() > 0.5 ? materials.buildingBrick : materials.buildingGlass
            );
            building.position.set(xPos, h / 2, zPos);
            building.castShadow = true;
            building.receiveShadow = true;
            scene.add(building);

            // Окна
            if (windowCount < maxWindows - 100) {
                const rows = Math.floor(h / 50);
                const cols = Math.floor(w / 40);
                
                for (let r = 0; r < rows; r++) {
                    if (Math.random() > 0.7) continue;
                    for(let c = 0; c < cols; c++) {
                         if (Math.random() > 0.5) continue;

                        const side = Math.floor(Math.random() * 4);
                        const yPos = 40 + r * 45;
                        
                        // Генерируем окна только с одной стороны для оптимизации, или упрощенно
                        // Здесь просто рандомные окна по фасаду
                        
                        if (side === 0) { dummy.position.set(xPos, yPos, zPos + d/2 + 1); dummy.rotation.set(0, 0, 0); }
                        else if (side === 1) { dummy.position.set(xPos, yPos, zPos - d/2 - 1); dummy.rotation.set(0, Math.PI, 0); }
                        else if (side === 2) { dummy.position.set(xPos + w/2 + 1, yPos, zPos); dummy.rotation.set(0, Math.PI/2, 0); }
                        else { dummy.position.set(xPos - w/2 - 1, yPos, zPos); dummy.rotation.set(0, -Math.PI/2, 0); }

                        dummy.updateMatrix();
                        windowsMesh.setMatrixAt(windowCount++, dummy.matrix);
                    }
                }
            }
        }
    }

    windowsMesh.count = windowCount;
    scene.add(windowsMesh);

    // 3. Уличные фонари, Деревья, Машины и Люки
    createDecorations(blockSize, streetWidth, mapSize);
    createStatueOfLiberty(0, -2000);
}

function createDecorations(blockSize, streetWidth, mapSize) {
    // Деревья и фонари вдоль улиц
    for (let x = -mapSize; x <= mapSize; x++) {
        for (let z = -mapSize; z <= mapSize; z++) {
            // Пропускаем центр (арена)
            if (Math.abs(x) < 1 && Math.abs(z) < 1) continue;

            const xPos = x * blockSize;
            const zPos = z * blockSize;
            const halfBlock = blockSize / 2;
            const sidewalkOffset = (blockSize - streetWidth) / 2 + 10;

            // 4 угла перекрестка
            const corners = [
                [xPos - sidewalkOffset, zPos - sidewalkOffset],
                [xPos + sidewalkOffset, zPos - sidewalkOffset],
                [xPos - sidewalkOffset, zPos + sidewalkOffset],
                [xPos + sidewalkOffset, zPos + sidewalkOffset]
            ];

            corners.forEach(pos => {
                // Фонарь
                createStreetLight(pos[0], pos[1]);
                addObstacle(pos[0], pos[1], 5, 5); // Столб твердый

                // Дерево рядом
                createTree(pos[0] + (Math.random()-0.5)*30, pos[1] + (Math.random()-0.5)*30);
                
                // Люк на дороге
                if (Math.random() > 0.7) {
                    createManhole(pos[0] + (Math.random() > 0.5 ? 40 : -40), pos[1] + (Math.random() > 0.5 ? 40 : -40));
                }
            });

            // Машины на дорогах
            if (Math.random() > 0.4) {
                const isVertical = Math.random() > 0.5;
                const carX = isVertical ? xPos + sidewalkOffset + 30 : xPos;
                const carZ = isVertical ? zPos : zPos + sidewalkOffset + 30;
                const rot = isVertical ? 0 : Math.PI / 2;
                
                createCar(carX, carZ, rot);
                addObstacle(carX, carZ, 30, 60); // Машина твердая
            }
        }
    }
    
    // Детали арены (центр)
    createManhole(50, 50);
    createManhole(-80, -120);
}

// Генерируем окружение сразу после объявления вспомогательных функций
createCity();

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
    pole.position.set(x, poleHeight/2, z);
    scene.add(pole);
    
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(4),
        new THREE.MeshBasicMaterial({color: 0xffaa00})
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

function createArenaDetails(x, z) {
    // Разметка дороги
    const lineGeo = new THREE.PlaneGeometry(10, 80);
    for (let i = -3; i <= 3; i++) {
        const line = new THREE.Mesh(lineGeo, materials.roadMarking);
        line.rotation.x = -Math.PI / 2;
        line.position.set(x, 1, z + i * 150);
        scene.add(line);
    }

    // Канализационные люки
    const manholeGeo = new THREE.CylinderGeometry(12, 12, 1, 16);
    const manhole = new THREE.Mesh(manholeGeo, materials.manhole);
    manhole.position.set(x + 50, 0.5, z + 50);
    scene.add(manhole);
    
    const manhole2 = new THREE.Mesh(manholeGeo, materials.manhole);
    manhole2.position.set(x - 80, 0.5, z - 120);
    scene.add(manhole2);
    
    // Пар из люка
    createSteam(x - 80, z - 120);
}

function createCar(x, z, rotation) {
    const carGroup = new THREE.Group();
    carGroup.position.set(x, 0, z);
    carGroup.rotation.y = rotation;

    // Корпус
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(30, 12, 60), materials.carYellow);
    chassis.position.y = 10;
    carGroup.add(chassis);

    // Кабина
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(26, 10, 30), materials.buildingGlass);
    cabin.position.y = 20;
    carGroup.add(cabin);

    // Колеса
    const wheelGeo = new THREE.CylinderGeometry(5, 5, 2, 16);
    const wheelMat = new THREE.MeshStandardMaterial({color: 0x111111});
    const positions = [[-15, 5, 20], [15, 5, 20], [-15, 5, -20], [15, 5, -20]];
    
    positions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        carGroup.add(wheel);
    });

    // Фары
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 1), materials.headlight);
    headlight.position.set(-10, 12, 30);
    carGroup.add(headlight);
    const headlight2 = headlight.clone();
    headlight2.position.set(10, 12, 30);
    carGroup.add(headlight2);
    
    // Стоп-сигналы
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 1), materials.taillight);
    taillight.position.set(-10, 12, -30);
    carGroup.add(taillight);
    const taillight2 = taillight.clone();
    taillight2.position.set(10, 12, -30);
    carGroup.add(taillight2);

    carGroup.castShadow = true;
    scene.add(carGroup);
}

function createStreetLights() {
    // Ставим фонари вдоль дорог
    const positions = [[-150, -150], [150, 150], [-150, 150], [150, -150]];
    
    positions.forEach(pos => {
        const poleHeight = 60;
        
        // Столб
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, poleHeight),
            materials.darkMetal
        );
        pole.position.set(pos[0], poleHeight/2, pos[1]);
        scene.add(pole);
        
        // Лампа
        const light = new THREE.SpotLight(0xffaa00, 0.8, 150, Math.PI/3, 0.5, 1); // Уменьшили дальность и угол
        light.position.set(pos[0], poleHeight, pos[1]);
        light.target.position.set(pos[0], 0, pos[1]);
        light.castShadow = false; // ОПТИМИЗАЦИЯ: Отключили тени от фонарей
        scene.add(light);
        scene.add(light.target);
        
        // Свечение самой лампы
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(3),
            new THREE.MeshBasicMaterial({color: 0xffaa00})
        );
        bulb.position.set(pos[0], poleHeight, pos[1]);
        scene.add(bulb);
    });
}

function createStatueOfLiberty(x, z) {
    const statueGroup = new THREE.Group();
    statueGroup.position.set(x, 0, z);
    // Разворачиваем лицом к городу
    statueGroup.rotation.y = Math.PI; 

    // 1. Постамент (Звезда/Форт)
    const baseGeo = new THREE.CylinderGeometry(80, 100, 60, 8);
    const base = new THREE.Mesh(baseGeo, materials.buildingBrick);
    base.position.y = 30;
    statueGroup.add(base);

    // 2. Пьедестал
    const pedestalGeo = new THREE.BoxGeometry(50, 60, 50);
    const pedestal = new THREE.Mesh(pedestalGeo, materials.buildingBrick);
    pedestal.position.y = 90;
    statueGroup.add(pedestal);

    // 3. Тело статуи (Мантия)
    const bodyGeo = new THREE.CylinderGeometry(15, 25, 120, 16);
    const body = new THREE.Mesh(bodyGeo, materials.copper);
    body.position.y = 180;
    statueGroup.add(body);

    // 4. Голова
    const headGeo = new THREE.BoxGeometry(12, 15, 12);
    const head = new THREE.Mesh(headGeo, materials.copper);
    head.position.y = 250;
    statueGroup.add(head);

    // 5. Корона (Шипы)
    for(let i=0; i<7; i++) {
        const spike = new THREE.Mesh(
            new THREE.ConeGeometry(1, 8), 
            materials.copper
        );
        spike.position.set(0, 260, 0);
        spike.rotation.z = (i - 3) * 0.3;
        statueGroup.add(spike);
    }

    // 6. Правая рука с факелом
    const armGeo = new THREE.CylinderGeometry(4, 4, 60);
    const arm = new THREE.Mesh(armGeo, materials.copper);
    arm.position.set(-15, 230, 10);
    arm.rotation.z = -0.3;
    arm.rotation.x = -0.2;
    statueGroup.add(arm);

    // Факел
    const torchGeo = new THREE.CylinderGeometry(3, 1, 10);
    const torch = new THREE.Mesh(torchGeo, new THREE.MeshBasicMaterial({color: 0xffd700}));
    torch.position.set(-25, 260, 15);
    statueGroup.add(torch);

    // Огонь факела
    const fireGeo = new THREE.DodecahedronGeometry(4);
    const fire = new THREE.Mesh(fireGeo, new THREE.MeshBasicMaterial({color: 0xff5500}));
    fire.position.set(-25, 268, 15);
    statueGroup.add(fire);

    // Свет от факела
    const torchLight = new THREE.PointLight(0xff5500, 2, 300);
    torchLight.position.set(-25, 270, 15);
    statueGroup.add(torchLight);

    // Левая рука с табличкой
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(8, 30, 8), materials.copper);
    arm2.position.set(15, 200, 5);
    arm2.rotation.z = 0.2;
    arm2.rotation.x = -0.5;
    statueGroup.add(arm2);

    // Табличка
    const tablet = new THREE.Mesh(new THREE.BoxGeometry(15, 20, 2), materials.copper);
    tablet.position.set(15, 200, 10);
    tablet.rotation.x = -0.5;
    tablet.rotation.z = 0.2;
    statueGroup.add(tablet);

    // Масштабируем, чтобы была огромной
    statueGroup.scale.set(3, 3, 3);

    scene.add(statueGroup);
}

// Генерация мира

// Также добавляем функцию для пара, которую мы потеряли

function createSteam(x, z) {
    for(let i=0; i<3; i++) {
        const steam = new THREE.Mesh(
            new THREE.DodecahedronGeometry(4),
            new THREE.MeshBasicMaterial({color: 0xeeeeee, transparent: true, opacity: 0.2})
        );
        steam.position.set(x, 5 + i*10, z);
        scene.add(steam);
        steamParticles.push({
            mesh: steam,
            speed: 0.1 + Math.random() * 0.1,
            offset: Math.random() * Math.PI,
            baseY: 5
        });
    }
}


// Запрос блокировки указателя при клике
renderer.domElement.addEventListener('click', () => {
    if (!isPointerLocked) {
        renderer.domElement.requestPointerLock();
    }
});

// Отслеживание блокировки
document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
});

// Движение мыши
document.addEventListener('mousemove', (e) => {
    if (isPointerLocked) {
        mouseX += e.movementX * 0.002;
        mouseY += e.movementY * 0.002;
        mouseY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mouseY)); // Ограничение вертикального угла
    }
});

// Атака мышкой
document.addEventListener('mousedown', (e) => {
    if (e.button === 0 && isPointerLocked) { // ЛКМ
        keys.space = true;
    }
});

document.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        keys.space = false;
    }
});

// === КЛАССЫ ===

class Player {
    constructor() {
        this.mesh = new THREE.Group();
        
        // --- ТЕЛО ---
        // Поднимаем тело выше, чтобы оно было над ногами
        const torsoGeo = new THREE.BoxGeometry(32, 40, 18);
        const torso = new THREE.Mesh(torsoGeo, materials.skin);
        torso.position.y = 50; // Было 20, теперь 50 (над ногами высотой 30)
        torso.castShadow = true;
        this.mesh.add(torso);

        // Грудная пластина (пластрон)
        const plastronGeo = new THREE.BoxGeometry(26, 34, 2);
        const plastron = new THREE.Mesh(plastronGeo, materials.plastron);
        plastron.position.set(0, 50, 10); // Было 20, теперь 50
        this.mesh.add(plastron);

        // Панцирь
        const shellGeo = new THREE.BoxGeometry(34, 44, 10);
        const shell = new THREE.Mesh(shellGeo, materials.shell);
        shell.position.set(0, 52, -10); // Было 22, теперь 52
        shell.castShadow = true;
        this.mesh.add(shell);

        // --- ГОЛОВА ---
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 78, 0); // Было 48, теперь 78 (выше на 30)

        // Основная форма головы
        const headGeo = new THREE.BoxGeometry(22, 24, 22);
        const head = new THREE.Mesh(headGeo, materials.skin);
        head.castShadow = true;
        headGroup.add(head);

        // Синяя маска
        const maskGeo = new THREE.BoxGeometry(23, 6, 23);
        const mask = new THREE.Mesh(maskGeo, materials.mask);
        mask.position.y = 2;
        headGroup.add(mask);

        // Глаза (белые, без зрачков для стиля)
        const eyeGeo = new THREE.BoxGeometry(6, 3, 2);
        const leftEye = new THREE.Mesh(eyeGeo, materials.eye);
        leftEye.position.set(-6, 2, 12);
        headGroup.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, materials.eye);
        rightEye.position.set(6, 2, 12);
        headGroup.add(rightEye);

        // Красный шрам (как на картинке) через правый глаз
        const scarGeo = new THREE.BoxGeometry(2, 12, 1);
        const scar = new THREE.Mesh(scarGeo, materials.scar);
        scar.position.set(6, 4, 12.5);
        scar.rotation.z = 0.2;
        headGroup.add(scar);

        // Хвосты повязки
        const tailGeo = new THREE.BoxGeometry(40, 6, 2);
        this.tail = new THREE.Mesh(tailGeo, materials.mask);
        this.tail.position.set(20, 2, -12);
        this.tail.rotation.y = -0.5;
        headGroup.add(this.tail);

        this.mesh.add(headGroup);

        // --- БРОНЯ И СНАРЯЖЕНИЕ ---
        
        // Наплечник (Левое плечо - массивный, темный)
        const pauldronGroup = new THREE.Group();
        pauldronGroup.position.set(-20, 68, 0); // Было 38, теперь 68
        
        // Основные пластины наплечника
        const plate1 = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 24), materials.darkMetal);
        plate1.rotation.z = -0.2;
        plate1.position.y = 4;
        pauldronGroup.add(plate1);
        
        const plate2 = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 26), materials.darkMetal);
        plate2.rotation.z = -0.4;
        pauldronGroup.add(plate2);

        // Синие веревки на броне
        const ropeGeo = new THREE.BoxGeometry(17, 1, 27);
        const rope1 = new THREE.Mesh(ropeGeo, materials.mask);
        rope1.position.y = 2;
        rope1.rotation.z = -0.4;
        pauldronGroup.add(rope1);

        this.mesh.add(pauldronGroup);

        // Ремни через грудь (Кожаные)
        const strapGeo = new THREE.BoxGeometry(34, 4, 22);
        const strap = new THREE.Mesh(strapGeo, materials.leather);
        strap.position.set(0, 52, 0); // Было 22, теперь 52
        strap.rotation.z = -0.6; // Диагональ
        strap.scale.z = 1.1;
        this.mesh.add(strap);

        // --- КОНЕЧНОСТИ ---
        
        // Руки
        const armGeo = new THREE.BoxGeometry(10, 24, 10);
        
        // Левая рука
        const leftArm = new THREE.Mesh(armGeo, materials.skin);
        leftArm.position.set(-22, 50, 0); // Было 20, теперь 50
        leftArm.castShadow = true;
        this.mesh.add(leftArm);

        // Правая рука
        const rightArm = new THREE.Mesh(armGeo, materials.skin);
        rightArm.position.set(22, 50, 0); // Было 20, теперь 50
        rightArm.castShadow = true;
        this.mesh.add(rightArm);

        // Ноги (БОЛЬШИЕ И ВИДИМЫЕ!)
        const legGeo = new THREE.BoxGeometry(14, 30, 16);
        
        // Группа для ног (чтобы они были независимы от тела при анимации)
        this.legs = new THREE.Group();
        this.legs.position.y = 0; // Ноги начинаются от земли
        this.mesh.add(this.legs);

        // Левая нога
        this.leftLeg = new THREE.Mesh(legGeo, materials.skin);
        this.leftLeg.position.set(-10, 15, 0); // y=15 это половина высоты ноги (30/2)
        this.leftLeg.castShadow = true;
        this.legs.add(this.leftLeg);

        // Правая нога
        this.rightLeg = new THREE.Mesh(legGeo, materials.skin);
        this.rightLeg.position.set(10, 15, 0);
        this.rightLeg.castShadow = true;
        this.legs.add(this.rightLeg);

        // Поднимаем всего персонажа, чтобы ноги касались земли (y=0)
        // Высота ноги 24, центр в 12 -> низ ноги в 0
        // Торс был на y=20, высота 40 -> низ торса в 0.
        // Все сходится.

        // --- ОРУЖИЕ ---

        // Катана (в правой руке)
        const handleGeo = new THREE.BoxGeometry(4, 4, 15);
        const handle = new THREE.Mesh(handleGeo, materials.darkMetal);
        handle.position.set(24, 40, 10); // Было 10, теперь 40
        this.mesh.add(handle);

        const bladeGeo = new THREE.BoxGeometry(2, 70, 4);
        this.blade = new THREE.Mesh(bladeGeo, materials.blade);
        this.blade.position.set(24, 75, 10); // Было 45, теперь 75
        this.blade.rotation.x = Math.PI / 4;
        this.blade.castShadow = true;
        this.mesh.add(this.blade);

        scene.add(this.mesh);

        // Логика
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

    update() {
        let dx = 0;
        let dz = 0;

        // Движение относительно камеры
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        if (keys.w) {
            dx += forward.x;
            dz += forward.z;
        }
        if (keys.s) {
            dx -= forward.x;
            dz -= forward.z;
        }
        if (keys.a) {
            dx -= right.x;
            dz -= right.z;
        }
        if (keys.d) {
            dx += right.x;
            dz += right.z;
        }

        const isMoving = dx !== 0 || dz !== 0;

        // Нормализация
        if (isMoving) {
            const length = Math.sqrt(dx*dx + dz*dz);
            dx /= length;
            dz /= length;
            this.targetRotation = Math.atan2(dx, dz);
            
            // Анимация ходьбы ног
            const walkCycle = Math.sin(Date.now() * 0.015) * 0.6;
            this.leftLeg.position.z = walkCycle * 8;
            this.rightLeg.position.z = -walkCycle * 8;
        } else {
            // Сброс ног в стойку
            this.leftLeg.position.z = 0;
            this.rightLeg.position.z = 0;
        }

        // Применяем позицию к мешу
        const nextX = this.x + dx * this.speed;
        const nextZ = this.z + dz * this.speed;

        if (!checkCollision(nextX, this.z)) {
            this.x = nextX;
        }
        if (!checkCollision(this.x, nextZ)) {
            this.z = nextZ;
        }

        // Границы мира (увеличили карту)
        this.x = Math.max(-1000, Math.min(1000, this.x));
        this.z = Math.max(-1000, Math.min(1000, this.z));

        this.mesh.position.x = this.x;
        this.mesh.position.z = this.z;

        // Поворот персонажа к направлению движения
        if (isMoving) {
            this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, this.targetRotation, 0.2);
        }

        // Анимация повязки
        this.tail.rotation.z = Math.sin(Date.now() * 0.01) * 0.5;

        // Атака
        if (keys.space && this.attackCooldown <= 0) {
            this.attack();
        }

        if (this.attackCooldown > 0) this.attackCooldown--;

        // Анимация атаки
        if (this.attacking) {
            this.blade.rotation.x = Math.PI / 2; // Рубящий удар
            this.blade.position.y = 55; // Было 25, теперь 55
            this.blade.position.z = 30;
            if (this.attackCooldown < 20) {
                this.attacking = false;
                // Возврат меча
                this.blade.rotation.x = Math.PI / 4;
                this.blade.position.y = 75; // Было 55, теперь 75
                this.blade.position.z = 10;
            }
        }
    }

    attack() {
        this.attacking = true;
        this.attackCooldown = 30;
        
        // Создаем след удара (Trail)
        createSlashEffect(this.x, 30, this.z, this.mesh.rotation.y);

        checkAttackHit(this);
    }
}

class Enemy {
    constructor(x, z) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);

        // Тело робота
        const bodyGeo = new THREE.CylinderGeometry(12, 10, 45, 8);
        const body = new THREE.Mesh(bodyGeo, materials.enemyBody);
        body.position.y = 22.5;
        body.castShadow = true;
        this.mesh.add(body);

        // Голова
        const headGeo = new THREE.BoxGeometry(14, 14, 14);
        const head = new THREE.Mesh(headGeo, materials.metal);
        head.position.y = 50;
        head.castShadow = true;
        this.mesh.add(head);

        // Глаза
        const eyeGeo = new THREE.BoxGeometry(4, 2, 2);
        const leftEye = new THREE.Mesh(eyeGeo, materials.redEye);
        leftEye.position.set(-3, 50, 8);
        this.mesh.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, materials.redEye);
        rightEye.position.set(3, 50, 8);
        this.mesh.add(rightEye);

        // Символ
        const symbolGeo = new THREE.PlaneGeometry(10, 10);
        const symbol = new THREE.Mesh(symbolGeo, materials.footSymbol);
        symbol.position.set(0, 30, 10);
        symbol.rotation.z = Math.PI; // Треугольник вниз
        this.mesh.add(symbol);

        // Руки
        const armGeo = new THREE.BoxGeometry(6, 30, 6);
        const leftArm = new THREE.Mesh(armGeo, materials.enemyBody);
        leftArm.position.set(-16, 30, 0);
        this.mesh.add(leftArm);
        const rightArm = new THREE.Mesh(armGeo, materials.enemyBody);
        rightArm.position.set(16, 30, 0);
        this.mesh.add(rightArm);

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

    update() {
        if (this.isDead) return;

        const dx = player.x - this.x;
        const dz = player.z - this.z;
        const distance = Math.sqrt(dx*dx + dz*dz);

        // Поворот к игроку
        this.mesh.rotation.y = Math.atan2(dx, dz);

        if (distance > 35) {
            const moveX = (dx / distance) * this.speed;
            const moveZ = (dz / distance) * this.speed;
            
            if (!checkCollision(this.x + moveX, this.z)) {
                this.x += moveX;
            }
            if (!checkCollision(this.x, this.z + moveZ)) {
                this.z += moveZ;
            }
            
            this.mesh.position.x = this.x;
            this.mesh.position.z = this.z;
            
            // Анимация ходьбы (качание)
            this.mesh.rotation.z = Math.sin(Date.now() * 0.01) * 0.05;
        }

        // Атака
        if (distance < 45 && this.attackCooldown <= 0) {
            player.health -= this.damage;
            this.attackCooldown = 60;
            updateHealthBar();
            
            // Анимация тычка
            this.mesh.position.add(new THREE.Vector3(dx/distance*5, 0, dz/distance*5));
            
            if (player.health <= 0) endGame();
        }

        if (this.attackCooldown > 0) this.attackCooldown--;
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Вспышка урона
        const originalColor = this.mesh.children[0].material.color.getHex();
        this.mesh.children.forEach(c => {
            if(c.material && c.material.emissive) c.material.emissive.setHex(0xff0000);
        });
        setTimeout(() => {
            this.mesh.children.forEach(c => {
                if(c.material && c.material.emissive) c.material.emissive.setHex(0x000000);
            });
        }, 100);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        scene.remove(this.mesh);
        score += 100;
        updateScore();
        createExplosion(this.x, 25, this.z, 0xff0000, 15);
    }
}

class Boss {
    constructor(x, z) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);

        // Тело
        const bodyGeo = new THREE.BoxGeometry(40, 60, 25);
        const body = new THREE.Mesh(bodyGeo, materials.darkMetal);
        body.position.y = 30;
        body.castShadow = true;
        this.mesh.add(body);

        // Шлем
        const headGeo = new THREE.ConeGeometry(15, 30, 8);
        const head = new THREE.Mesh(headGeo, materials.chrome);
        head.position.y = 75;
        head.castShadow = true;
        this.mesh.add(head);

        // Глаза
        const eyeGeo = new THREE.BoxGeometry(6, 4, 4);
        const eye = new THREE.Mesh(eyeGeo, materials.redGlow);
        eye.position.set(0, 72, 10);
        this.mesh.add(eye);

        // Плечи (Шипы)
        const spikeGeo = new THREE.ConeGeometry(10, 40, 4);
        const leftSpike = new THREE.Mesh(spikeGeo, materials.chrome);
        leftSpike.position.set(-25, 55, 0);
        leftSpike.rotation.z = 0.5;
        this.mesh.add(leftSpike);
        
        const rightSpike = new THREE.Mesh(spikeGeo, materials.chrome);
        rightSpike.position.set(25, 55, 0);
        rightSpike.rotation.z = -0.5;
        this.mesh.add(rightSpike);

        // Когти
        const clawGeo = new THREE.BoxGeometry(5, 40, 5);
        const leftClaw = new THREE.Mesh(clawGeo, materials.chrome);
        leftClaw.position.set(-30, 30, 15);
        leftClaw.rotation.x = Math.PI / 2;
        this.mesh.add(leftClaw);
        const rightClaw = new THREE.Mesh(clawGeo, materials.chrome);
        rightClaw.position.set(30, 30, 15);
        rightClaw.rotation.x = Math.PI / 2;
        this.mesh.add(rightClaw);

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

    update() {
        if (this.isDead) return;

        const dx = player.x - this.x;
        const dz = player.z - this.z;
        const distance = Math.sqrt(dx*dx + dz*dz);

        this.mesh.rotation.y = Math.atan2(dx, dz);

        // Рывок (Шреддер ломает препятствия или проходит сквозь них в рывке?)
        // Пусть лучше тоже уважает физику, но рывок быстрый
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

        // Атака
        if (distance < 60 && this.attackCooldown <= 0) {
            player.health -= this.damage;
            this.attackCooldown = 40;
            updateHealthBar();
            if (player.health <= 0) endGame();
        }

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.dashCooldown > 0) this.dashCooldown--;
    }

    takeDamage(amount) {
        this.health -= amount;
        // Мигание
        this.mesh.children.forEach(c => {
           if (c.material) c.material.wireframe = true;
        });
        setTimeout(() => {
            this.mesh.children.forEach(c => {
                if (c.material) c.material.wireframe = false;
             });
        }, 50);

        if (this.health <= 0) {
            this.isDead = true;
            scene.remove(this.mesh);
            boss = null;
            score += 1000;
            updateScore();
            createExplosion(this.x, 40, this.z, 0xffaa00, 50); // Большой взрыв
        }
    }
}

// === ЧАСТИЦЫ ===
class Particle {
    constructor(x, y, z, color) {
        const geo = new THREE.BoxGeometry(4, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color: color });
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
        this.vy -= 0.5; // Гравитация
        
        this.mesh.rotation.x += 0.1;
        this.mesh.rotation.y += 0.1;

        if (this.mesh.position.y < 0) {
            this.mesh.position.y = 0;
            this.vy *= -0.5; // Отскок
        }

        this.life--;
        if (this.life <= 0) {
            scene.remove(this.mesh);
            return false;
        }
        return true;
    }
}

function createSlashEffect(x, y, z, rot) {
    const geo = new THREE.RingGeometry(30, 35, 32, 1, 0, Math.PI);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rot - Math.PI / 2;
    scene.add(mesh);

    let frames = 5;
    const anim = () => {
        if (frames <= 0) {
            scene.remove(mesh);
            return;
        }
        mesh.opacity -= 0.2;
        frames--;
        requestAnimationFrame(anim);
    };
    anim();
}

function createExplosion(x, y, z, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, z, color));
    }
}

// === ИГРОВАЯ ЛОГИКА ===
const player = new Player();

function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, z;
    const dist = 800; // Увеличили дистанцию спавна, но не слишком далеко
    
    // Ищем точку спавна, пока не найдем свободную от коллизий
    let attempts = 0;
    do {
        switch(side) {
            case 0: x = (Math.random()-0.5)*dist; z = -dist; break;
            case 1: x = dist; z = (Math.random()-0.5)*dist; break;
            case 2: x = (Math.random()-0.5)*dist; z = dist; break;
            case 3: x = -dist; z = (Math.random()-0.5)*dist; break;
        }
        attempts++;
    } while (checkCollision(x, z) && attempts < 10);

    if (attempts < 10) {
        enemies.push(new Enemy(x, z));
    }
}

function spawnBoss() {
    if (boss) return;
    boss = new Boss(0, -500);
}

function checkAttackHit(attacker) {
    // Хитбокс перед игроком
    const hitX = attacker.x + Math.sin(attacker.mesh.rotation.y) * 40;
    const hitZ = attacker.z + Math.cos(attacker.mesh.rotation.y) * 40;

    enemies.forEach(enemy => {
        if (enemy.isDead) return;
        const dist = Math.sqrt(Math.pow(hitX - enemy.x, 2) + Math.pow(hitZ - enemy.z, 2));
        if (dist < 60) {
            enemy.takeDamage(50);
        }
    });

    if (boss && !boss.isDead) {
        const dist = Math.sqrt(Math.pow(hitX - boss.x, 2) + Math.pow(hitZ - boss.z, 2));
        if (dist < 80) {
            boss.takeDamage(50);
        }
    }
}

function updateHealthBar() {
    document.getElementById('health-bar').style.width = `${Math.max(0, player.health)}%`;
}

function updateScore() {
    document.getElementById('score').textContent = `Счёт: ${score}`;
    if (score >= bossSpawnScore && !boss) {
        spawnBoss();
        bossSpawnScore += 500;
    }
}

function endGame() {
    gameOver = true;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').classList.remove('hidden');
}

document.getElementById('restart-btn').addEventListener('click', () => location.reload());

// Ввод
window.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.w = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.a = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.s = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.d = true;
            break;
        case 'Space':
            keys.space = true;
            e.preventDefault(); // Чтобы не скроллить страницу
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.w = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.a = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.s = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.d = false;
            break;
        case 'Space':
            keys.space = false;
            break;
    }
});

// Цикл
let enemySpawnTimer = 0;

function animate() {
    requestAnimationFrame(animate);
    
    if (gameOver) return;

    player.update();

    // Камера следует за игроком с управлением мышью
    const camDistance = 400;
    const camHeight = 200;
    
    // Позиция камеры относительно игрока с учетом поворота мыши
    camera.position.x = player.x + Math.sin(mouseX) * camDistance;
    camera.position.y = camHeight + mouseY * 200;
    camera.position.z = player.z + Math.cos(mouseX) * camDistance;
    
    // Камера смотрит на игрока
    camera.lookAt(player.x, 50, player.z);

    enemySpawnTimer++;
    if (enemySpawnTimer > 100) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    enemies.forEach(e => e.update());
    enemies = enemies.filter(e => !e.isDead);

    if (boss) boss.update();

    particles = particles.filter(p => p.update());
    
    // Анимация пара
    steamParticles.forEach(p => {
        p.mesh.position.y += p.speed;
        p.mesh.rotation.y += 0.01;
        p.mesh.scale.setScalar(1 + Math.sin(Date.now()*0.001 + p.offset)*0.5);
        if(p.mesh.position.y > 30) p.mesh.position.y = p.baseY;
    });

    renderer.render(scene, camera);
}

animate();
