const Input = {
  keys: {},
  mouseX: CANVAS_W / 2,
  mouseY: CANVAS_H / 2,
  mouseDown: false,
  mouseJustPressed: false,
  enterJustPressed: false,
  _pendingClick: false,
  _pendingEnter: false,

  init(canvas) {
    window.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      if (e.key === 'Enter' || e.key === ' ') {
        this._pendingEnter = true;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.key] = false;
    });

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.mouseDown = true;
        this._pendingClick = true;
      }
    });

    canvas.addEventListener('mouseup', e => {
      if (e.button === 0) this.mouseDown = false;
    });

    canvas.addEventListener('contextmenu', e => e.preventDefault());
  },

  update() {
    this.mouseJustPressed = this._pendingClick;
    this._pendingClick = false;
    this.enterJustPressed = this._pendingEnter;
    this._pendingEnter = false;
  },

  isMovingUp()    { return !!(this.keys['ArrowUp']    || this.keys['w'] || this.keys['W']); },
  isMovingDown()  { return !!(this.keys['ArrowDown']  || this.keys['s'] || this.keys['S']); },
  isMovingLeft()  { return !!(this.keys['ArrowLeft']  || this.keys['a'] || this.keys['A']); },
  isMovingRight() { return !!(this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']); },
};
