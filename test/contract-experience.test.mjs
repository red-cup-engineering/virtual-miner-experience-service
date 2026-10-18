import test from "node:test";
import assert from "node:assert/strict";
import {
 admitSimulationPlans, newContractSession, projectContractSession,
 startSimulationContract, claimSimulationPoints,
} from "../src/contract-experience.mjs";

const day=86400000;
const start=Date.UTC(2026,9,17);
const plans=[
 {id:"free",label:"Eight-hour free contract",source:"demo",durationSeconds:8*3600,ratePointsPerSecond:1,maxClaimsPerUtcDay:3,minGapSeconds:0,nonOverlapping:true},
 {id:"checkin",label:"24-hour check-in contract",source:"demo",durationSeconds:24*3600,ratePointsPerSecond:2,maxClaimsPerUtcDay:1,minGapSeconds:24*3600,nonOverlapping:true}
];
const issued=(state,id,time)=>{
 const r=startSimulationContract(state,plans,id,time);
 assert.equal(r.accepted,true,r.reason);
 return r.state;
};
test("free claim is finite and expires on its authored UTC second",()=>{
 let s=issued(newContractSession(start),"free",start);
 const middle=projectContractSession(s,plans,start+4*3600000);
 assert.equal(middle.active.length,1);
 assert.equal(middle.pendingDemoPoints,14400);
 assert.equal(middle.active[0].secondsLeft,14400);
 const ended=projectContractSession(s,plans,start+8*3600000);
 assert.equal(ended.active.length,0);
 assert.equal(ended.pendingDemoPoints,28800);
 assert.equal(ended.currentPointsPerSecond,0);
});
test("coexisting 8h and 24h plans accumulate independent rates",()=>{
 let s=issued(newContractSession(start),"free",start);
 s=issued(s,"checkin",start);
 const p=projectContractSession(s,plans,start+10000);
 assert.equal(p.active.length,2);
 assert.equal(p.currentPointsPerSecond,3);
 assert.equal(p.pendingDemoPoints,30);
});
test("free plan can't be restarted while running",()=>{
 const s=issued(newContractSession(start),"free",start);
 const result=startSimulationContract(s,plans,"free",start+1000);
 assert.equal(result.accepted,false);
 assert.equal(result.reason,"still-active");
 assert.equal(result.state.contracts.length,1);
});
test("at most three free claims within a UTC day",()=>{
 let s=newContractSession(start);
 for(let i=0;i<3;i++)s=issued(s,"free",start+i*8*3600000);
 const denied=startSimulationContract(s,plans,"free",start+day-1000);
 assert.equal(denied.accepted,false);
 s=issued(s,"free",start+day);
 assert.equal(s.contracts.length,4);
});
test("daily checkin has a full cooldown and may run alongside free plan",()=>{
 let s=issued(newContractSession(start),"checkin",start);
 assert.equal(startSimulationContract(s,plans,"checkin",start+3600000).accepted,false);
 s=issued(s,"checkin",start+day);
 assert.equal(s.contracts.length,2);
});
test("collecting earned points cannot mint Bitcoin, double claim, or extend a contract",()=>{
 let s=issued(newContractSession(start),"free",start);
 const a=claimSimulationPoints(s,plans,start+5000);
 assert.equal(a.claimed,5);
 const b=claimSimulationPoints(a.state,plans,start+5000);
 assert.equal(b.claimed,0);
 assert.equal(projectContractSession(b.state,plans,start+5000).bitcoinEarnedSats,0);
 assert.equal(b.state.contracts[0].expiresSec,s.contracts[0].expiresSec);
});
test("a future or forged plan expiry is rejected",()=>{
 const s=issued(newContractSession(start),"free",start);
 assert.throws(()=>projectContractSession({...s,contracts:[{...s.contracts[0],expiresSec:s.contracts[0].expiresSec+1000}]},plans,start),/duration/);
});
test("caller cannot submit a paid plan or Bitcoin-denominated browser plan",()=>{
 assert.throws(()=>admitSimulationPlans([{...plans[0],rewardSats:"10"}]),/cannot promise/);
 assert.throws(()=>admitSimulationPlans([{...plans[0],paid:true}]),/cannot promise/);
 assert.throws(()=>admitSimulationPlans([{...plans[0],source:"partner-paid"}]),/cannot promise/);
 assert.throws(()=>admitSimulationPlans([{...plans[0],hashrate:5}]),/cannot promise/);
});
test("source rejects duplicated plan IDs and malformed amounts",()=>{
 assert.throws(()=>admitSimulationPlans([plans[0],plans[0]]),/duplicate/);
 assert.throws(()=>admitSimulationPlans([{...plans[0],ratePointsPerSecond:-1}]),/bounded/);
 assert.throws(()=>admitSimulationPlans([{...plans[0],durationSeconds:365*86400+1}]),/bounded/);
});
test("zero or backward local clock increments don't mint or double count",()=>{
 const s=issued(newContractSession(start),"free",start);
 const a=claimSimulationPoints(s,plans,start+5000);
 const p=projectContractSession(a.state,plans,start+1000);
 assert.equal(p.pendingDemoPoints,0);
 assert.equal(p.claimedDemoPoints,5);
 assert.equal(p.asOfSec,a.state.lastObservedSec);
});
test("claimed balance cannot be greater than earned at checkpoint",()=>{
 const s=issued(newContractSession(start),"free",start);
 assert.throws(()=>projectContractSession({...s,claimedPoints:99},plans,start),/exceed/);
});
test("unknown plan is refused and leaves session unchanged",()=>{
 const s=newContractSession(start);
 const r=startSimulationContract(s,plans,"fake",start);
 assert.equal(r.accepted,false);
 assert.equal(r.state,s);
});
