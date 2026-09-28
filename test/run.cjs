const { readFileSync } = require('fs');
const vm = require('vm');
const src = readFileSync(__dirname + '/../index.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1];
const tests = readFileSync(__dirname + '/assert.js','utf8');

const mk = () => ({ style:{}, classList:{ add(){}, remove(){}, toggle(){} },
  children:[], set innerHTML(v){ this.children=[]; }, get innerHTML(){return '';},
  set textContent(v){ this._t=v; }, get textContent(){return this._t;},
  setAttribute(){},
  appendChild(c){ this.children.push(c); }, addEventListener(ev,fn){ this.onclick=fn; } });

// Run the page script once; `store` is shared so a second boot sees the first's saves.
function boot(store) {
  const els = {};
  const sandbox = {
    els, boot, console, Math, JSON, Set, Array, Object, String, process,
    confirm: () => true,
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } },
    document: { getElementById: id => els[id] ||= mk(), createElement: mk, addEventListener(){} }
  };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  // `let` bindings aren't sandbox properties, so read them by evaluating.
  return expr => vm.runInContext(expr, sandbox);
}

boot({})(tests);
