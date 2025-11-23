function checkAttackHit(attacker, enemies, boss) {
  const hitX = attacker.x + Math.sin(attacker.mesh.rotation.y) * 40;
  const hitZ = attacker.z + Math.cos(attacker.mesh.rotation.y) * 40;

  enemies.forEach(enemy => {
    if (enemy.isDead) return;
    const dist = Math.hypot(hitX - enemy.x, hitZ - enemy.z);
    if (dist < 60) {
      enemy.takeDamage(50);
    }
  });

  if (boss && !boss.isDead) {
    const dist = Math.hypot(hitX - boss.x, hitZ - boss.z);
    if (dist < 80) {
      boss.takeDamage(50);
    }
  }
}

export { checkAttackHit };

