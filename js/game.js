(() => {
  "use strict";

  const COLS = 10;
  const ROWS = 20;
  const SCORE_TABLE = Object.freeze([0, 100, 300, 600, 1000]);
  const COLORS = Object.freeze({
    I: "#79dced", J: "#648cf0", L: "#8993ed", O: "#b4e7f2",
    S: "#79dced", T: "#b18ae8", Z: "#8993ed"
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
  const eclipseButton = document.getElementById("eclipseButton");
  const eclipseStatus = document.getElementById("eclipseStatus");
  const eclipseFill = document.getElementById("eclipseFill");
  const ECLIPSE_CHARGE = Object.freeze([0, 20, 35, 55, 80]);
  const ECLIPSE_BASE = 6000;
  const ECLIPSE_EXTENSION_LIMIT = 4000;
  const ECLIPSE_RECOVERY = 600;
  let eclipseCharge = 0;
  let eclipseRemaining = 0;
  let eclipseExtension = 0;
  let eclipseRecovery = 0;
  let playTime = 0;
  let lastClearTime = -Infinity;
  let eclipseUiKey = "";

  function eclipseStrength() {
    return eclipseRemaining > 0 ? 1 : eclipseRecovery / ECLIPSE_RECOVERY;
  }

  function eclipseSpeedFactor() {
    return 1 / (1 - 0.33 * eclipseStrength());
  }

  function updateEclipseUI() {
    const running = eclipseRemaining > 0;
    const ready = !running && eclipseCharge === 100;
    const label = running ? `${(Math.ceil(eclipseRemaining / 100) / 10).toFixed(1)} s` : ready ? "ACTIVER" : `${eclipseCharge} %`;
    const state = running ? "active" : ready ? "ready" : "charging";
    const disabled = !ready || !isPlayable();
    const fraction = running ? eclipseRemaining / (ECLIPSE_BASE + eclipseExtension) : eclipseCharge / 100;
    const key = `${label}/${state}/${disabled}`;
    if (key === eclipseUiKey) return;
    eclipseUiKey = key;
    eclipseButton.disabled = disabled;
    eclipseButton.dataset.state = state;
    eclipseStatus.textContent = label;
    eclipseFill.style.transform = `scaleX(${fraction})`;
    eclipseButton.setAttribute("aria-label", running ? `Éclipse active : ${label}` : ready ? "Activer l’Éclipse" : `Éclipse : charge ${eclipseCharge} %`);
  }

  function activateEclipse() {
    if (!isPlayable() || eclipseCharge < 100 || eclipseRemaining > 0) return;
    const previousFactor = eclipseSpeedFactor();
    eclipseRemaining = ECLIPSE_BASE;
    eclipseExtension = 0;
    eclipseRecovery = 0;
    // Preserve fractional fall progress; activation never moves a piece.
    dropAccumulator *= eclipseSpeedFactor() / previousFactor;
    updateEclipseUI();
  }

  function advanceEclipse(elapsed) {
    playTime += elapsed;
    const previousFactor = eclipseSpeedFactor();
    if (eclipseRemaining > 0) {
      const consumed = Math.min(elapsed, eclipseRemaining);
      eclipseRemaining -= consumed;
      elapsed -= consumed;
      if (eclipseRemaining === 0) {
        eclipseCharge = 0;
        eclipseRecovery = ECLIPSE_RECOVERY;
      }
    }
    if (eclipseRemaining === 0) eclipseRecovery = Math.max(0, eclipseRecovery - elapsed);
    dropAccumulator *= eclipseSpeedFactor() / previousFactor;
  }

  function chargeEclipse(cleared) {
    if (eclipseRemaining > 0) {
      const extension = Math.min(cleared * 500, ECLIPSE_EXTENSION_LIMIT - eclipseExtension);
      eclipseExtension += extension;
      eclipseRemaining += extension;
    } else {
      const bonus = playTime - lastClearTime <= 5000 ? 5 : 0;
      eclipseCharge = Math.min(100, eclipseCharge + ECLIPSE_CHARGE[cleared] + bonus);
    }
    lastClearTime = playTime;
    updateEclipseUI();
  }

  function resetEclipse() {
    eclipseCharge = 0;
    eclipseRemaining = 0;
    eclipseExtension = 0;
    eclipseRecovery = 0;
    lastClearTime = -Infinity;
    eclipseUiKey = "";
  }

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
  // Cosmetic snapshots only: never delay locking, clearing or spawning.
  let visualEffects = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function captureVisualEffects() {
    const now = performance.now();
    const fullRows = grid.map((row, y) => row.every(Boolean) ? y : -1).filter(y => y >= 0);
    const cells = [];
    active.matrix.forEach((row, y) => row.forEach((value, x) => {
      const boardY = active.y + y;
      if (value && boardY >= 0 && !fullRows.includes(boardY)) {
        cells.push({ x: active.x + x, y: boardY + fullRows.filter(line => line > boardY).length });
      }
    }));
    visualEffects = visualEffects.filter(effect => now - effect.at < 280).slice(-7);
    visualEffects.push({ at: now, cells, rows: fullRows });
  }

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
    captureVisualEffects();
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
    score += (SCORE_TABLE[cleared] || 0) * (eclipseRemaining > 0 ? 1.5 : 1);
    chargeEclipse(cleared);
    if (score > bestScore) {
      bestScore = score;
      writeBestScore(bestScore);
    }
    updateStats();
  }

  function dropInterval() {
    const speedLevel = Math.floor(totalLines / 5);
    return Math.max(180, 900 - speedLevel * 55) * eclipseSpeedFactor();
  }

  function isPlayable() {
    return !gameOver && !landscapeSuspended && !document.hidden;
  }

  function endGame() {
    gameOver = true;
    resetEclipse();
    updateEclipseUI();
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
    resetEclipse();
    playTime = 0;
    visualEffects = [];
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
    updateEclipseUI();
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

  function drawCell(ctx, x, y, size, type, luminous = false, danger = 0) {
    const pad = Math.max(1.4, size * 0.08);
    const left = x * size + pad, top = y * size + pad, width = size - pad * 2;
    ctx.save();
    ctx.fillStyle = luminous ? "#16233b" : "#0d1427";
    ctx.fillRect(left, top, width, width);
    ctx.strokeStyle = COLORS[type];
    ctx.lineWidth = luminous ? 1.4 : 1;
    ctx.globalAlpha = Math.min(1, (luminous ? 0.95 : 0.62) + eclipseStrength() * 0.16);
    ctx.strokeRect(left, top, width, width);
    ctx.globalAlpha = luminous ? 0.22 : 0.10;
    ctx.fillStyle = COLORS[type];
    ctx.beginPath();
    ctx.moveTo(left, top); ctx.lineTo(left + width, top);
    ctx.lineTo(left + width * 0.64, top + width * 0.36);
    ctx.lineTo(left, top + width * 0.62); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.22 + danger * 0.5;
    ctx.strokeStyle = danger ? "#cf79c5" : COLORS[type];
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(left + width * 0.65, top + width * 0.12);
    ctx.lineTo(left + width * 0.46, top + width * 0.43);
    ctx.lineTo(left + width * 0.58, top + width * 0.62);
    ctx.lineTo(left + width * 0.3, top + width * 0.88);
    ctx.moveTo(left + width * 0.46, top + width * 0.43);
    ctx.lineTo(left + width * 0.24, top + width * 0.38);
    ctx.stroke();
    ctx.restore();
  }

  // The background is rasterized once; no blur, particles or permanent animation.
  const backdrop = document.createElement("canvas");
  backdrop.width = boardCanvas.width;
  backdrop.height = boardCanvas.height;
  const backdropCtx = backdrop.getContext("2d");
  backdropCtx.fillStyle = "#070b19";
  backdropCtx.fillRect(0, 0, 300, 600);
  const mist = backdropCtx.createRadialGradient(153, 305, 8, 150, 300, 220);
  mist.addColorStop(0, "#1b1836"); mist.addColorStop(1, "#070b19");
  backdropCtx.fillStyle = mist;
  backdropCtx.fillRect(0, 0, 300, 600);
  backdropCtx.beginPath();
  backdropCtx.moveTo(166, 100); backdropCtx.lineTo(139, 237);
  backdropCtx.lineTo(157, 280); backdropCtx.lineTo(130, 407);
  backdropCtx.lineTo(144, 504); backdropCtx.lineTo(171, 351);
  backdropCtx.lineTo(159, 302); backdropCtx.lineTo(176, 207);
  backdropCtx.closePath();
  backdropCtx.fillStyle = "#080c1c"; backdropCtx.fill();
  backdropCtx.strokeStyle = "rgba(145,112,212,0.2)"; backdropCtx.stroke();
  backdropCtx.beginPath(); backdropCtx.moveTo(157, 280);
  backdropCtx.lineTo(130, 407); backdropCtx.lineTo(144, 504);
  backdropCtx.strokeStyle = "rgba(105,207,225,0.15)"; backdropCtx.stroke();

  function drawVisualEffects(cell) {
    const now = performance.now();
    const duration = reducedMotion.matches ? 100 : 280;
    visualEffects = visualEffects.filter(effect => now - effect.at < duration);
    boardCtx.save();
    for (const effect of visualEffects) {
      const progress = (now - effect.at) / duration;
      boardCtx.strokeStyle = "#c4f3ff";
      boardCtx.lineWidth = 1.5;
      boardCtx.globalAlpha = Math.max(0, 1 - progress * 1.6) * 0.8;
      for (const point of effect.cells) {
        boardCtx.strokeRect(point.x * cell + 2, point.y * cell + 2, cell - 4, cell - 4);
      }
      for (const y of effect.rows) {
        boardCtx.globalAlpha = (1 - progress) * 0.38;
        boardCtx.fillStyle = "#a7dceb";
        boardCtx.fillRect(0, y * cell + 2, boardCanvas.width, cell - 4);
        if (progress > 0.2) {
          boardCtx.globalAlpha = (1 - progress) * 0.8;
          boardCtx.beginPath();
          for (let x = 0; x < COLS; x += 1) {
            boardCtx.moveTo(x * cell + 2, y * cell + cell * 0.3);
            boardCtx.lineTo(x * cell + cell * 0.55, y * cell + cell * 0.6);
            boardCtx.lineTo(x * cell + cell * 0.8, y * cell + cell * 0.4);
          }
          boardCtx.stroke();
        }
      }
    }
    boardCtx.restore();
  }

  function drawBoard() {
    const cell = boardCanvas.width / COLS;
    boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    boardCtx.drawImage(backdrop, 0, 0);
    const energy = eclipseStrength();
    if (energy > 0) {
      const pulse = reducedMotion.matches ? 1 : 0.85 + Math.sin(playTime / 650) * 0.15;
      boardCtx.fillStyle = `rgba(2,5,15,${energy * 0.12})`;
      boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
      boardCtx.beginPath();
      boardCtx.moveTo(166, 100); boardCtx.lineTo(139, 237);
      boardCtx.lineTo(157, 280); boardCtx.lineTo(130, 407);
      boardCtx.lineTo(144, 504); boardCtx.lineTo(171, 351);
      boardCtx.lineTo(159, 302); boardCtx.lineTo(176, 207);
      boardCtx.closePath();
      boardCtx.fillStyle = `rgba(107,82,181,${energy * pulse * 0.18})`;
      boardCtx.fill();
      boardCtx.strokeStyle = `rgba(166,230,244,${energy * pulse * 0.65})`;
      boardCtx.lineWidth = 1.2;
      boardCtx.stroke();
    }
    boardCtx.strokeStyle = "rgba(104,124,214,0.065)";
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
    const highest = grid.findIndex(row => row.some(Boolean));
    const tension = highest < 0 ? 0 : Math.max(0, (7 - highest) / 7);
    if (tension > 0) {
      boardCtx.fillStyle = `rgba(155,76,170,${tension * 0.08})`;
      boardCtx.fillRect(0, 0, boardCanvas.width, cell * 7);
      boardCtx.strokeStyle = `rgba(207,121,197,${tension * 0.65})`;
      boardCtx.strokeRect(1, 1, boardCanvas.width - 2, cell * 7);
    }
    grid.forEach((row, y) => row.forEach((type, x) => {
      if (type) drawCell(boardCtx, x, y, cell, type, false, y < 7 ? tension * (7 - y) / 7 : 0);
    }));
    drawVisualEffects(cell);
    if (!active || gameOver) return;
    let ghostOffset = 0;
    while (!collides(active, 0, ghostOffset + 1)) ghostOffset += 1;
    boardCtx.save();
    boardCtx.strokeStyle = "rgba(164,220,239,0.28)";
    boardCtx.lineWidth = 1;
    active.matrix.forEach((row, y) => row.forEach((value, x) => {
      const ghostY = active.y + y + ghostOffset;
      if (value && ghostY >= 0 && ghostOffset > 0) {
        boardCtx.strokeRect((active.x + x) * cell + 3, ghostY * cell + 3, cell - 6, cell - 6);
      }
    }));
    boardCtx.restore();
    active.matrix.forEach((row, y) => row.forEach((value, x) => {
      const boardY = active.y + y;
      if (value && boardY >= 0) drawCell(boardCtx, active.x + x, boardY, cell, active.type, true);
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
      drawCell(ctx, px, py, size, type, true);
    }));
  }

  function drawSidePanels() {
    drawMini(nextCtx, nextCanvas, nextType);
    drawMini(holdCtx, holdCanvas, heldType);
  }

  function frame(now) {
    const elapsed = Math.max(0, now - lastFrame);
    const delta = Math.min(elapsed, 100);
    lastFrame = now;
    if (isPlayable()) {
      advanceEclipse(elapsed);
      dropAccumulator += delta;
      if (dropAccumulator >= dropInterval()) {
        dropAccumulator = 0;
        stepDown();
      }
    }
    drawBoard();
    updateEclipseUI();
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
  eclipseButton.addEventListener("click", activateEclipse);
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
