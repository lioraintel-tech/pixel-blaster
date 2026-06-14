const LEVELS = [
  {
    levelNumber: 1,
    bgColor: '#0d0d1a',
    gridColor: '#111133',
    waves: [
      { count: 5, type: 'grunt', spawnInterval: 2.0 },
    ],
    clearBonus: 500,
  },
  {
    levelNumber: 2,
    bgColor: '#0d0d1a',
    gridColor: '#111133',
    waves: [
      { count: 6,  type: 'grunt',  spawnInterval: 1.8 },
      { count: 3,  type: 'rusher', spawnInterval: 1.2 },
    ],
    clearBonus: 800,
  },
  {
    levelNumber: 3,
    bgColor: '#0a0d1a',
    gridColor: '#0d1133',
    waves: [
      { count: 8,  type: 'grunt',  spawnInterval: 1.5 },
      { count: 4,  type: 'rusher', spawnInterval: 1.0 },
      { count: 2,  type: 'tank',   spawnInterval: 3.0 },
    ],
    clearBonus: 1200,
  },
  {
    levelNumber: 4,
    bgColor: '#0d0a1a',
    gridColor: '#110d33',
    waves: [
      { count: 10, type: 'grunt',  spawnInterval: 1.2 },
      { count: 6,  type: 'rusher', spawnInterval: 0.8 },
      { count: 3,  type: 'tank',   spawnInterval: 2.5 },
    ],
    clearBonus: 1800,
  },
  {
    levelNumber: 5,
    bgColor: '#1a0a0a',
    gridColor: '#330d0d',
    waves: [
      { count: 12, type: 'grunt',  spawnInterval: 1.0 },
      { count: 8,  type: 'rusher', spawnInterval: 0.6 },
      { count: 4,  type: 'tank',   spawnInterval: 2.0 },
    ],
    clearBonus: 3000,
  },
];

class LevelManager {
  constructor() {
    this.currentLevelIndex = 0;
    this.currentWaveIndex = 0;
    this.spawnTimer = 0;
    this.spawnsRemainingInWave = 0;
    this.allEnemiesCleared = false;
  }

  get currentLevel() {
    return LEVELS[this.currentLevelIndex];
  }

  get currentWave() {
    return this.currentLevel.waves[this.currentWaveIndex];
  }

  startLevel(index) {
    this.currentLevelIndex = Utils.clamp(index, 0, LEVELS.length - 1);
    this.currentWaveIndex = 0;
    this.allEnemiesCleared = false;
    this.spawnsRemainingInWave = this.currentWave.count;
    this.spawnTimer = 0.6;
  }

  update(dt, enemies, onSpawn) {
    if (this.allEnemiesCleared) return;

    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0 && this.spawnsRemainingInWave > 0) {
      onSpawn(this.currentWave.type);
      this.spawnsRemainingInWave--;
      this.spawnTimer = this.currentWave.spawnInterval;
    }

    if (this.spawnsRemainingInWave === 0 && enemies.length === 0) {
      this.currentWaveIndex++;
      if (this.currentWaveIndex >= this.currentLevel.waves.length) {
        this.allEnemiesCleared = true;
      } else {
        this.spawnsRemainingInWave = this.currentWave.count;
        this.spawnTimer = 1.8;
      }
    }
  }

  isLevelComplete() {
    return this.allEnemiesCleared;
  }

  hasNextLevel() {
    return this.currentLevelIndex < LEVELS.length - 1;
  }
}
