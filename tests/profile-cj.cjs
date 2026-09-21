const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(html, /<dt>CJ disponibles<\/dt><dd id="profileCJ">—<\/dd>/);
const nodes = {};
function node(dataset = {}) {
  return { dataset, hidden: true, textContent: '', addEventListener(type, fn) { this[type] = fn; } };
}
const screens = ['menu', 'profile', 'game'].map(screen => node({ screen }));
const buttons = ['profile', 'menu'].map(open => node({ open }));
const stats = ['bestScore', 'totalLines', 'bestCombo', 'eclipses', 'games'].map(stat => node({ stat }));
let raw = '{"stats":{"totalCJ":3}}';
let blocked = false;
let writes = 0;
let reads = 0;
const context = {
  document: {
    hidden: false,
    body: { classList: { toggle() {} } },
    getElementById(id) { return nodes[id] ??= node(); },
    querySelectorAll(selector) { return selector === '[data-screen]' ? screens : selector === '[data-open]' ? buttons : stats; },
    querySelector() { return null; },
    addEventListener() {}
  },
  localStorage: {
    getItem(key) { assert.equal(key, 'cjPlayerData'); reads++; if (blocked) throw Error('Storage denied'); return raw; },
    setItem() { writes++; throw Error('Forbidden write'); },
    removeItem() { writes++; throw Error('Forbidden removal'); },
    clear() { writes++; throw Error('Forbidden clear'); }
  },
  addEventListener() {},
  NocturneProfile: {
    stats: () => ({ bestScore: 42, totalLines: 3, bestCombo: 2, eclipses: 1, games: 7 }),
    settings: () => ({}), persistent: () => true
  },
  NocturneGame: { start: () => true, leave: () => true }
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/menu.js'), 'utf8'), context);

// The official wallet exists, but the remote account script is absent.
buttons[0].click();
assert.equal(nodes.profileCJ.textContent, '3 CJ');
assert.equal(screens[1].hidden, false);
for (const total of [0, 3, 25]) {
  buttons[1].click();
  raw = JSON.stringify({ stats: { totalCJ: total } });
  buttons[0].click();
  assert.equal(nodes.profileCJ.textContent, `${total} CJ`);
}
// A stale or throwing API must not override the official stored balance.
context.CJajlkAccount = { getPlayer() { throw Error('Remote API unavailable'); } };
raw = '{"stats":{"totalCJ":3}}';
nodes.playButton.click();
raw = '{"stats":{"totalCJ":4}}'; // Simulates a wallet updated externally after a session.
nodes.mainMenuButton.click();
buttons[0].click();
assert.equal(nodes.profileCJ.textContent, '4 CJ');
for (const invalid of [null, '', '{', 'null', '{}', '{"stats":null}', '{"stats":{"totalCJ":"3"}}', '{"stats":{"totalCJ":-1}}', '{"stats":{"totalCJ":1e999}}']) {
  raw = invalid;
  buttons[0].click();
  assert.equal(nodes.profileCJ.textContent, '—');
}
blocked = true;
buttons[0].click();
assert.equal(nodes.profileCJ.textContent, '—');
assert.deepEqual(stats.map(n => n.textContent), ['42', '3', '×2', '1', '7']);
assert.equal(writes, 0);
assert.ok(reads > 0);
console.log('PASS: 0/3/25 CJ; no remote API; reopen after session; invalid/absent/blocked data; five existing statistics; zero writes.');
