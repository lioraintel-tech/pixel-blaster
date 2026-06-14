class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hp = PLAYER_MAX_HP;
    this.maxHp = PLAYER_MAX_HP;
    this.angle = 0;
    this.fireTimer = 0;
    this.alive = true;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.isMoving = false;
    this.shootFlashTimer = 0;
    this.damageFlashTimer = 0;
  }

  update(dt, bullets, particles) {
    let dx = 0, dy = 0;
    if (Input.isMovingUp())    dy -= 1;
    if (Input.isMovingDown())  dy += 1;
    if (Input.isMovingLeft())  dx -= 1;
    if (Input.isMovingRight()) dx += 1;

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) { dx /= len; dy /= len; }

    this.isMoving = len > 0;
    this.x = Utils.clamp(this.x + dx * PLAYER_SPEED * dt, 20, CANVAS_W - 20);
    this.y = Utils.clamp(this.y + dy * PLAYER_SPEED * dt, 20, CANVAS_H - 20);

    this.angle = Utils.angleTo(this.x, this.y, Input.mouseX, Input.mouseY);

    this.fireTimer -= dt;
    if (Input.mouseDown && this.fireTimer <= 0 && this.alive) {
      const gunLen = 18;
      const tipX = this.x + Math.cos(this.angle) * gunLen;
      const tipY = this.y + Math.sin(this.angle) * gunLen;
      bullets.push(new Bullet(tipX, tipY, this.angle, true));
      particles.spawnMuzzleFlash(tipX, tipY, this.angle);
      this.fireTimer = FIRE_RATE;
      this.shootFlashTimer = 0.07;
    }

    this.shootFlashTimer -= dt;
    this.damageFlashTimer -= dt;

    if (this.isMoving) {
      this.walkTimer += dt;
      if (this.walkTimer >= 0.1) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 4;
      }
    } else {
      this.walkFrame = 0;
      this.walkTimer = 0;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (amount > 0.5) this.damageFlashTimer = 0.12;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  draw(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(x, y + 9, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const flash = this.damageFlashTimer > 0;
    const c  = flash ? '#ffffff' : COLORS.PLAYER;
    const cd = flash ? '#dddddd' : COLORS.PLAYER_DARK;
    const ch = flash ? '#ffffff' : COLORS.PLAYER_HEAD;

    // Walk animation leg offsets
    let legOffL = 0, legOffR = 0;
    if (this.isMoving) {
      if (this.walkFrame === 1) { legOffL = 3; legOffR = -3; }
      else if (this.walkFrame === 3) { legOffL = -3; legOffR = 3; }
    }

    // Legs (behind body)
    Utils.pixelRect(ctx, x - 5, y + 5 + legOffL, 4, 8, cd);
    Utils.pixelRect(ctx, x + 1, y + 5 + legOffR, 4, 8, cd);

    // Torso
    Utils.pixelRect(ctx, x - 7, y - 5, 14, 12, c);
    // Highlight stripe on torso
    Utils.pixelRect(ctx, x - 6, y - 4, 2, 5, flash ? '#ffffff' : '#aaffdd');

    // Head
    Utils.pixelRect(ctx, x - 5, y - 13, 10, 9, ch);
    // Visor
    Utils.pixelRect(ctx, x - 4, y - 11, 8, 3, '#003322');
    // Visor glow dot
    Utils.pixelRect(ctx, x - 2, y - 10, 2, 1, flash ? '#ffffff' : '#00ffaa');

    // Gun arm (rotates toward mouse)
    ctx.save();
    ctx.translate(x, y - 1);
    ctx.rotate(this.angle);
    // Shoulder/grip
    Utils.pixelRect(ctx, 1, -3, 5, 8, c);
    // Barrel
    Utils.pixelRect(ctx, 5, -2, 14, 5, COLORS.PLAYER_GUN);
    Utils.pixelRect(ctx, 5, -1, 12, 3, flash ? '#ffffff' : '#ffffff');
    // Muzzle
    Utils.pixelRect(ctx, 18, -3, 3, 7, COLORS.PLAYER_GUN);

    // Muzzle flash
    if (this.shootFlashTimer > 0) {
      const flashAlpha = this.shootFlashTimer / 0.07;
      ctx.globalAlpha = flashAlpha;
      Utils.pixelRect(ctx, 20, -6, 10, 12, '#ffff44');
      Utils.pixelRect(ctx, 21, -4, 8, 8, '#ffffff');
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}
