class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawnMuzzleFlash(x, y, angle) {
    const count = Utils.randomInt(6, 9);
    for (let i = 0; i < count; i++) {
      const spread = Utils.randomRange(-0.35, 0.35);
      const speed = Utils.randomRange(160, 380);
      const a = angle + spread;
      const life = Utils.randomRange(0.05, 0.11);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life, maxLife: life,
        size: Utils.randomRange(2, 5),
        color: Math.random() > 0.4 ? '#ffff88' : '#ffffff',
        type: 'muzzle',
      });
    }
  }

  spawnHitSparks(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      const a = Utils.randomRange(0, Math.PI * 2);
      const speed = Utils.randomRange(80, 220);
      const life = Utils.randomRange(0.1, 0.28);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life, maxLife: life,
        size: Utils.randomRange(2, 4),
        color: '#ffaa00',
        type: 'spark',
      });
    }
  }

  spawnExplosion(x, y, enemyType) {
    const count = enemyType === 'tank' ? 22 : 14;
    const palettes = {
      grunt:  ['#ff4444', '#ff8888', '#ffaa44', '#ff2200'],
      rusher: ['#ff8800', '#ffbb44', '#ffff44', '#ff6600'],
      tank:   ['#8844ff', '#bb88ff', '#ffffff', '#6600ff'],
    };
    const palette = palettes[enemyType] || palettes.grunt;

    for (let i = 0; i < count; i++) {
      const a = Utils.randomRange(0, Math.PI * 2);
      const speed = Utils.randomRange(40, 300);
      const big = Math.random() < 0.3;
      const life = Utils.randomRange(0.2, big ? 0.65 : 0.42);
      this.particles.push({
        x: x + Utils.randomRange(-6, 6),
        y: y + Utils.randomRange(-6, 6),
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life, maxLife: life,
        size: big ? Utils.randomRange(5, 9) : Utils.randomRange(2, 4),
        color: palette[Math.floor(Math.random() * palette.length)],
        type: 'explosion',
      });
    }
  }

  spawnScorePopup(x, y, text) {
    this.particles.push({
      x, y,
      vx: Utils.randomRange(-12, 12),
      vy: -45,
      life: 0.85,
      maxLife: 0.85,
      size: 8,
      color: '#ffff00',
      type: 'text',
      text,
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // drag
      const drag = Math.pow(0.88, dt * 60);
      p.vx *= drag;
      p.vy *= drag;
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;

      if (p.type === 'text') {
        ctx.font = '8px ' + FONT_RETRO;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillText(p.text, Math.round(p.x) + 1, Math.round(p.y) + 1);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, Math.round(p.x), Math.round(p.y));
        ctx.textAlign = 'left';
      } else {
        const s = Math.max(1, Math.round(p.size));
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
      }
    }
    ctx.globalAlpha = 1;
  }
}
