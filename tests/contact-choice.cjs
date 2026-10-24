const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/career.js','utf8');
let displayed='',renders=0;
const ctx={state:{form:{},selected:'undecided'},formErrors:{},educationInput:()=>false,birthdayChange:()=>false,save(){},render(){renders++;displayed=ctx.state.form.contact||''},$:selector=>selector==='#contact'?{value:displayed}:{scrollTop:47,scrollTo(){}},document:{}};
vm.createContext(ctx);vm.runInContext(source,ctx);
function input(name,value,type='text'){displayed=value;ctx.careerInput({target:{name,value,type,closest:()=>true}})}
function choose(value){const target={name:'contactMethod',value,type:'radio',closest:()=>true};ctx.careerInput({target});ctx.careerChange({target});}
input('contact','+7 900 111-22-33','tel');choose('email');assert.equal(displayed,'');input('contact','candidate@example.test','email');choose('tel');assert.equal(displayed,'+7 900 111-22-33');choose('email');assert.equal(displayed,'candidate@example.test');assert.equal(ctx.state.form.contactMethod,'email');assert.equal(ctx.state.form.contact,'candidate@example.test');assert.equal(ctx.state.contacts.tel,'+7 900 111-22-33');assert.equal(renders,3);
console.log('PASS: actual input/change event sequence retains phone and email independently; payload state follows selected method.');
