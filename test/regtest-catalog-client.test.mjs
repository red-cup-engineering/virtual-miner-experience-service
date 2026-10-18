import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeRegtestCatalog,mountRegtestCatalogPreview} from '../src/regtest-catalog-client.mjs';
const regtest={kind:'RewardContractCatalogRegtest.v1',mainnetSalesEnabled:false,entries:[
 {id:'test-free',availability:{available:true,reason:'capacity-quoted'}},
 {id:'test-other',availability:{available:false,reason:'sold-out'}}
]};
test('read-only regtest results disclose counts but no raw wallet or customer balances',()=>{
 const x=summarizeRegtestCatalog(regtest);
 assert.equal(x.quoted,1);assert.equal(x.paused,1);
 assert.match(x.message,/No mainnet sales/);
 assert.equal('walletId' in x,false);assert.equal('balance' in x,false);
});
test('reject commercial or malformed catalog identity rather than upgrading UI into a payment claim',()=>{
 assert.throws(()=>summarizeRegtestCatalog({...regtest,mainnetSalesEnabled:true}),/regtest/);
 assert.throws(()=>summarizeRegtestCatalog({...regtest,kind:'ProductionBitcoinCatalog'}),/regtest/);
 assert.throws(()=>summarizeRegtestCatalog({...regtest,entries:[{id:'x'}]}),/incomplete/);
});
test('browser reads same-origin catalog without cookies, keys or payment effects',async()=>{
 const node={textContent:''};let called=null;
 const app=mountRegtestCatalogPreview({getElementById:()=>node},{fetcher:async(url,init)=>{
  called={url,init};return {ok:true,json:async()=>regtest};
 }});
 const result=await app.refresh();
 assert.equal(result.status,'regtest-read-only');
 assert.equal(called.url,'/v1/catalog');
 assert.equal(called.init.credentials,'omit');
 assert.equal(called.init.method,'GET');
 assert.equal(called.init.cache,'no-store');
 assert.match(node.textContent,/Regtest developer lab only/);
});
test('missing regtest backend shows a working virtual-only game instead of invented capacity',async()=>{
 const node={textContent:''};
 const app=mountRegtestCatalogPreview({getElementById:()=>node},{fetcher:async()=>{throw Error('offline');}});
 const result=await app.refresh();
 assert.equal(result.status,'disconnected');
 assert.match(node.textContent,/no real sats are being earned/);
});
test('without a mounted consumer there is no network request',async()=>{
 const app=mountRegtestCatalogPreview({getElementById:()=>null},{fetcher:()=>{throw Error('should not run')}});
 assert.equal(app.installed,false);
 assert.equal((await app.refresh()).status,'absent');
});
