class Bullet {
  constructor(x, y, angle, isPlayerBullet) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * BULLET_SPEED;
    this.vy = Math.sin(angle) * BULLET_SPEED;
    this.angle = angle;
    this.isPlayerBullet = isPlayerBullet;
    this.radius = BULLET_RADIUS;
    this.damage = BULLET_DAMAGE;
    this.alive = true;
    this.trail = [];
  }

  update(dt) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 5) this.trail.shift();

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x < -30 || this.x > CANVAS_W + 30 ||
        this.y < -30 || this.y > CANVAS_H + 30) {
      this.alive = false;
    }
  }

  draw(ctx) {
    const mainColor = this.isPlayerBullet ? '#ffff00' : '#ff3333';
    const coreColor = this.isPlayerBullet ? '#ffffff' : '#ff9999';

    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = ((i + 1) / (this.trail.length + 1)) * 0.55;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = mainColor;
      ctx.fillRect(Math.round(t.x - 2), Math.round(t.y - 2), 4, 4);
    }
    ctx.globalAlpha = 1;

    // Bullet head oriented along travel direction
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y));
    ctx.rotate(this.angle);

    ctx.fillStyle = mainColor;
    ctx.fillRect(-6, -2, 12, 4);
    ctx.fillStyle = coreColor;
    ctx.fillRect(-4, -1, 8, 2);

    ctx.restore();
  }
}
