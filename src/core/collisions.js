const obstacles = [];

function addObstacle(x, z, width, depth) {
  obstacles.push({
    x,
    z,
    halfWidth: width / 2 + 10,
    halfDepth: depth / 2 + 10
  });
}

function checkCollision(x, z) {
  return obstacles.some(obs => (
    x > obs.x - obs.halfWidth &&
    x < obs.x + obs.halfWidth &&
    z > obs.z - obs.halfDepth &&
    z < obs.z + obs.halfDepth
  ));
}

export { addObstacle, checkCollision, obstacles };

