const stop=new Set(['the','this','a','of','and','in','on','to','for','is','was','it','its','his','her','their','with','by','from','at','an','as','that','one','two','three','all','not','he','she','they']);
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ');
let issues=0;
for(const cat of CATEGORIES){
  for(const [q,a] of cat.clues){
    const qn=' '+norm(q)+' ';
    const words=norm(a).split(/\s+/).filter(w=>w.length>3&&!stop.has(w));
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

// Cross-clue: does any clue mention another clue's answer?
console.log('--- cross-clue mentions ---');
const all=[]; for(const c of CATEGORIES) for(const [q,a] of c.clues) all.push({cat:c.name,q,a});
let x=0;
for(const item of all){
  const qn=' '+norm(item.q)+' ';
  for(const other of all){
    if(other===item) continue;
    const w=norm(other.a).split(/\s+/).filter(t=>t.length>4&&!stop.has(t));
    if(w.length && w.every(t=>qn.includes(' '+t))){
      x++; console.log(`[${item.cat}] clue mentions answer "${other.a}" (from ${other.cat})\n   ${item.q}\n`);
    }
  }
}
console.log(x?`${x} cross-mention(s)`:'no cross-mentions');
