const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function harness(storage = new Map()) {
  let now = 0, focused = true, queued = [];
  const nodes = {}, events = {}, docEvents = {}, ticks = [];
  const canvas = new Proxy({}, { get: (_, key) => key === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {} });
  const node = (dataset = {}) => ({ dataset, hidden: true, textContent: '', style: {}, width: 300, height: 600,
    classList: { toggle() {} }, setAttribute(k,v) { this[k] = v; }, addEventListener(k,f) { this[k] = f; }, getContext: () => canvas });
  const screens = ['menu','modes','profile','settings','game'].map(screen => node({ screen }));
  const buttons = ['menu','modes','profile'].map(open => node({ open }));
  const stats = ['bestScore','totalLines','bestCombo','eclipses','games'].map(stat => node({ stat }));
  const c = { console, Math: Object.create(Math), performance: { now: () => now }, innerWidth:390, innerHeight:844,
    localStorage: { getItem:k=>storage.get(k)??null, setItem:(k,v)=>{assert.equal(k,'nocturneShiftLocalProfileV1');storage.set(k,v);} },
    document: { hidden:false, hasFocus:()=>focused, body:node(), getElementById:id=>nodes[id]??=node(),
      createElement:()=>node(), querySelector:()=>null, querySelectorAll:s=>s==='[data-screen]'?screens:s==='[data-open]'?buttons:stats,
      addEventListener:(k,f)=>docEvents[k]=f },
    matchMedia:()=>({ matches:false }), addEventListener:(k,f)=>events[k]=f,
    requestAnimationFrame:f=>queued.push(f), CJEngine:{tick:(d,k)=>ticks.push([d,k]),suspend(){}},
    setInterval(){throw Error('No additional timers allowed');}, setTimeout(){throw Error('No additional timers allowed');}
  };
  c.window=c;vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(root,'js/profile.js'),'utf8'),c);
  let source=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
  // Test-only access to the real closure; production contains no test hooks.
  source=source.replace(/\}\)\(\);\s*$/, 'window.testEval = expression => eval(expression); })();');
  vm.runInContext(source,c);vm.runInContext(fs.readFileSync(path.join(root,'js/menu.js'),'utf8'),c);
  return {c,nodes,buttons,ticks,storage,e:s=>c.testEval(s),
    frame(ms=100){now+=ms;const q=queued;queued=[];assert.equal(q.length,1);q[0](now);assert.equal(queued.length,1);},
    jump(ms){now+=ms;}, focus(value){focused=value;events[value?'focus':'blur']();},
    hidden(value){c.document.hidden=value;docEvents.visibilitychange();},
    landscape(value){c.innerWidth=value?844:390;c.innerHeight=value?390:844;events.resize();}
  };
}
let h=harness();
assert.equal(h.c.NocturneProfile.settings().selectedMode,'infinite');
h.nodes.playButton.click();assert.equal(h.e('mode'),'infinite');assert.equal(h.nodes.rushClock.hidden,true);assert.equal(h.e('dropInterval()'),900);
h.e('endGame()');assert.equal(h.nodes.resultTitle.textContent,'La nuit se referme');h.nodes.mainMenuButton.click();
h.nodes.rushButton.click();assert.equal(h.c.NocturneProfile.settings().selectedMode,'rush');assert.equal(h.nodes.rushButton['aria-pressed'],'true');
h.nodes.playButton.click();assert.equal(h.e('mode'),'rush');assert.equal(h.nodes.rushTime.textContent,'3:00');assert.equal(h.e('dropInterval()'),765);
for(let i=0;i<10;i++)h.frame();assert.equal(h.e('rushRemaining'),179000);assert.equal(h.nodes.rushTime.textContent,'2:59');
h.e('eclipseCharge=100; activateEclipse()');for(let i=0;i<10;i++)h.frame();assert.equal(h.e('rushRemaining'),178000);assert.ok(h.e('eclipseRemaining')>0);
for(const toggle of [v=>h.landscape(v),v=>h.hidden(v),v=>h.focus(!v)]){
  const remaining=h.e('rushRemaining'),cj=h.ticks.length;toggle(true);h.frame(5000);assert.equal(h.e('rushRemaining'),remaining);assert.equal(h.ticks.length,cj);
  toggle(false);h.frame();assert.equal(h.e('rushRemaining'),remaining);h.frame();assert.equal(h.e('rushRemaining'),remaining-100);
}
let remaining=h.e('rushRemaining');h.frame(5000);assert.equal(h.e('rushRemaining'),remaining);
assert.ok(h.ticks.every(([delta,key])=>delta>0&&delta<=200&&key==='shift'));

// An input arriving at the deadline before the next RAF cannot move the piece.
h.e('rushRemaining=50');const x=h.e('active.x');h.jump(50);assert.equal(h.e('move(1)'),false);assert.equal(h.e('active.x'),x);
assert.equal(h.nodes.rushTime.textContent,'0:00');assert.equal(h.nodes.resultTitle.textContent,'RUSH TERMINÉ');assert.equal(h.e('gameOver'),true);
let count=h.ticks.length;h.frame();assert.equal(h.ticks.length,count);h.nodes.restartButton.click();assert.equal(h.e('mode'),'rush');assert.equal(h.e('rushRemaining'),180000);

