import test from 'node:test';
import assert from 'node:assert/strict';
import { TIERS, newDemo, admitDemo, advanceDemo, claimDemo, upgradeDemo, boostDemo, MAX_OFFLINE_MS } from '../src/model.mjs';
const SECOND=1000;
test('starts with zero virtual balance and exact declared local tier',()=>{
 const state=newDemo(100000); assert.equal(state.banked,0);assert.equal(state.pending,0);assert.equal(TIERS[state.tier].rate,1);
});
test('only complete simulated seconds accrue and local claim never creates BTC',()=>{
 let s=newDemo(100000);s=advanceDemo(s,100000+3300);assert.equal(s.pending,3);
 const out=claimDemo(s,103300);assert.equal(out.claimed,3);assert.equal(out.state.pending,0);assert.equal(out.state.banked,3);
 for(const key of ['btc','sats','wallet','paid']) assert.equal(key in out.state,false);
});
test('offline accrual caps at one hour; future time cannot be abused without limit',()=>{
 const s=advanceDemo(newDemo(100000),100000+24*3600*1000);
 assert.equal(s.pending,MAX_OFFLINE_MS/SECOND);assert.equal(s.lastTickMs,100000+24*3600*1000);
});
test('clock going backward neither subtracts nor mints points',()=>{
 const s=advanceDemo(newDemo(10000),9000);assert.equal(s.pending,0);assert.equal(s.lastTickMs,10000);
});
test('virtual upgrades spend only claimed local points, no real money',()=>{
 let s=advanceDemo(newDemo(100000),130000);
 assert.equal(upgradeDemo(s,130000).reason,'insufficient-demo-points');
 s=claimDemo(s,130000).state;const out=upgradeDemo(s,130000);
 assert.equal(out.upgraded,true);assert.equal(out.state.tier,1);assert.equal(out.state.banked,5);
 assert.equal(advanceDemo(out.state,131000).pending,3);
});
test('2x virtual boost consumes demo points, expires, and cannot overlap',()=>{
 let s=claimDemo(advanceDemo(newDemo(100000),140000),140000).state;
 const first=boostDemo(s,140000);assert.equal(first.boosted,true);assert.equal(first.state.banked,20);
 assert.equal(boostDemo(first.state,141000).reason,'boost-active');
 const mid=advanceDemo(first.state,150000);assert.equal(mid.pending,20);
 const end=advanceDemo(mid,171000);assert.equal(end.pending,61);
});
test('tampered malformed device-local state refuses, never becomes verified economic value',()=>{
 assert.throws(()=>admitDemo({...newDemo(1000),banked:-1}),/invalid/);
 assert.throws(()=>admitDemo({...newDemo(1000),tier:99}),/invalid/);
 assert.throws(()=>newDemo(-1),/timestamp/);
 assert.throws(()=>advanceDemo(newDemo(1000),Infinity),/timestamp/);
});
