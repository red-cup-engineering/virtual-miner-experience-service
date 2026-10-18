import test from 'node:test';
import assert from 'node:assert/strict';
import {projectPublishedMiningIndex as estimate} from '../src/mining-index.mjs';
const scenario={sourceRef:'urn:scientific:illustrative-network:2026-10-17',
 observedAt:'2026-10-17T23:00:00Z',displayHashrateGh:'3.39',
 networkHashrateEh:'712',blocksPerHourNum:'6',blocksPerHourDen:'1',
 blockRewardSats:'314500000',durationSeconds:'28800',illustrativeMultiplierBps:'10000'};
test('8h free screen analog is sub-sat and not a wallet credit',()=>{
 const q=estimate(scenario);
 assert.equal(q.expectedWholeMilliSats,'71');
 assert.equal(q.expectedWholeSats,'0');
 assert.equal(q.payable,false);
 assert.equal(q.networkMiningPerformed,false);
});
test('109.16 GH/s paid plan analog over 30 days gives >200 sats but no implied profit',()=>{
 const q=estimate({...scenario,displayHashrateGh:'109.16',durationSeconds:String(30*86400)});
 assert.equal(q.expectedWholeSats,'208');
 assert.equal(q.payable,false);
});
test('published boost multiplies the expected rational index',()=>{
 const one=estimate(scenario),boosted=estimate({...scenario,illustrativeMultiplierBps:'49000'});
 assert.ok(BigInt(boosted.expectedWholeMilliSats)>BigInt(one.expectedWholeMilliSats));
});
test('missing network quote or source timestamps cannot be guessed',()=>{
 assert.throws(()=>estimate({...scenario,networkHashrateEh:undefined}),/decimal string/);
 assert.throws(()=>estimate({...scenario,sourceRef:''}),/sourceRef/);
 assert.throws(()=>estimate({...scenario,observedAt:'yesterday'}),/UTC timestamp/);
});
test('precision domains disallow floating inputs that silently create satoshis',()=>{
 assert.throws(()=>estimate({...scenario,blockRewardSats:314500000}),/number string/);
 assert.throws(()=>estimate({...scenario,displayHashrateGh:'3.3900007'}),/decimal string/);
});
