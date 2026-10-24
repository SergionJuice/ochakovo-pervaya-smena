const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync('public/app.js','utf8').split("document.addEventListener('click'")[0];
const map=fs.readFileSync('public/factory-map.js','utf8');
const recruitment=fs.readFileSync('public/recruitment.js','utf8');
function setup(){
  const records=new Map(),events=[];
  const c={structuredClone,URLSearchParams,location:{search:''},seeds:[],JOBS:[],UNDECIDED:{},
    document:{querySelector:()=>({scrollTo(){}})},window:{matchMedia:()=>({matches:false})},
    localStorage:{getItem:k=>records.get(k),setItem:(k,v)=>records.set(k,v)},track:(event,extra)=>events.push({event,...extra})};
  vm.createContext(c);vm.runInContext(map+'\n'+app,c);
  vm.runInContext("render=()=>{};closeDialog=()=>{};sound=()=>{};announce=()=>{};toast=()=>{};setSpeech=()=>{};later=(_ms,fn)=>fn();",c);
  vm.runInContext(recruitment.slice(recruitment.indexOf('function openForm'),recruitment.indexOf('function formTerms')),c);
  return {c,events,records,run:code=>vm.runInContext(code,c)};
}
const orders=[['lab','line','warehouse'],['lab','warehouse','line'],['line','lab','warehouse'],['line','warehouse','lab'],['warehouse','lab','line'],['warehouse','line','lab']];
for(const order of orders){
  const {run,events}=setup();run("handleAction('start');");assert.equal(run('state.screen'),'map');
  for(const [i,id]of order.entries()){
    run(`handleAction('map-go','${id}');`);
    if(id==='lab')run("loadSample(1);handleAction('pass-lab');");
    if(id==='line'){
      run("handleAction('run-line');");assert.equal(run('state.completed[1]'),false,'Unsafe start is rejected');
      run("handleAction('inspect','sensor');handleAction('safe-stop');handleAction('call-specialist');handleAction('run-line');");
    }
    if(id==='warehouse')run("for(const p of ['kvass','kvass','kvass','kvass','mojito','mojito'])addBottle(p);shipOrder();");
    assert.equal(run('count()'),i+1,order.join(' → '));
    assert.equal(run('shiftComplete()'),i===2);
    run("go('finish');");assert.equal(run('state.screen'),i===2?'finish':'map','Final is guarded until all unique areas complete');
    run(`go('${id}');go('map');`);assert.equal(run('count()'),i+1,'Reopening a result cannot add completion');
  }
  assert.equal(events.filter(e=>e.event==='game_start').length,1);
  assert.equal(events.filter(e=>e.event==='level_complete').length,3);
}
{
  const {run,records}=setup();
  run("go('warehouse');addBottle('kvass');state.form={name:'Тестовый Кандидат',education:'МИРЭА'};openForm('keeper','warehouse');returnToGame();");
  assert.equal(run('state.screen'),'warehouse');assert.equal(run('state.warehouse.slots.filter(Boolean).length'),1);
  assert.equal(run('state.form.education'),'МИРЭА');assert.equal(run("shiftStatus('warehouse')"),'Продолжить');
  run("go('map');openForm('undecided','map');returnToGame();");assert.equal(run('state.screen'),'map');
  const stored=JSON.parse(records.get('ochakovo-first-shift-v3'));
  assert.equal(stored.state.visited.warehouse,true);assert.equal(stored.state.warehouse.slots[0],'kvass');assert.equal(stored.state.form.education,'МИРЭА');
  run('reset();');assert.equal(run('count()'),0);assert.equal(run('state.form.education'),'МИРЭА','Restart keeps the application draft');
  run("go('line');state.line.phase='running';go('form');returnToGame();recover();");
  assert.equal(run('count()'),1,'A finished operation recovers exactly once on interruption');
  run('recover();');assert.equal(run('count()'),1);
}
{
  const source=fs.readFileSync('public/app.js','utf8');
  let stopped=false;const document={hidden:true,body:{classList:{toggle:(_name,value)=>stopped=value}}};
  const c={document};vm.createContext(c);
  vm.runInContext(source.match(/function syncMapVisibility\(\)\{[^}]+\}/)[0],c);
  c.syncMapVisibility();assert.equal(stopped,true);document.hidden=false;c.syncMapVisibility();assert.equal(stopped,false);
}
console.log('PASS: all 6 orders through real action handlers; safe-start/final guards; no double count; map/form return; persisted partial task and form draft; restart/recovery; hidden-tab pause handler.');
