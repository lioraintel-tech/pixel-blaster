class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alive = true;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.hitFlashTimer = 0;
    this.angle = 0;
  }

  moveTowardPlayer(playerX, playerY, speed, dt) {
    this.angle = Utils.angleTo(this.x, this.y, playerX, playerY);
    this.x += Math.cos(this.angle) * speed * dt;
    this.y += Math.sin(this.angle) * speed * dt;
  }

  takeDamage(amount, particles) {
    this.hp -= amount;
    this.hitFlashTimer = 0.1;
    particles.spawnHitSparks(this.x, this.y);
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      particles.spawnExplosion(this.x, this.y, this.type);
    }
  }

  updateWalkAnim(dt, interval) {
    this.walkTimer += dt;
    if (this.walkTimer >= interval) {
      this.walkTimer = 0;
      this.walkFrame = (this.walkFrame + 1) % 4;
    }
    this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
  }

  drawShadow(ctx, rx, ry, x, y) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(x, y + ry + 3, rx, Math.round(rx * 0.45), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawHpBar(ctx, x, y, yOff, barW, barH, color) {
    if (this.hp >= this.maxHp) return;
    Utils.pixelRect(ctx, x - barW / 2, y + yOff, barW, barH, '#222222');
    const filled = Math.round((this.hp / this.maxHp) * barW);
    if (filled > 0) Utils.pixelRect(ctx, x - barW / 2, y + yOff, filled, barH, color);
  }
}

// ─── Grunt ─────────────────────────────────────────────────────────────────

class GruntEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 'grunt');
    this.hp = 40;
    this.maxHp = 40;
    this.speed = 90;
    this.radius = 10;
    this.scoreValue = 100;
  }

  update(dt, playerX, playerY) {
    this.updateWalkAnim(dt, 0.15);
    this.moveTowardPlayer(playerX, playerY, this.speed, dt);
  }

  draw(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const fl = this.hitFlashTimer > 0;
    const c  = fl ? '#ffffff' : COLORS.GRUNT;
    const cd = fl ? '#cccccc' : COLORS.GRUNT_DARK;

    this.drawShadow(ctx, 9, 6, x, y);

    // Legs
    let ll = 0, lr = 0;
    if (this.walkFrame === 1) { ll = 2; lr = -2; }
    else if (this.walkFrame === 3) { ll = -2; lr = 2; }
    Utils.pixelRect(ctx, x - 5, y + 5 + ll, 4, 7, cd);
    Utils.pixelRect(ctx, x + 1, y + 5 + lr, 4, 7, cd);

    // Body — stocky
    Utils.pixelRect(ctx, x - 7, y - 5, 14, 12, c);
    // Arms
    Utils.pixelRect(ctx, x - 11, y - 4, 5, 7, cd);
    Utils.pixelRect(ctx, x + 6,  y - 4, 5, 7, cd);
    // Fists
    Utils.pixelRect(ctx, x - 12, y,     4, 4, c);
    Utils.pixelRect(ctx, x + 8,  y,     4, 4, c);

    // Head
    Utils.pixelRect(ctx, x - 5, y - 13, 10, 9, c);
    // Brow (angry)
    Utils.pixelRect(ctx, x - 4, y - 12, 8, 2, cd);
    // Eyes
    Utils.pixelRect(ctx, x - 3, y - 9, 2, 3, '#000000');
    Utils.pixelRect(ctx, x + 1, y - 9, 2, 3, '#000000');
    // Mouth
    Utils.pixelRect(ctx, x - 2, y - 5, 4, 1, cd);

    this.drawHpBar(ctx, x, y, -20, 20, 3, COLORS.GRUNT);
  }
}

// ─── Rusher ────────────────────────────────────────────────────────────────

class RusherEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 'rusher');
    this.hp = 20;
    this.maxHp = 20;
    this.speed = 200;
    this.radius = 8;
    this.scoreValue = 150;
  }

  update(dt, playerX, playerY) {
    this.updateWalkAnim(dt, 0.065);
    this.moveTowardPlayer(playerX, playerY, this.speed, dt);
  }

  draw(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const fl = this.hitFlashTimer > 0;
    const c  = fl ? '#ffffff' : COLORS.RUSHER;
    const cd = fl ? '#cccccc' : COLORS.RUSHER_DARK;

    this.drawShadow(ctx, 6, 4, x, y);

    // Legs — very fast, close together
    let ll = 0, lr = 0;
    if (this.walkFrame === 1) { ll = 4; lr = -4; }
    else if (this.walkFrame === 3) { ll = -4; lr = 4; }
    Utils.pixelRect(ctx, x - 3, y + 6 + ll, 3, 7, cd);
    Utils.pixelRect(ctx, x,     y + 6 + lr, 3, 7, cd);

    // Body — thin + tall
    Utils.pixelRect(ctx, x - 4, y - 6, 8, 14, c);
    // Speed lines
    Utils.pixelRect(ctx, x + 3, y - 3, 4, 1, cd);
    Utils.pixelRect(ctx, x + 3, y,     4, 1, cd);
    Utils.pixelRect(ctx, x + 3, y + 3, 4, 1, cd);
    Utils.pixelRect(ctx, x - 7, y - 3, 4, 1, cd);
    Utils.pixelRect(ctx, x - 7, y,     4, 1, cd);

    // Head — pointed / aerodynamic
    Utils.pixelRect(ctx, x - 3, y - 14, 6, 9, c);
    Utils.pixelRect(ctx, x - 2, y - 16, 4, 3, c); // top point
    // Glowing eyes
    Utils.pixelRect(ctx, x - 2, y - 12, 2, 3, fl ? '#ffffff' : '#ffff00');
    Utils.pixelRect(ctx, x,     y - 12, 2, 3, fl ? '#ffffff' : '#ffff00');
  }
}

// ─── Tank ──────────────────────────────────────────────────────────────────

class TankEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 'tank');
    this.hp = 120;
    this.maxHp = 120;
    this.speed = 45;
    this.radius = 14;
    this.scoreValue = 300;
  }

  update(dt, playerX, playerY) {
    this.updateWalkAnim(dt, 0.28);
    this.moveTowardPlayer(playerX, playerY, this.speed, dt);
  }

  draw(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const fl = this.hitFlashTimer > 0;
    const c  = fl ? '#ffffff' : COLORS.TANK;
    const cd = fl ? '#bbbbbb' : COLORS.TANK_DARK;

    this.drawShadow(ctx, 14, 8, x, y);

    // Legs — massive
    let ll = 0, lr = 0;
    if (this.walkFrame === 1) { ll = 2; lr = -1; }
    else if (this.walkFrame === 3) { ll = -1; lr = 2; }
    Utils.pixelRect(ctx, x - 8, y + 6 + ll, 6, 9, cd);
    Utils.pixelRect(ctx, x + 2, y + 6 + lr, 6, 9, cd);

    // Body
    Utils.pixelRect(ctx, x - 9, y - 6, 18, 14, c);

    // Shoulder armor plates
    Utils.pixelRect(ctx, x - 15, y - 7, 7, 8, c);
    Utils.pixelRect(ctx, x + 8,  y - 7, 7, 8, c);
    // Shoulder bolts
    Utils.pixelRect(ctx, x - 14, y - 6, 2, 2, cd);
    Utils.pixelRect(ctx, x + 12, y - 6, 2, 2, cd);

    // Chest plate (darker inset)
    Utils.pixelRect(ctx, x - 6, y - 4, 12, 8, cd);
    Utils.pixelRect(ctx, x - 5, y - 3, 10, 6, c);
    // Chest symbol
    Utils.pixelRect(ctx, x - 1, y - 2, 2, 4, cd);
    Utils.pixelRect(ctx, x - 3, y,     6, 2, cd);

    // Head barely peeking between shoulders
    Utils.pixelRect(ctx, x - 4, y - 13, 8, 8, c);
    // Helmet
    Utils.pixelRect(ctx, x - 5, y - 14, 10, 4, cd);
    // Eyes glow
    Utils.pixelRect(ctx, x - 3, y - 11, 3, 3, fl ? '#ffffff' : '#cc00ff');
    Utils.pixelRect(ctx, x,     y - 11, 3, 3, fl ? '#ffffff' : '#cc00ff');

    // Always-visible HP bar (tank is a big target)
    const bw = 30, bh = 4;
    Utils.pixelRect(ctx, x - bw / 2, y - 22, bw, bh, '#222222');
    const filled = Math.round((this.hp / this.maxHp) * bw);
    if (filled > 0) Utils.pixelRect(ctx, x - bw / 2, y - 22, filled, bh, COLORS.TANK);
  }
}
