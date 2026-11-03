import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateConfig, renderHtml, build } from '../scripts/build.mjs';
const config={kind:'virtual-miner-public-site/v1', mode:'demo',host:'yabcm.assist.561.group',brand:'Yet Another Bitcoin Cloud Miner',description:'Demo-only cloud miner game',promotions:[{id:'news',kind:'house',label:'Koios.News',description:'News and analysis',href:'https://koios.news/'}]};

const appOwner = {
  repository:"causeway-services/public-services-section",
  path:"services/public-agent-services-section/sites/yabcm.assist.561.group",
};
const makeApp = () => ({
  id:"yabcm",name:config.brand,summary:config.description,
  owner:appOwner,status:"built",
  sources:["https://github.com/causeway-services/public-services-section/issues/64"],
});
const makeInstance = () => ({
  resourceType:"AssistPublicServiceInstance",schemaVersion:2,
  appId:"yabcm",host:"yabcm.assist.561.group",assistApexHost:"assist.561.group",
  authoritativeServiceSection:"causeway-services/public-services-section/services/public-agent-services-section",
  intendedBeneficiaries:"human players",servicePurpose:"free local browser simulation",
  declaredOperations:[
    {operationId:"play-local-mining-demo",interactionClass:"local-browser-simulation",
      sourceCapability:"source-implemented",publicAvailability:"not-independently-observed",
      customerMeaning:"Free local-only simulated mining, with no Bitcoin generated"},
    {operationId:"visit-first-party-house-offers",interactionClass:"external-navigation",
      sourceCapability:"source-implemented",publicAvailability:"not-independently-observed",
      customerMeaning:"Open house links, never for monetary rewards"},
    {operationId:"upgrade-virtual-rig",interactionClass:"nonredeemable-points-exchange",
      sourceCapability:"source-implemented",publicAvailability:"not-independently-observed",
      customerMeaning:"Exchange pretend credits for imaginary miner upgrades"},
    {operationId:"watch-ad-for-sats",interactionClass:"advertiser-funded-reward",
      sourceCapability:"not-implemented",publicAvailability:"disabled",
      customerMeaning:"No real advertiser payment or sats"},
    {operationId:"purchase-agent-service-x402",interactionClass:"paid-api-purchase",
      sourceCapability:"not-implemented",publicAvailability:"disabled",
      customerMeaning:"No x402 payment or actual purchases"},
  ],
  customerSafeguards:["No deposits, wallets, accounts, earning promises or advertiser payouts"],
  sourceLifecycle:"source-demo-not-received",
  sourceReferences:["https://github.com/causeway-services/public-services-section/issues/64"],
});
const gitBlob = bytes => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
const relativeApp = 'data/records/assist-apps/yabcm.json';
const relativeInstance = appOwner.path + '/assist-instance.json';

/**
 * A native integration fixture mimicking two independent Git owners and the
 * actual source-pinned Public site selector. No duplicated app identity is
 * admitted in site.json. These source fixtures do not claim public receiving.
 */
async function sourceFixture(root, {app=makeApp(),instance=makeInstance()}={}) {
  const assistRoot=join(root,'engineering'), publicRoot=join(root,'public');
  const put = async (base,path,record) => {
    const full=join(base,path), bytes=Buffer.from(JSON.stringify(record,null,2)+'\n');
    await mkdir(join(full,'..'),{recursive:true});
    await writeFile(full,bytes);
    return gitBlob(bytes);
  };
  const rosterSource={
    repository:'red-cup-engineering/assist',recordPath:relativeApp,
    gitBlobSha:await put(assistRoot,relativeApp,app),
  };
  const serviceInstanceSource={
    repository:appOwner.repository,recordPath:relativeInstance,
    gitBlobSha:await put(publicRoot,relativeInstance,instance),
  };
  const site={kind:config.kind,mode:config.mode,marketingDescription:config.description,
    promotions:config.promotions,rosterSource,serviceInstanceSource};
  const configPath=join(root,'site.json');
  await writeFile(configPath,JSON.stringify(site,null,2)+'\n');
  return {site,app,instance,assistRoot,publicRoot,configPath,
    outPath:join(root,'dist'),put};
}

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
test('original ASSIST app and Public service instance actually drive the built site and standard linked data',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'virtual-miner-'));
 try {
  const fixture=await sourceFixture(dir);
  const {files}=await build(fixture);
  assert.equal(files.length,11);
  assert.ok(files.includes('assets/regtest-catalog-client.mjs'));
  assert.ok(files.includes('assets/contract-experience.mjs'));
  assert.ok(files.includes('api/application.jsonld'));
  const html=await readFile(join(dir,'dist/index.html'),'utf8');
  const status=JSON.parse(await readFile(join(dir,'dist/api/status.json'),'utf8'));
  const ld=JSON.parse(await readFile(join(dir,'dist/api/application.jsonld'),'utf8'));
  assert.match(html,/Yet Another Bitcoin Cloud Miner/);
  assert.match(html,/What this game can and cannot do/);
  assert.match(html,/Free local-only simulated mining/);
  assert.match(html,/No real advertiser payment or sats/);
  assert.match(html,/Watch ad → real sats \(not available\)/);
  assert.equal(status.realBitcoinMining,false);assert.equal(status.realRewardsEnabled,false);
  assert.equal(status.x402PaymentsEnabled,false);assert.equal(status.playableDemo,true);
  assert.equal(status.publicReceiving,'not-independently-observed');
  assert.equal(status.authoritativeApp.name,fixture.app.name);
  assert.equal(status.authoritativeApp.host,'yabcm.assist.561.group');
  assert.deepEqual(status.declaredOperations.map(x=>x.operationId),
    fixture.instance.declaredOperations.map(x=>x.operationId));
  assert.equal(status.declaredOperations[3].publicAvailability,'disabled');
  assert.equal(ld['@type'],'SoftwareApplication');
  assert.equal(ld['@context']['@vocab'],'https://schema.org/');
  assert.equal(ld.name,fixture.app.name);
  assert.equal(ld.featureList.length,3);
  assert.equal(ld['prov:wasDerivedFrom'].length,2);
  const headers=await readFile(join(dir,'dist/_headers'),'utf8');
  assert.match(headers,/script-src 'self'/);
  assert.match(headers,/connect-src 'self'/);
  assert.match(headers,/\/api\/application\.jsonld[\s\S]*Content-Type: application\/ld\+json; charset=utf-8/);
 } finally { await rm(dir,{recursive:true,force:true}); }
});

