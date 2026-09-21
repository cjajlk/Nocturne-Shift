(() => {
  "use strict";
  const KEY = "nocturneShiftLocalProfileV1";
  const number = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  let saved = {};
  let legacyBest = 0;
  let persistent = true;
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch (_) { persistent = false; }
  try { legacyBest = number(Number.parseInt(localStorage.getItem("nocturneShiftBestScore"), 10)); }
  catch (_) { persistent = false; }
  const stats = {
    bestScore: Math.max(number(saved.stats?.bestScore), legacyBest),
    totalLines: number(saved.stats?.totalLines),
    bestCombo: Math.min(8, number(saved.stats?.bestCombo)),
    eclipses: number(saved.stats?.eclipses),
    games: number(saved.stats?.games)
  };
  const settings = {
    vibrations: typeof saved.settings?.vibrations === "boolean" ? saved.settings.vibrations : false,
    reducedEffects: typeof saved.settings?.reducedEffects === "boolean" ? saved.settings.reducedEffects : false
  };
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, stats, settings })); persistent = true; }
    catch (_) { persistent = false; }
  }
  // All persistence is isolated here. No account or identity is stored.
  window.NocturneProfile = Object.freeze({
    stats: () => ({ ...stats }),
    settings: () => ({ ...settings }),
    reducedEffects: () => settings.reducedEffects,
    persistent: () => persistent,
    startGame() { stats.games += 1; save(); },
    activateEclipse() { stats.eclipses += 1; save(); },
    clearLines(lines, score, combo) {
      stats.totalLines += lines;
      stats.bestScore = Math.max(stats.bestScore, score);
      stats.bestCombo = Math.max(stats.bestCombo, combo);
      save();
    },
    bestScore(value) { if (value > stats.bestScore) { stats.bestScore = value; save(); } },
    setting(name, value) {
      if (!Object.hasOwn(settings, name) || typeof value !== "boolean" || settings[name] === value) return;
      settings[name] = value; save();
    }
  });
})();
