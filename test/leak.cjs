const {readFileSync}=require('fs'), vm=require('vm');
const src=readFileSync(__dirname + '/../index.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1];
const mk=()=>({style:{},classList:{add(){},remove(){},toggle(){}},children:[],
  set innerHTML(v){this.children=[]},get innerHTML(){return''},
  set textContent(v){this._t=v},get textContent(){return this._t},
  setAttribute(){},appendChild(c){this.children.push(c)},addEventListener(){}});
const els={};
const sb={console,Math,JSON,Set,Array,Object,String,confirm:()=>true,
  document:{getElementById:id=>els[id]||=mk(),createElement:mk,addEventListener(){}}};
const check = readFileSync(__dirname + '/leakcheck.js','utf8');
vm.createContext(sb); vm.runInContext(src + '\n;' + check, sb);

