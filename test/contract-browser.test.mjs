import test from 'node:test';
import assert from 'node:assert/strict';
import {mountContractDemo} from '../src/contract-browser.mjs';

const seed=[{id:'free',label:'Free 8h',source:'demo',durationSeconds:28800,
 ratePointsPerSecond:1,maxClaimsPerUtcDay:3,minGapSeconds:0,nonOverlapping:true},
 {id:'checkin',label:'Daily 24h',source:'demo',durationSeconds:86400,
 ratePointsPerSecond:2,maxClaimsPerUtcDay:1,minGapSeconds:86400,nonOverlapping:true}];
function fakeDOM(){
 const nodes=new Map();
 function node(id){
  if(!nodes.has(id))nodes.set(id,{id,textContent:'',disabled:false,title:'',
   dataset:{},children:[],events:new Map(),addEventListener(name,fn){this.events.set(name,fn)},
   click(){this.events.get('click')?.()},
   appendChild(child){this.children.push(child)},
   replaceChildren(){this.children=[];}});
  return nodes.get(id);
 }
 node('plan-definitions').dataset.plans=JSON.stringify(seed);
 const a=node('btn-free'),b=node('btn-checkin');
 a.dataset.demoPlanId='free';b.dataset.demoPlanId='checkin';
 return {node,document:{getElementById:node,querySelectorAll(){return [a,b]},
   createElement(tagName){return {tagName,textContent:''}}}};
}
test('browser starts finite free and checkin contracts, ticks, claims and restores local state',()=>{
 const {node,document}=fakeDOM(),data=new Map();
 let now=Date.UTC(2026,9,17);
 const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 const app=mountContractDemo(document,{clock:()=>now,storage});
 assert.equal(app.installed,true);
 assert.equal(node('contract-active').textContent,'0');
 node('btn-free').click();
 assert.equal(node('contract-active').textContent,'1');
 assert.equal(node('btn-free').disabled,true);
 now+=3600000;
 app.refresh();
 assert.equal(node('contract-pending').textContent,'3,600');
 node('btn-checkin').click();
 assert.equal(node('contract-active').textContent,'2');
 now+=1000;
 app.refresh();
 assert.equal(node('contract-rate').textContent,'3 demo points/sec');
 node('contract-claim').click();
 assert.equal(node('contract-claimed').textContent,'3,603');
 assert.equal(node('contract-pending').textContent,'0');
 assert.match(node('contract-feedback').textContent,/not sats/);
 const resumed=mountContractDemo(document,{clock:()=>now,storage});
 assert.equal(resumed.installed,true);
 assert.equal(node('contract-active').textContent,'2');
});
test('absent Public plans leaves the existing arcade model unchanged',()=>{
 const {document,node}=fakeDOM();
 delete node('plan-definitions').dataset.plans;
 assert.equal(mountContractDemo(document).installed,false);
});
test('paid plan injected from client JSON is refused without activating controls',()=>{
 const {document,node}=fakeDOM();
 node('plan-definitions').dataset.plans=JSON.stringify([{...seed[0],rewardSats:'100'}]);
 const app=mountContractDemo(document,{clock:()=>Date.now()});
 assert.equal(app.installed,false);
 assert.equal(app.reason,'invalid-plan-config');
 assert.match(node('contract-feedback').textContent,/configuration unavailable/);
});