// A real locked line scores once before zero; only its animation finishes later.
h.e('grid=emptyGrid(); grid[19].fill("J"); for(let x=3;x<7;x++)grid[19][x]=null; active=makePiece("I"); active.x=3; active.y=18; rushRemaining=100; hardDrop()');
assert.equal(h.e('score'),100);assert.equal(h.e('lineResolution.remaining'),420);const next=h.e('nextType');
h.frame();assert.equal(h.e('rushExpired'),true);assert.equal(h.e('gameOver'),false);assert.equal(h.e('isPlayable()'),false);count=h.ticks.length;
for(let i=0;i<4;i++)h.frame();assert.equal(h.e('gameOver'),true);assert.equal(h.e('lineResolution'),null);assert.equal(h.e('score'),100);assert.equal(h.e('nextType'),next);assert.equal(h.ticks.length,count);
assert.equal(h.c.NocturneProfile.stats().bestScore,0);assert.equal(h.c.NocturneProfile.stats().rushBestScore,100);
assert.equal(h.c.NocturneProfile.stats().totalLines,1);assert.equal(h.nodes.rushBest.textContent,'100');
h.nodes.restartButton.click();h.frame();h.e('grid[0].fill("J"); spawn("O")');assert.equal(h.e('gameOver'),true);assert.ok(h.e('rushRemaining')>0);assert.equal(h.e('score'),0);
h.nodes.mainMenuButton.click();count=h.ticks.length;h.frame();assert.equal(h.ticks.length,count);
let restored=harness(h.storage);assert.equal(restored.c.NocturneProfile.stats().rushBestScore,100);assert.equal(restored.c.NocturneProfile.settings().selectedMode,'rush');

// Full three-minute active clock, clearing the board only in this test to avoid top-out.
h=harness();h.nodes.rushButton.click();h.nodes.playButton.click();
for(let i=0;i<1799;i++){h.e('grid=emptyGrid(); active=makePiece("O")');h.frame();}
assert.equal(h.e('rushRemaining'),100);assert.equal(h.e('gameOver'),false);h.frame();assert.equal(h.e('rushRemaining'),0);assert.equal(h.e('gameOver'),true);assert.equal(h.nodes.finalTime.textContent,'3:00');
// Session-only fragment threshold and unchanged combo cap/window/scoring.
h.nodes.restartButton.click();h.c.Math.random=()=>0;
h.e('totalLines=19');assert.equal(typeof h.e('takeType()'),'string');h.e('totalLines=20');assert.equal(typeof h.e('takeType()'),'object');
h.e('score=0; totalLines=0; for(let i=0;i<9;i++)awardLines(1)');assert.equal(h.e('combo.multiplier'),8);assert.equal(h.e('score'),4400);
h.e('playTime+=4000; awardLines(1)');assert.equal(h.e('combo.multiplier'),1);
h.e('endGame()');h.nodes.mainMenuButton.click();h.nodes.infiniteButton.click();h.nodes.playButton.click();
assert.equal(h.e('totalLines'),0);assert.equal(h.e('dropInterval()'),900);assert.equal(h.nodes.rushClock.hidden,true);assert.equal(h.e('readBestScore()'),0);
h.e('awardLines(1)');assert.equal(h.e('score'),100);assert.equal(h.c.NocturneProfile.stats().bestScore,100);assert.equal(h.c.NocturneProfile.stats().rushBestScore,4500);
assert.deepEqual([...h.storage.keys()],['nocturneShiftLocalProfileV1']);
// Existing Infini record survives Rush, including across reload; fragment discharges remain active.
const saved = new Map([['nocturneShiftLocalProfileV1', JSON.stringify({stats:{bestScore:1234,totalLines:900}})]]);
h=harness(saved);h.nodes.rushButton.click();h.nodes.playButton.click();assert.equal(h.e('totalLines'),0);
h.e('grid=emptyGrid(); grid[19].fill("J"); for(let x=3;x<7;x++)grid[19][x]=null; grid[18][3]="Z"; active=makePiece("I"); active.matrix[1][0]=2; active.x=3; active.y=18; hardDrop()');
assert.equal(h.e('lineResolution.discharges.length'),1);
for(let i=0;i<5;i++)h.frame();assert.equal(h.e('grid[19][3]'),null);assert.equal(h.e('score'),100);
assert.equal(h.c.NocturneProfile.stats().bestScore,1234);assert.equal(h.c.NocturneProfile.stats().totalLines,901);
h.e('endGame()');h.nodes.mainMenuButton.click();h.nodes.infiniteButton.click();h.nodes.playButton.click();
const tickStart=h.ticks.length;h.frame();h.frame();assert.ok(h.ticks.length>tickStart);assert.ok(h.ticks.every(t=>t[1]==='shift'));
restored=harness(h.storage);assert.equal(restored.c.NocturneProfile.stats().bestScore,1234);assert.equal(restored.c.NocturneProfile.stats().rushBestScore,100);
console.log('PASS Rush: selection, persistence, 180 s, Eclipse, suspension, input deadline, pending resolution, early top-out, replay, separate records, combo, fragment, shared CJ, single RAF; Infini 900 ms and no timer.');
