const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false
};

const mouseState = {
  x: 0,
  y: 0,
  isLocked: false
};

function initPointerLock(renderer) {
  renderer.domElement.addEventListener('click', () => {
    if (!mouseState.isLocked) {
      renderer.domElement.requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    mouseState.isLocked = document.pointerLockElement === renderer.domElement;
  });

  document.addEventListener('mousemove', e => {
    if (!mouseState.isLocked) return;
    mouseState.x += e.movementX * 0.002;
    mouseState.y += e.movementY * 0.002;
    mouseState.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mouseState.y));
  });

  document.addEventListener('mousedown', e => {
    if (e.button === 0 && mouseState.isLocked) {
      keys.space = true;
    }
  });
}

window.addEventListener('keydown', e => {
  switch (e.code) {
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
      e.preventDefault();
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', e => {
  switch (e.code) {
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
    default:
      break;
  }
});

export { keys, mouseState, initPointerLock };

