const stop=new Set(['the','this','a','of','and','in','on','to','for','is','was','it','its','his','her','their','with','by','from','at','an','as','that','one','two','three','all','not','he','she','they']);
// Generic words an answer may share with its clue without giving it away
// ("Which vitamin...?" -> "Vitamin C", "What kind of rock...?" -> "Igneous rock").
const generic=new Set(['vitamin','rock','light','energy','degrees','celsius','fahrenheit','percent','about','gases','scale','layer','system','cells','bone','lung','nerve','gland','your','reaction','sign','museum','constant','calendar','mount','king','captain','brothers','river','lake','ocean','island','city','game','games','company','language','film','movie','series','book','band','team','planet','star','theory','effect','law','acid','sauce','cheese','wine','beer','dance','style','festival','prize','award','cup','tower','bridge','palace','temple','church','cathedral','wall','gate','square','street','park','station','mountains','desert','island','islands','strait','canal','bay','gulf','falls','century','dynasty','empire','war','revolution']);
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ');
let issues=0;
// Check the English question and its Estonian translation against the answer.
const withEt=cat=>cat.pool.flatMap(([,q,a,et])=>[[q,a],[et,a,true]]);
for(const cat of CATEGORIES){
  for(const [q,a] of withEt(cat)){
    const qn=' '+norm(q)+' ';
    const words=norm(a).split(/\s+/).filter(w=>w.length>3&&!stop.has(w)&&!generic.has(w));
    const leaked=words.filter(w=>qn.includes(' '+w));
    // also: answer word appearing as a stem inside a longer clue word
    const stem=words.filter(w=>!leaked.includes(w)&&qn.includes(w.slice(0,Math.max(5,w.length-2))));
    if(leaked.length||stem.length){
      issues++;
      console.log(`[${cat.name}] "${a}"\n   clue: ${q}\n   exact: ${leaked.join(', ')||'-'}  stem: ${stem.join(', ')||'-'}\n`);
    }
    if(norm(q).includes(norm(cat.name))) console.log(`[${cat.name}] clue repeats category name: ${q}\n`);
  }
}
console.log(issues?`${issues} potential leak(s)`:'no leaks found');
// Clues naming each other's answers are kept off the same board at runtime
// (clash() in index.html; tested in assert.js), so they aren't reported here.
