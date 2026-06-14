# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

Open `index.html` directly in a browser — no server, no build step, no npm needed. The game is entirely self-contained.

To verify changes work headlessly (screenshots via Playwright):
```powershell
# One-time setup (already done)
npm install && npx playwright install chromium

# Run a test script
node run_test.js
```

To push changes to GitHub after a commit:
```powershell
git push
```

## Architecture

**No module system.** All JS files write to global scope. The `<script>` load order in `index.html` is the dependency graph — it must be respected when adding new files.

**Load order (each depends on everything above it):**
`constants.js` → `utils.js` → `input.js` → `particles.js` → `bullet.js` → `player.js` → `enemy.js` → `level.js` → `ui.js` → `game.js`

**Game loop** (`game.js`): `requestAnimationFrame` calls `loop(timestamp)` → `Input.update()` → `update(dt)` → `draw()`. `dt` is capped at 50ms to prevent physics explosions when the tab is backgrounded.

**State machine** (`game.js`): States are plain strings. Transitions happen inside `update()`.
```
MENU → LEVEL_INTRO → PLAYING → LEVEL_COMPLETE → LEVEL_INTRO (next level)
                             → GAME_OVER → MENU
                             (after level 5) → VICTORY → MENU
```

**Draw layering**: World entities are drawn inside a `ctx.save/restore` that applies screen shake via `ctx.translate`. HUD and overlays are drawn *after* `ctx.restore` so they are shake-stable. This split is intentional — don't move HUD drawing inside the shake block.

**Coordinate system**: Fixed logical resolution 800×600 (`CANVAS_W`/`CANVAS_H`). The canvas is scaled up/down via CSS in `_resizeCanvas()`. Mouse coordinates from `Input` are already corrected for this scale via `getBoundingClientRect`.

**Collision**: All collision is circle-vs-circle (`Utils.circlesOverlap`). Hitbox radii are intentionally smaller than the visual sprite to feel fair. When iterating `this.enemies` or `this.bullets` for collision removal, always iterate **backwards** (`for i = length-1; i >= 0; i--`) before splicing.

**Particle system** (`particles.js`): Particles are plain objects `{x, y, vx, vy, life, maxLife, size, color, type}`. Type `'text'` renders a string (score popups); all others render a square `fillRect`. Alpha fades linearly with `life/maxLife`.

**Sprites**: All characters are drawn procedurally with `ctx.fillRect` calls — no image files. `Utils.pixelRect(ctx, x, y, w, h, color)` is the shorthand used everywhere. The hit-flash effect (white override when an enemy takes damage) is controlled by `hitFlashTimer` on each enemy — draw methods check `this.hitFlashTimer > 0` to swap colors to white.

**Enemy types** (`enemy.js`): `GruntEnemy`, `RusherEnemy`, `TankEnemy` all extend `Enemy`. To add a new type: extend `Enemy`, set `this.hp/maxHp/speed/radius/scoreValue`, implement `update(dt, px, py)` and `draw(ctx)`, add a `case` in `Game._spawnEnemy()`, and add it to a wave in `LEVELS` in `level.js`.

**Level data** (`level.js`): `LEVELS` is an array of plain objects. Each level has `waves: [{count, type, spawnInterval}]`. `LevelManager` steps through waves sequentially, advancing when `spawnsRemainingInWave === 0 && enemies.length === 0`. The `bgColor`/`gridColor` per level subtly shifts the arena.

**All tunable numbers live in `constants.js`** — speeds, HP, damage, fire rate, etc. Never hardcode game-feel values elsewhere.

**Text rendering** (`ui.js`): Uses `Press Start 2P` (Google Fonts CDN). Always set `ctx.textBaseline = 'top'` before drawing. `Utils.drawText(ctx, text, x, y, size, color, align)` draws a dark shadow offset (+2,+2) then the colored text on top. Font renders cleanly only at multiples of 8px (8, 10, 16, 24, 32).

**High score** persists via `localStorage` key `'pixelBlasterHigh'`.

## Commit conventions

Use PowerShell here-strings for multi-line commit messages (heredoc syntax doesn't work in PowerShell):
```powershell
git commit -m @'
Short summary line

Body detail here.
'@
```
