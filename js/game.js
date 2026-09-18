(() => {
  "use strict";

  const COLS = 10;
  const ROWS = 20;
  const SCORE_TABLE = Object.freeze([0, 100, 300, 600, 1000]);
  const COLORS = Object.freeze({
    I: "#58dcff", J: "#527bff", L: "#ffad55", O: "#ffe369",
    S: "#66e6a1", T: "#b878ff", Z: "#ff668c"
  });
  const SHAPES = Object.freeze({
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
    O: [[1,1],[1,1]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]]
  });
  const TYPES = Object.keys(SHAPES);

  const boardCanvas = document.getElementById("board");
  const boardCtx = boardCanvas.getContext("2d");
  const nextCanvas = document.getElementById("next");
  const nextCtx = nextCanvas.getContext("2d");
  const holdCanvas = document.getElementById("hold");
  const holdCtx = holdCanvas.getContext("2d");
  const touchSurface = document.getElementById("touchSurface");
  const scoreNode = document.getElementById("score");
  const linesNode = document.getElementById("lines");
  const bestNode = document.getElementById("best");
  const finalScoreNode = document.getElementById("finalScore");
  const finalLinesNode = document.getElementById("finalLines");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const landscapeOverlay = document.getElementById("landscapeOverlay");
  const restartButton = document.getElementById("restartButton");

  let grid;
  let active;
  let nextType;
  let heldType;
  let canHold;
  let score;
  let totalLines;
  let bestScore = readBestScore();
  let gameOver;
  let landscapeSuspended = false;
  let lastFrame = performance.now();
  let dropAccumulator = 0;
  let bag = [];
  let touch = null;

  function emptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function cloneShape(type) {
    return SHAPES[type].map(row => row.slice());
  }

  function refillBag() {
    bag = TYPES.slice();
    for (let i = bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }

  function takeType() {
    if (!bag.length) refillBag();
    return bag.pop();
  }

  function makePiece(type) {
    const matrix = cloneShape(type);
    const firstFilledRow = matrix.findIndex(row => row.some(Boolean));
    return {
      type,
      matrix,
      x: Math.floor((COLS - matrix[0].length) / 2),
      y: -firstFilledRow
    };
  }

  function collides(piece, offsetX = 0, offsetY = 0, matrix = piece.matrix) {
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (!matrix[y][x]) continue;
        const targetX = piece.x + x + offsetX;
        const targetY = piece.y + y + offsetY;
        if (targetX < 0 || targetX >= COLS || targetY >= ROWS) return true;
        if (targetY >= 0 && grid[targetY][targetX]) return true;
      }
    }
    return false;
  }

  function spawn(type = nextType) {
    active = makePiece(type);
    nextType = takeType();
    canHold = true;
    dropAccumulator = 0;
    if (collides(active)) endGame();
    drawSidePanels();
  }

  function move(dx) {
    if (!isPlayable() || collides(active, dx, 0)) return false;
    active.x += dx;
    return true;
  }

  function stepDown() {
    if (!isPlayable()) return false;
    if (!collides(active, 0, 1)) {
      active.y += 1;
      return true;
    }
    lockPiece();
    return false;
  }

  function hardDrop() {
    if (!isPlayable()) return;
    while (!collides(active, 0, 1)) active.y += 1;
    lockPiece();
  }

  function rotateMatrix(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
  }

  function rotateActive() {
    if (!isPlayable() || active.type === "O") return;
    const rotated = rotateMatrix(active.matrix);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!collides(active, kick, 0, rotated)) {
        active.x += kick;
        active.matrix = rotated;
        return;
      }
    }
  }

  function holdActive() {
    if (!isPlayable() || !canHold) return;
    const outgoing = active.type;
    if (heldType) {
      active = makePiece(heldType);
      heldType = outgoing;
    } else {
      heldType = outgoing;
      active = makePiece(nextType);
      nextType = takeType();
    }
    canHold = false;
    dropAccumulator = 0;
    if (collides(active)) endGame();
    drawSidePanels();
  }

  function lockPiece() {
    let aboveTop = false;
    active.matrix.forEach((row, y) => row.forEach((value, x) => {
      if (!value) return;
      const boardY = active.y + y;
      if (boardY < 0) aboveTop = true;
      else grid[boardY][active.x + x] = active.type;
    }));
    if (aboveTop) {
      endGame();
      return;
    }
    clearLines();
    spawn();
  }

  function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y -= 1) {
      if (grid[y].every(Boolean)) {
        grid.splice(y, 1);
        grid.unshift(Array(COLS).fill(null));
        cleared += 1;
        y += 1;
      }
    }
    if (!cleared) return;
    totalLines += cleared;
    score += SCORE_TABLE[cleared] || 0;
    if (score > bestScore) {
      bestScore = score;
      writeBestScore(bestScore);
    }
    updateStats();
  }

  function dropInterval() {
    const speedLevel = Math.floor(totalLines / 5);
    return Math.max(180, 900 - speedLevel * 55);
  }

  function isPlayable() {
    return !gameOver && !landscapeSuspended && !document.hidden;
  }

  function endGame() {
    gameOver = true;
    if (score > bestScore) {
      bestScore = score;
      writeBestScore(bestScore);
    }
    updateStats();
    finalScoreNode.textContent = String(score);
    finalLinesNode.textContent = String(totalLines);
    gameOverOverlay.hidden = false;
  }

  function resetGame() {
    grid = emptyGrid();
    score = 0;
    totalLines = 0;
    heldType = null;
    gameOver = false;
    bag = [];
    nextType = takeType();
    gameOverOverlay.hidden = true;
    lastFrame = performance.now();
    dropAccumulator = 0;
    spawn();
    updateStats();
  }

  function readBestScore() {
    try {
      const value = Number.parseInt(localStorage.getItem("nocturneShiftBestScore"), 10);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch (_) {
      return 0;
    }
  }

  function writeBestScore(value) {
    try {
      localStorage.setItem("nocturneShiftBestScore", String(value));
    } catch (_) {
      // Le jeu reste jouable si le stockage local est indisponible.
    }
  }

  function updateStats() {
    scoreNode.textContent = String(score);
    linesNode.textContent = String(totalLines);
    bestNode.textContent = String(bestScore);
  }

  function drawCell(ctx, x, y, size, type) {
    const pad = Math.max(1.4, size * 0.08);
    ctx.fillStyle = COLORS[type];
    ctx.fillRect(x * size + pad, y * size + pad, size - pad * 2, size - pad * 2);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(x * size + pad * 1.5, y * size + pad * 1.5, size - pad * 3, Math.max(1, size * 0.08));
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.strokeRect(x * size + pad, y * size + pad, size - pad * 2, size - pad * 2);
  }

  function drawBoard() {
    const cell = boardCanvas.width / COLS;
    boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    boardCtx.fillStyle = "#070a1b";
    boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
    boardCtx.strokeStyle = "rgba(104,124,214,0.105)";
    boardCtx.lineWidth = 1;
    for (let x = 0; x <= COLS; x += 1) {
      boardCtx.beginPath();
      boardCtx.moveTo(x * cell, 0);
      boardCtx.lineTo(x * cell, boardCanvas.height);
      boardCtx.stroke();
    }
    for (let y = 0; y <= ROWS; y += 1) {
      boardCtx.beginPath();
      boardCtx.moveTo(0, y * cell);
      boardCtx.lineTo(boardCanvas.width, y * cell);
      boardCtx.stroke();
    }
    grid.forEach((row, y) => row.forEach((type, x) => {
      if (type) drawCell(boardCtx, x, y, cell, type);
    }));
    if (!active || gameOver) return;
    active.matrix.forEach((row, y) => row.forEach((value, x) => {
      const boardY = active.y + y;
      if (value && boardY >= 0) drawCell(boardCtx, active.x + x, boardY, cell, active.type);
    }));
  }

  function drawMini(ctx, canvas, type) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(5,7,20,0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!type) return;
    const shape = SHAPES[type];
    const rows = shape.map((row, index) => row.some(Boolean) ? index : -1).filter(index => index >= 0);
    const cols = shape[0].map((_, x) => shape.some(row => row[x]) ? x : -1).filter(x => x >= 0);
    const size = Math.min(18, 68 / Math.max(rows.length, cols.length));
    const startX = (canvas.width - cols.length * size) / 2;
    const startY = (canvas.height - rows.length * size) / 2;
    shape.forEach((row, y) => row.forEach((value, x) => {
      if (!value) return;
      const px = startX / size + (x - cols[0]);
      const py = startY / size + (y - rows[0]);
      drawCell(ctx, px, py, size, type);
    }));
  }

  function drawSidePanels() {
    drawMini(nextCtx, nextCanvas, nextType);
    drawMini(holdCtx, holdCanvas, heldType);
  }

  function frame(now) {
    const delta = Math.min(now - lastFrame, 100);
    lastFrame = now;
    if (isPlayable()) {
      dropAccumulator += delta;
      if (dropAccumulator >= dropInterval()) {
        dropAccumulator = 0;
        stepDown();
      }
    }
    drawBoard();
    requestAnimationFrame(frame);
  }

  function checkOrientation() {
    const shouldSuspend = window.innerWidth > window.innerHeight;
    if (shouldSuspend !== landscapeSuspended) {
      landscapeSuspended = shouldSuspend;
      landscapeOverlay.hidden = !shouldSuspend;
      lastFrame = performance.now();
      dropAccumulator = 0;
      touch = null;
    }
  }

  function onTouchStart(event) {
    if (!isPlayable()) return;
    event.preventDefault();
    const point = event.touches[0];
    touch = {
      startX: point.clientX,
      startY: point.clientY,
      lastX: point.clientX,
      lastY: point.clientY,
      startedAt: performance.now()
    };
  }

  function onTouchMove(event) {
    if (!touch || !isPlayable()) return;
    event.preventDefault();
    const point = event.touches[0];
    const dx = point.clientX - touch.lastX;
    const dy = point.clientY - touch.lastY;
    const threshold = Math.max(20, touchSurface.clientWidth / 12);
    if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 1 : -1);
      touch.lastX = point.clientX;
    }
    if (dy >= threshold && Math.abs(dy) > Math.abs(dx)) {
      stepDown();
      touch.lastY = point.clientY;
    }
  }

  function onTouchEnd(event) {
    if (!touch || !isPlayable()) {
      touch = null;
      return;
    }
    event.preventDefault();
    const changed = event.changedTouches[0];
    const totalX = changed.clientX - touch.startX;
    const totalY = changed.clientY - touch.startY;
    const elapsed = performance.now() - touch.startedAt;
    const distance = Math.hypot(totalX, totalY);
    if (totalY <= -50 && Math.abs(totalY) > Math.abs(totalX)) {
      holdActive();
    } else if (totalY >= 80 && elapsed <= 240 && Math.abs(totalY) > Math.abs(totalX)) {
      hardDrop();
    } else if (elapsed <= 230 && distance <= 14) {
      rotateActive();
    }
    touch = null;
  }

  touchSurface.addEventListener("touchstart", onTouchStart, { passive: false });
  touchSurface.addEventListener("touchmove", onTouchMove, { passive: false });
  touchSurface.addEventListener("touchend", onTouchEnd, { passive: false });
  touchSurface.addEventListener("touchcancel", () => { touch = null; }, { passive: true });
  restartButton.addEventListener("click", resetGame);
  window.addEventListener("resize", checkOrientation);
  window.addEventListener("orientationchange", checkOrientation);
  document.addEventListener("visibilitychange", () => {
    lastFrame = performance.now();
    dropAccumulator = 0;
  });

  checkOrientation();
  resetGame();
  requestAnimationFrame(frame);
})();
