const UI = {
  drawHUD(ctx, player, score, levelNumber) {
    const barW = 160, barH = 14;
    const bx = 16, by = 16;

    // HP bar
    Utils.pixelRect(ctx, bx - 1, by - 1, barW + 2, barH + 2, '#000000');
    Utils.pixelRect(ctx, bx, by, barW, barH, '#330000');
    const hpFrac = Utils.clamp(player.hp / player.maxHp, 0, 1);
    const hpColor = hpFrac > 0.3 ? '#00ee44' : '#ff2200';
    const filled = Math.round(hpFrac * barW);
    if (filled > 0) Utils.pixelRect(ctx, bx, by, filled, barH, hpColor);
    // Shine on HP bar
    if (filled > 2) Utils.pixelRect(ctx, bx, by, filled, 3, hpFrac > 0.3 ? '#88ffaa' : '#ff8866');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 1, by - 1, barW + 2, barH + 2);
    Utils.drawText(ctx, 'HP', bx, by + barH + 5, 7, '#aaaaaa');

    // Score
    Utils.drawText(ctx, 'SCORE ' + String(score).padStart(6, '0'), CANVAS_W - 16, 16, 10, COLORS.UI_TEXT, 'right');

    // Level indicator
    Utils.drawText(ctx, 'LEVEL ' + levelNumber, CANVAS_W / 2, 16, 10, COLORS.UI_ACCENT, 'center');
  },

  drawMenu(ctx, highScore) {
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Scrolling scanlines
    const scanOff = (Date.now() / 55) % 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let sy = -scanOff; sy < CANVAS_H; sy += 4) {
      ctx.fillRect(0, sy, CANVAS_W, 2);
    }

    // Background grid
    ctx.strokeStyle = '#0d0d33';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < CANVAS_W; gx += 32) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CANVAS_H); ctx.stroke();
    }
    for (let gy = 0; gy < CANVAS_H; gy += 32) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CANVAS_W, gy); ctx.stroke();
    }

    // Glow behind title
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.ellipse(CANVAS_W / 2, CANVAS_H / 2 - 90, 260, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Title
    Utils.drawText(ctx, 'PIXEL', CANVAS_W / 2, CANVAS_H / 2 - 130, 36, '#00ff88', 'center');
    Utils.drawText(ctx, 'BLASTER', CANVAS_W / 2, CANVAS_H / 2 - 88, 36, '#00ff88', 'center');

    // Subtitle
    Utils.drawText(ctx, 'RETRO  ARCADE  SHOOTER', CANVAS_W / 2, CANVAS_H / 2 - 44, 8, '#44aa88', 'center');

    // Divider
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 180, CANVAS_H / 2 - 22);
    ctx.lineTo(CANVAS_W / 2 + 180, CANVAS_H / 2 - 22);
    ctx.stroke();

    // Play prompt (blinking)
    if (Math.floor(Date.now() / 600) % 2 === 0) {
      Utils.drawText(ctx, '>> CLICK TO PLAY <<', CANVAS_W / 2, CANVAS_H / 2, 12, '#ffffff', 'center');
    }

    // Controls
    Utils.drawText(ctx, 'ARROWS / WASD  :  MOVE', CANVAS_W / 2, CANVAS_H / 2 + 50, 7, '#555566', 'center');
    Utils.drawText(ctx, 'MOUSE AIM  +  CLICK  :  SHOOT', CANVAS_W / 2, CANVAS_H / 2 + 66, 7, '#555566', 'center');

    // High score
    if (highScore > 0) {
      Utils.drawText(ctx, 'BEST: ' + String(highScore).padStart(6, '0'), CANVAS_W / 2, CANVAS_H - 44, 10, '#ffaa00', 'center');
    }

    // Version tag
    Utils.drawText(ctx, 'v1.0', CANVAS_W - 12, CANVAS_H - 20, 7, '#333344', 'right');
  },

  drawLevelIntro(ctx, levelNumber, timer) {
    // timer counts down from 2 to 0
    let alpha;
    if (timer > 1.5) {
      alpha = (2.0 - timer) / 0.5;
    } else {
      alpha = Math.min(1.0, timer / 0.75);
    }
    alpha = Utils.clamp(alpha, 0, 1);

    ctx.globalAlpha = alpha * 0.75;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = alpha;

    Utils.drawText(ctx, 'LEVEL', CANVAS_W / 2, CANVAS_H / 2 - 60, 22, '#00ff88', 'center');
    Utils.drawText(ctx, String(levelNumber), CANVAS_W / 2, CANVAS_H / 2 - 8, 56, '#ffffff', 'center');

    ctx.globalAlpha = 1;
  },

  drawLevelComplete(ctx, levelNumber, score, clearBonus) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    Utils.drawText(ctx, 'LEVEL CLEAR!', CANVAS_W / 2, CANVAS_H / 2 - 100, 20, '#00ff88', 'center');

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 160, CANVAS_H / 2 - 64);
    ctx.lineTo(CANVAS_W / 2 + 160, CANVAS_H / 2 - 64);
    ctx.stroke();

    Utils.drawText(ctx, 'SCORE  ' + String(score).padStart(6, '0'), CANVAS_W / 2, CANVAS_H / 2 - 46, 12, '#cccccc', 'center');
    Utils.drawText(ctx, 'BONUS  +' + clearBonus, CANVAS_W / 2, CANVAS_H / 2 - 20, 12, '#ffaa00', 'center');

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 160, CANVAS_H / 2 + 6);
    ctx.lineTo(CANVAS_W / 2 + 160, CANVAS_H / 2 + 6);
    ctx.stroke();

    Utils.drawText(ctx, 'TOTAL  ' + String(score + clearBonus).padStart(6, '0'), CANVAS_W / 2, CANVAS_H / 2 + 14, 14, '#00ff88', 'center');

    if (Math.floor(Date.now() / 540) % 2 === 0) {
      Utils.drawText(ctx, 'CLICK OR ENTER TO CONTINUE', CANVAS_W / 2, CANVAS_H / 2 + 72, 9, '#ffffff', 'center');
    }
  },

  drawGameOver(ctx, score, highScore) {
    ctx.fillStyle = 'rgba(90, 0, 0, 0.72)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    Utils.drawText(ctx, 'GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 90, 28, '#ff2200', 'center');

    ctx.strokeStyle = '#ff2200';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 150, CANVAS_H / 2 - 52);
    ctx.lineTo(CANVAS_W / 2 + 150, CANVAS_H / 2 - 52);
    ctx.stroke();

    Utils.drawText(ctx, 'SCORE  ' + String(score).padStart(6, '0'), CANVAS_W / 2, CANVAS_H / 2 - 34, 12, '#ffffff', 'center');

    if (score > 0 && score >= highScore) {
      Utils.drawText(ctx, '** NEW BEST! **', CANVAS_W / 2, CANVAS_H / 2 - 6, 11, '#ffff00', 'center');
    } else if (highScore > 0) {
      Utils.drawText(ctx, 'BEST  ' + String(highScore).padStart(6, '0'), CANVAS_W / 2, CANVAS_H / 2 - 6, 10, '#888888', 'center');
    }

    if (Math.floor(Date.now() / 540) % 2 === 0) {
      Utils.drawText(ctx, 'CLICK OR ENTER TO MENU', CANVAS_W / 2, CANVAS_H / 2 + 60, 9, '#ffffff', 'center');
    }
  },

  drawVictory(ctx, score) {
    ctx.fillStyle = 'rgba(0, 30, 15, 0.88)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Gold glow
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.ellipse(CANVAS_W / 2, CANVAS_H / 2 - 40, 280, 120, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    Utils.drawText(ctx, 'YOU WIN!', CANVAS_W / 2, CANVAS_H / 2 - 90, 32, '#00ff88', 'center');
    Utils.drawText(ctx, 'ALL ENEMIES DEFEATED', CANVAS_W / 2, CANVAS_H / 2 - 38, 9, '#aaffcc', 'center');

    Utils.drawText(ctx, 'FINAL SCORE', CANVAS_W / 2, CANVAS_H / 2 + 8, 11, '#cccccc', 'center');
    Utils.drawText(ctx, String(score).padStart(6, '0'), CANVAS_W / 2, CANVAS_H / 2 + 38, 22, '#ffff00', 'center');

    if (Math.floor(Date.now() / 540) % 2 === 0) {
      Utils.drawText(ctx, 'CLICK OR ENTER', CANVAS_W / 2, CANVAS_H / 2 + 96, 9, '#ffffff', 'center');
    }
  },
};
