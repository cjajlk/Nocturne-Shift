(() => {
  "use strict";
  const profile = window.NocturneProfile;
  const screens = Array.from(document.querySelectorAll("[data-screen]"));
  const vibrations = document.getElementById("vibrationsSetting");
  const reduced = document.getElementById("reducedSetting");
  let selectedMode = profile.settings().selectedMode === "rush" ? "rush" : "infinite";
  function refreshMode() {
    document.getElementById("selectedMode").textContent = selectedMode === "rush" ? "Rush Nocturne · 3 minutes" : "Mode Infini · Portrait · Tactile";
    document.getElementById("infiniteButton").setAttribute("aria-pressed", String(selectedMode === "infinite"));
    document.getElementById("rushButton").setAttribute("aria-pressed", String(selectedMode === "rush"));
  }
  const cjBalance = document.getElementById("profileCJ");
  function refreshCJ() {
    let value = "—";
    try {
      // Read the shared wallet even when the remote account script has not loaded.
      const raw = localStorage.getItem("cjPlayerData");
      const total = raw === null ? undefined : JSON.parse(raw)?.stats?.totalCJ;
      if (typeof total === "number" && Number.isFinite(total) && total >= 0) value = `${total} CJ`;
    } catch (_) { /* The profile remains usable when the central account is unavailable. */ }
    cjBalance.textContent = value;
  }
  function refreshVisibleCJ() {
    if (screens.some(screen => screen.dataset.screen === "profile" && !screen.hidden)) refreshCJ();
  }
  window.addEventListener("nocturne:cj-account-ready", refreshVisibleCJ);
  window.addEventListener("focus", refreshVisibleCJ);
  window.addEventListener("storage", event => {
    if (event.key === "cjPlayerData" || event.key === null) refreshVisibleCJ();
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshVisibleCJ(); });
  function refresh() {
    refreshMode();
    const stats = profile.stats();
    for (const node of document.querySelectorAll("[data-stat]")) {
      node.textContent = node.dataset.stat === "bestCombo" && stats.bestCombo > 0 ? `×${stats.bestCombo}` : String(stats[node.dataset.stat]);
    }
    const settings = profile.settings();
    vibrations.checked = settings.vibrations;
    reduced.checked = settings.reducedEffects;
    document.body.classList.toggle("reduced-effects", settings.reducedEffects);
    document.getElementById("profileNote").textContent = profile.persistent() ? "Statistiques enregistrées sur cet appareil." : "Stockage indisponible : statistiques conservées uniquement pendant cette session.";
  }
  function show(name) {
    refresh();
    if (name === "profile") refreshCJ();
    for (const screen of screens) screen.hidden = screen.dataset.screen !== name;
    const heading = document.querySelector(`[data-screen="${name}"] h1, [data-screen="${name}"] h2`);
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  for (const button of document.querySelectorAll("[data-open]")) button.addEventListener("click", () => show(button.dataset.open));
  function play() { if (window.NocturneGame.start(selectedMode)) show("game"); }
  document.getElementById("playButton").addEventListener("click", play);
  for (const [id, mode] of [["infiniteButton", "infinite"], ["rushButton", "rush"]]) {
    document.getElementById(id).addEventListener("click", () => {
      selectedMode = mode;
      profile.selectMode(mode);
      show("menu");
    });
  }
  document.getElementById("restartButton").addEventListener("click", play);
  document.getElementById("mainMenuButton").addEventListener("click", () => { if (window.NocturneGame.leave()) show("menu"); });
  vibrations.addEventListener("change", () => { profile.setting("vibrations", vibrations.checked); refresh(); });
  reduced.addEventListener("change", () => { profile.setting("reducedEffects", reduced.checked); refresh(); });
  show("menu");
})();
