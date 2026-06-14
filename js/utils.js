const Utils = {
  dist(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  circlesOverlap(ax, ay, ar, bx, by, br) {
    return Utils.dist(ax, ay, bx, by) < ar + br;
  },

  angleTo(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  randomRange(min, max) {
    return min + Math.random() * (max - min);
  },

  randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  },

  spawnPositionOnEdge(w, h, margin) {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: return { x: Utils.randomRange(0, w), y: -margin };
      case 1: return { x: w + margin, y: Utils.randomRange(0, h) };
      case 2: return { x: Utils.randomRange(0, w), y: h + margin };
      default: return { x: -margin, y: Utils.randomRange(0, h) };
    }
  },

  pixelRect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  },

  drawText(ctx, text, x, y, size, color, align = 'left') {
    ctx.font = size + 'px ' + FONT_RETRO;
    ctx.textBaseline = 'top';
    ctx.textAlign = align;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  },
};
