(() => {
  "use strict";
  const profile = window.NocturneProfile;
  const screens = Array.from(document.querySelectorAll("[data-screen]"));
  const vibrations = document.getElementById("vibrationsSetting");
  const reduced = document.getElementById("reducedSetting");
  function refresh() {
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
    for (const screen of screens) screen.hidden = screen.dataset.screen !== name;
    const heading = document.querySelector(`[data-screen="${name}"] h1, [data-screen="${name}"] h2`);
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  for (const button of document.querySelectorAll("[data-open]")) button.addEventListener("click", () => show(button.dataset.open));
  function play() { if (window.NocturneGame.start()) show("game"); }
  document.getElementById("playButton").addEventListener("click", play);
  document.getElementById("infiniteButton").addEventListener("click", play);
  document.getElementById("restartButton").addEventListener("click", play);
  document.getElementById("mainMenuButton").addEventListener("click", () => { if (window.NocturneGame.leave()) show("menu"); });
  vibrations.addEventListener("change", () => { profile.setting("vibrations", vibrations.checked); refresh(); });
  reduced.addEventListener("change", () => { profile.setting("reducedEffects", reduced.checked); refresh(); });
  show("menu");
})();
