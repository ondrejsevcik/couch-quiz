let pass=0, fail=0;
const ok=(c,m)=>{ c?(pass++):(fail++,console.log('FAIL: '+m)); };
const walk = n => [n, ...(n.children||[]).flatMap(walk)];
const btn = t => walk(els.mStage).find(e=>e._t&&e._t.startsWith(t));

// ---- content invariants ----
const MIN_PER_LEVEL = 2;
ok(CATEGORIES.every(c=>[1,2,3].every(l=>c.pool.filter(q=>q[0]===l).length>=MIN_PER_LEVEL)), 'every category has at least '+MIN_PER_LEVEL+' questions per level');
ok(CATEGORIES.every(c=>c.pool.every(q=>q.length===4&&[1,2,3].includes(q[0])&&q.slice(1).every(s=>typeof s==='string'&&s.trim()))), 'every entry is [level, question, answer, Estonian]');
ok(CATEGORIES.every(c=>c.pool.every(q=>q[1].includes('?')&&q[3].includes('?'))), 'English and Estonian lines are questions');
ok(CATEGORIES.every(c=>new Set(c.pool.map(clueKey)).size===c.pool.length), 'question keys unique within each pool');
ok(CATEGORIES.length>=BOARD_SIZE, 'pool has at least 6 categories');
ok(new Set(CATEGORIES.map(c=>c.name)).size===CATEGORIES.length, 'category names unique');
const longWords = CATEGORIES.flatMap(c=>c.name.match(/[A-Za-z]{9,}/g)||[]).filter(w=>!SOFT_HYPHENS[w]);
ok(longWords.length===0, 'long category words need soft hyphens (phone columns): '+longWords);
ok(Object.entries(SOFT_HYPHENS).every(([w,h])=>h.replace(/\u00AD/g,'')===w), 'soft hyphen entries spell their word');

// ---- setup ----
ok(view==='setup' && state===null, 'fresh load opens setup');
ok(players.length===3, '3 default players');
toggleCategory(CATEGORIES[0].name); toggleCategory(CATEGORIES[0].name);
ok(picked.length===0, 'toggle twice deselects');
picked = randomPick();
ok(picked.length===6 && new Set(picked).size===6, 'random pick gives 6 unique');
const first = picked.slice();
for (const c of CATEGORIES) if (!picked.includes(c.name)) toggleCategory(c.name);
ok(picked.length===6, 'cannot pick more than 6');
addPlayer(); addPlayer(); addPlayer(); addPlayer();
ok(players.length===6, 'max 6 players');
for (let i=0;i<9;i++) removePlayer(0);
ok(players.length===2, 'min 2 players');
players = ["Ann","Bo","Cy"];

picked = first;
startGame(picked);
ok(view==='game' && state.board.length===6, 'game has 6 categories');
ok(new Set(state.board.map(c=>c.name)).size===6, 'board categories unique');
ok(state.scores.length===3, '3 scores');
ok(first.every(n=>played.has(n)), 'started categories marked played');
ok(state.board.every(c=>c.clues.map(q=>q[0]).join()==='1,1,2,2,3,3'), 'each column draws two questions per level, in row order');
ok(state.board.every(c=>c.clues.every(q=>byName(c.name).pool.includes(q))), 'drawn questions come from their own pool');
if (CATEGORIES.length >= 12) {
  const next = randomPick();
  ok(next.every(n=>!played.has(n)), 'random prefers unplayed categories');
}

// ---- play ----
openClue(0,2,300);
ok(state.phase==='clue','phase clue after open');
ok(els.mTextEt._t===state.board[0].clues[2][3], 'Estonian question shown under the English one');
ok(seen.has(clueKey(state.board[0].clues[2])), 'opened question marked seen');
pickPlayer(1);
ok(state.phase==='judge','phase judge after picking player');
render();
btn('Correct').onclick();
ok(state.scores[1]===300, 'correct +300, got '+state.scores[1]);
ok(state.used['0-2']===true, 'tile consumed');
ok(state.open===null && state.phase==='board', 'back to board');