test('customer-owned time-limited contracts render and cannot smuggle BTC entitlements',()=>{
 const plans=[{id:'free',label:'Claim a free 8-hour demo',source:'demo',
  durationSeconds:28800,ratePointsPerSecond:1,maxClaimsPerUtcDay:3,
  minGapSeconds:0,nonOverlapping:true}];
 const html=renderHtml({...config,simulationPlans:plans});
 assert.match(html,/data-demo-plan-id="free"/);
 assert.match(html,/id="contract-list"/);
 assert.match(html,/id="plan-definitions"/);
 assert.match(html,/id="arcade-mode"/);
 assert.match(html,/id="regtest-capacity"/);
 assert.match(html,/Developer laboratory/);
 assert.match(html,/separate pretend balance/);
 assert.ok(html.indexOf('id="contract-heading"') < html.indexOf('id="arcade-mode"'));
 assert.match(html,/independent from your eight-hour and daily contracts/);
 assert.match(html,/demo points\/sec/);
 assert.doesNotMatch(html,/paid \(active\)/);
 assert.throws(()=>validateConfig({...config,simulationPlans:[{...plans[0],rewardSats:'50'}]}),/cannot promise/);
});


test('a renamed authoritative roster app changes real HTML while the site holds no shadow brand',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'virtual-miner-renamed-'));
 try {
  const renamed=makeApp();renamed.name='A deliberately different demo brand';
  const fx=await sourceFixture(dir,{app:renamed});
  assert.equal(fx.site.brand,undefined);
  assert.equal(fx.site.host,undefined);
  await build(fx);
  assert.match(await readFile(join(fx.outPath,'index.html'),'utf8'),/A deliberately different demo brand/);
  const status=JSON.parse(await readFile(join(fx.outPath,'api/status.json'),'utf8'));
  assert.equal(status.authoritativeApp.name,renamed.name);
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('source bytes drift, identity substitution and money-operation promotion refuse before build side effects',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'virtual-miner-denial-'));
 try {
  const fx=await sourceFixture(dir);
  const run=()=>build(fx);
  const assertAbsent=async()=>assert.rejects(readFile(join(fx.outPath,'index.html')),/ENOENT/);
  await assertAbsent();
  await fx.put(fx.publicRoot,relativeInstance,{...fx.instance,
    declaredOperations:fx.instance.declaredOperations.map(op=>op.operationId==='watch-ad-for-sats'
      ? {...op,sourceCapability:'source-implemented',publicAvailability:'not-independently-observed'}
      : op)});
  await assert.rejects(run(),/source does not match the selected Git blob/);
  await assertAbsent();
  // Even if the Public caller repins its own changed bytes, the original
  // Engineering game cannot enable an advertiser-funded financial action.
  const modified=JSON.parse(await readFile(join(fx.publicRoot,relativeInstance),'utf8'));
  fx.site.serviceInstanceSource.gitBlobSha=await fx.put(fx.publicRoot,relativeInstance,modified);
  await writeFile(fx.configPath,JSON.stringify(fx.site));
  await assert.rejects(run(),/cannot invent or enable operation/);
  await assertAbsent();
  // A marketing file cannot override the authoritative Assist roster.
  fx.site.brand='Unreviewed merchant identity';
  await writeFile(fx.configPath,JSON.stringify(fx.site));
  await assert.rejects(run(),/shadow brand/);
  await assertAbsent();
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('a different source owner, missing pin or redirected path never becomes a product',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'virtual-miner-origins-'));
 try {
  const fx=await sourceFixture(dir);
  const run=()=>build(fx);
  fx.site.serviceInstanceSource.recordPath='../arbitrary.json';
  await writeFile(fx.configPath,JSON.stringify(fx.site));
  await assert.rejects(run(),/must select its real ASSIST app/);
  fx.site.serviceInstanceSource.recordPath=relativeInstance;
  fx.site.rosterSource.repository='fake-person/fake-frontend';
  await writeFile(fx.configPath,JSON.stringify(fx.site));
  await assert.rejects(run(),/exact original repository/);
  await assert.rejects(build({...fx,assistRoot:undefined}),/assist-root/);
 } finally {await rm(dir,{recursive:true,force:true});}
});
