import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateConfig, renderHtml, build } from '../scripts/build.mjs';
const config={kind:'virtual-miner-public-site/v1', mode:'demo',host:'yabcm.assist.561.group',brand:'Yet Another Bitcoin Cloud Miner',description:'Demo-only cloud miner game',promotions:[{id:'news',kind:'house',label:'Koios.News',description:'News and analysis',href:'https://koios.news/'}]};
test('public config allows only truthful demo and known 561 house destinations',()=>{
 assert.equal(validateConfig(config),config);
 assert.throws(()=>validateConfig({...config,mode:'paid'}),/demo/);
 assert.throws(()=>validateConfig({...config,promotions:[{...config.promotions[0],href:'javascript:alert(1)'}]}),/HTTPS/);
 assert.throws(()=>validateConfig({...config,promotions:[{...config.promotions[0],kind:'rewarded'}]}),/third-party/);
});
test('brand and house creative text are escaped against HTML injection',()=>{
 const html=renderHtml({...config,brand:'Miner <img src=x onerror=alert(1)>',promotions:[{...config.promotions[0],label:'<script>alert(1)</script>'}]});
 assert.ok(html.includes('Miner &lt;img'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.equal(html.includes('<script>alert(1)</script>'),false);
});
test('static web build materializes a deployable self-contained asset tree and honest status',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'virtual-miner-'));
 try {
  await writeFile(join(dir,'site.json'),JSON.stringify(config));
  const {files}=await build({configPath:join(dir,'site.json'),outPath:join(dir,'dist')});
  assert.equal(files.length,7);
  const html=await readFile(join(dir,'dist/index.html'),'utf8');
  const status=JSON.parse(await readFile(join(dir,'dist/api/status.json'),'utf8'));
  assert.match(html,/Yet Another Bitcoin Cloud Miner/);
  assert.match(html,/Watch ad → real sats \(not available\)/);
  assert.equal(status.realBitcoinMining,false);assert.equal(status.realRewardsEnabled,false);
  assert.equal(status.x402PaymentsEnabled,false);assert.equal(status.playableDemo,true);
  const headers=await readFile(join(dir,'dist/_headers'),'utf8');
  assert.match(headers,/script-src 'self'/);
  assert.match(headers,/connect-src 'none'/);
 } finally { await rm(dir,{recursive:true,force:true}); }
});
