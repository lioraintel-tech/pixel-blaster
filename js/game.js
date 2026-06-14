class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    Input.init(this.canvas);
    this._resizeCanvas();
    window.addEventListener('resize', () => this._resizeCanvas());

    this.particles = new ParticleSystem();
    this.levelManager = new LevelManager();

    this.state = 'MENU';
    this.player = null;
    this.bullets = [];
    this.enemies = [];
    this.score = 0;
    this.clearBonus = 0;
    this.highScore = parseInt(localStorage.getItem('pixelBlasterHigh') || '0');
    this.shakeAmount = 0;
    this.levelIntroTimer = 0;

    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  _resizeCanvas() {
    const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
    this.canvas.style.width  = Math.floor(CANVAS_W * scale) + 'px';
    this.canvas.style.height = Math.floor(CANVAS_H * scale) + 'px';
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    Input.update();
    this.update(dt);
    this.draw();
    requestAnimationFrame(t => this.loop(t));
  }

  update(dt) {
    switch (this.state) {
      case 'MENU':
        if (Input.mouseJustPressed || Input.enterJustPressed) {
          this._startGame();
        }
        break;

      case 'LEVEL_INTRO':
        this.levelIntroTimer -= dt;
        if (this.levelIntroTimer <= 0) this.state = 'PLAYING';
        break;

      case 'PLAYING':
        this._updatePlaying(dt);
        break;

      case 'LEVEL_COMPLETE':
        if (Input.enterJustPressed || Input.mouseJustPressed) {
          this.score += this.clearBonus;
          if (this.levelManager.hasNextLevel()) {
            this.levelManager.startLevel(this.levelManager.currentLevelIndex + 1);
            this.bullets = [];
            this.enemies = [];
            this.levelIntroTimer = 2;
            this.state = 'LEVEL_INTRO';
          } else {
            if (this.score > this.highScore) {
              this.highScore = this.score;
              localStorage.setItem('pixelBlasterHigh', this.highScore);
            }
            this.state = 'VICTORY';
          }
        }
        break;

      case 'GAME_OVER':
        if (Input.enterJustPressed || Input.mouseJustPressed) {
          this.state = 'MENU';
        }
        break;

      case 'VICTORY':
        if (Input.enterJustPressed || Input.mouseJustPressed) {
          this.state = 'MENU';
        }
        break;
    }
  }

  _updatePlaying(dt) {
    this.player.update(dt, this.bullets, this.particles);

    // Move bullets, remove out-of-bounds
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update(dt);
      if (!this.bullets[i].alive) this.bullets.splice(i, 1);
    }

    // Move enemies
    for (const e of this.enemies) {
      e.update(dt, this.player.x, this.player.y);
    }

    // Player bullet vs enemy
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.isPlayerBullet) continue;

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (Utils.circlesOverlap(b.x, b.y, b.radius, e.x, e.y, e.radius)) {
          e.takeDamage(b.damage, this.particles);
          b.alive = false;
          this.shakeAmount = Math.min(this.shakeAmount + 3.5, 15);

          if (!e.alive) {
            this.score += e.scoreValue;
            this.particles.spawnScorePopup(e.x, e.y - 18, '+' + e.scoreValue);
            this.enemies.splice(j, 1);
          }
          break;
        }
      }

      if (!b.alive) this.bullets.splice(i, 1);
    }

    // Enemy vs player
    for (const e of this.enemies) {
      if (Utils.circlesOverlap(e.x, e.y, e.radius, this.player.x, this.player.y, PLAYER_RADIUS)) {
        this.player.takeDamage(ENEMY_DAMAGE_ON_CONTACT * dt);
        this.shakeAmount = Math.min(this.shakeAmount + 0.4, 15);
      }
    }

    // Spawn new enemies
    this.levelManager.update(dt, this.enemies, type => this._spawnEnemy(type));

    // Shake linear decay
    this.shakeAmount = Math.max(0, this.shakeAmount - 20 * dt);

    this.particles.update(dt);

    // State transitions
    if (!this.player.alive) {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('pixelBlasterHigh', this.highScore);
      }
      this.state = 'GAME_OVER';
    } else if (this.levelManager.isLevelComplete()) {
      this.clearBonus = this.levelManager.currentLevel.clearBonus;
      this.state = 'LEVEL_COMPLETE';
    }
  }

  draw() {
    const ctx = this.ctx;

    const sx = (Math.random() * 2 - 1) * this.shakeAmount;
    const sy = (Math.random() * 2 - 1) * this.shakeAmount;
    ctx.save();
    ctx.translate(sx, sy);

    this._drawBackground();

    // World entities (inside shake)
    if (this.state !== 'MENU' && this.state !== 'GAME_OVER' && this.state !== 'VICTORY') {
      this.particles.draw(ctx);
      for (const e of this.enemies) e.draw(ctx);
      if (this.player) this.player.draw(ctx);
      for (const b of this.bullets) b.draw(ctx);
    }

    ctx.restore(); // end shake

    // HUD + overlays (stable, outside shake)
    if (this.state === 'PLAYING' && this.player) {
      UI.drawHUD(ctx, this.player, this.score, this.levelManager.currentLevel.levelNumber);
    } else if (this.state === 'LEVEL_INTRO' && this.player) {
      UI.drawHUD(ctx, this.player, this.score, this.levelManager.currentLevel.levelNumber);
      UI.drawLevelIntro(ctx, this.levelManager.currentLevel.levelNumber, this.levelIntroTimer);
    } else if (this.state === 'LEVEL_COMPLETE' && this.player) {
      UI.drawHUD(ctx, this.player, this.score, this.levelManager.currentLevel.levelNumber);
      UI.drawLevelComplete(ctx, this.levelManager.currentLevel.levelNumber, this.score, this.clearBonus);
    } else if (this.state === 'MENU') {
      UI.drawMenu(ctx, this.highScore);
    } else if (this.state === 'GAME_OVER') {
      UI.drawGameOver(ctx, this.score, this.highScore);
    } else if (this.state === 'VICTORY') {
      UI.drawVictory(ctx, this.score);
    }
  }

  _drawBackground() {
    const ctx = this.ctx;
    let bgColor = '#000008', gridColor = '#0d0d33';

    if (this.state === 'PLAYING' || this.state === 'LEVEL_INTRO' || this.state === 'LEVEL_COMPLETE') {
      bgColor = this.levelManager.currentLevel.bgColor;
      gridColor = this.levelManager.currentLevel.gridColor;
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(-20, -20, CANVAS_W + 40, CANVAS_H + 40);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const step = 32;
    for (let gx = 0; gx <= CANVAS_W; gx += step) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CANVAS_H); ctx.stroke();
    }
    for (let gy = 0; gy <= CANVAS_H; gy += step) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CANVAS_W, gy); ctx.stroke();
    }
  }

  _spawnEnemy(type) {
    const pos = Utils.spawnPositionOnEdge(CANVAS_W, CANVAS_H, 40);
    switch (type) {
      case 'grunt':  this.enemies.push(new GruntEnemy(pos.x, pos.y));  break;
      case 'rusher': this.enemies.push(new RusherEnemy(pos.x, pos.y)); break;
      case 'tank':   this.enemies.push(new TankEnemy(pos.x, pos.y));   break;
    }
  }

  _startGame() {
    this.player = new Player(CANVAS_W / 2, CANVAS_H / 2);
    this.bullets = [];
    this.enemies = [];
    this.score = 0;
    this.shakeAmount = 0;
    this.particles = new ParticleSystem();
    this.levelManager.startLevel(0);
    this.levelIntroTimer = 2;
    this.state = 'LEVEL_INTRO';
  }
}

document.fonts.ready.then(() => {
  new Game();
});
