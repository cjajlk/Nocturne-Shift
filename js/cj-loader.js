(() => {
  "use strict";
  if (window.__nocturneCJLoading) return;
  window.__nocturneCJLoading = true;
  const account = document.createElement("script");
  account.src = "https://cjajlk.github.io/cjajlkGames-V2-test/core/cjAccount.js";
  // Reuse an existing central account; never create a wallet from this game.
  account.dataset.readonly = "true";
  account.async = true;
  function loadEngine() {
    const engine = document.createElement("script");
    engine.src = "https://cjajlk.github.io/cjajlkGames-V2-test/core/cjEngine.js";
    engine.async = true;
    document.head.appendChild(engine);
  }
  account.onload = loadEngine;
  account.onerror = loadEngine;
  document.head.appendChild(account);
})();