openClue(1,0,100);
pickPlayer(0); render();
btn('Wrong').onclick();
ok(state.scores[0]===-100, 'wrong -100, got '+state.scores[0]);
ok(state.open===null && state.phase==='board', 'wrong answer returns to board immediately');
ok(state.used['1-0']===true, 'tile consumed on wrong answer');

const snapshot = state.scores.slice();
openClue(2,5,600);
reveal();
ok(JSON.stringify(state.scores)===JSON.stringify(snapshot), 'reveal does not change scores');
closeClue();
ok(state.used['2-5']===true, 'tile consumed after reveal');

// ---- persistence ----
const store = {}; localStorage.setItem = (k,v)=>{ store[k]=v; }; render();
const again = boot(store);
ok(again('view')==='game', 'reload resumes game');
ok(JSON.stringify(again('state.scores'))===JSON.stringify(state.scores), 'reload keeps scores');
ok(again('state.used')['2-5']===true, 'reload keeps used tiles');
ok(again('players').join()==='Ann,Bo,Cy', 'reload keeps player names');
ok(JSON.stringify(again('state.board'))===JSON.stringify(state.board), 'reload keeps the drawn questions');
ok(again('seen').size===seen.size, 'reload keeps seen questions');

openClue(3,1,200); pickPlayer(2); render();
const mid = boot(store);
ok(mid('state.phase')==='judge' && mid('state.open.idx')===1 && mid('state.answering')===2, 'reload reopens a clue being judged');
judge(true); judge(true); closeClue();
ok(state.scores[2]===200, 'double tap on judge scores once');

ok(boot({'couchquiz.v1': JSON.stringify({played: 5, players: [1, 2]})})('view')==='setup', 'corrupt storage falls back to setup');
ok(boot({'couchquiz.v1': '{not json'})('players.length')===3, 'unparseable storage uses defaults');
ok(boot({'couchquiz.v1': JSON.stringify({played: ['Denmark']})})('played.size')===0, 'unknown played categories dropped');
const oldGame = JSON.parse(store['couchquiz.v1']); oldGame.game.board[0].clues[0] = 'gone';
ok(boot({'couchquiz.v1': JSON.stringify(oldGame)})('view')==='setup', 'saved game with a removed question falls back to setup');

// ---- fresh questions ----
{
  const cat = CATEGORIES[0], tier = cat.pool.filter(q=>q[0]===1);
  seen = new Set(tier.slice(2).map(clueKey));
  const drawn = drawClues(cat).slice(0,2);
  ok(drawn.every(q=>!seen.has(clueKey(q))), 'unseen questions drawn first');
  seen = new Set(tier.map(clueKey));
  ok(drawClues(cat).length===6 && tier.every(q=>!seen.has(clueKey(q))), 'a fully seen level starts over');
}

// ---- new board ----
const before = state.scores.slice();
showSetup();
ok(view==='setup' && picked.length===0, 'new board opens setup');
startGame(randomPick());
ok(JSON.stringify(state.scores)===JSON.stringify(before), 'new board keeps scores');
ok(Object.keys(state.used).length===0, 'new board clears tiles');
state.scores = [300, 0, -100];
showSetup(); removePlayer(0); addPlayer();
ok(JSON.stringify(state.scores)==='[0,-100,0]', 'removing a player drops only their score, new player starts at 0');
view = 'game'; render();
ok(state.scores.length===players.length, 'back to game after player change keeps scores aligned');
startGame(randomPick());
ok(JSON.stringify(state.scores)==='[0,-100,0]', 'new board after player change keeps scores');
resetScores();
ok(state.scores.every(s=>s===0), 'reset scores');

let cleared=0;
for(let c=0;c<6;c++) for(let r=0;r<6;r++){ openClue(c,r,VALUES[r]); closeClue(); cleared++; }
ok(cleared===36 && Object.keys(state.used).length===36, 'all 36 tiles playable');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
