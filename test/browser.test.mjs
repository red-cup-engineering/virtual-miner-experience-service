import test from 'node:test';
import assert from 'node:assert/strict';

test('browser event handlers claim, upgrade, boost and reset only local pretend points', async () => {
 const previous = {document:globalThis.document,localStorage:globalThis.localStorage,setInterval:globalThis.setInterval,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout,now:Date.now};
 let now = 100000;
 const nodes = new Map();
 const el = id => {if (!nodes.has(id)) nodes.set(id,{textContent:'',disabled:false,listeners:new Map(),addEventListener(type,fn){this.listeners.set(type,fn)},click(){this.listeners.get('click')?.()}});return nodes.get(id)};
 const memory=new Map();
 try {
  Date.now = () => now;
  globalThis.document = {getElementById:el};
  globalThis.localStorage = {getItem:key => memory.get(key) ?? null,setItem:(key,value) => memory.set(key,value)};
  let interval=null;
  globalThis.setInterval = fn => {interval=fn;return 1};
  globalThis.setTimeout=()=>1;globalThis.clearTimeout=()=>{};
  memory.set('yabcm:local-demo:v1',JSON.stringify({version:1,tier:0,banked:200,pending:0,allTime:200,lastTickMs:now,boostUntilMs:0}));
  await import('../src/browser.mjs');
  assert.equal(el('banked').textContent,'200');
  assert.equal(el('pending').textContent,'0');
  el('upgrade').click();assert.equal(el('tier').textContent,'Desktop thunder');
  el('boost').click();assert.match(el('boost').textContent,/active/);
  now+=1000;interval();assert.equal(el('pending').textContent,'6');
  el('claim').click();assert.equal(el('banked').textContent,'161');
  el('reset').click();assert.equal(el('banked').textContent,'0');
  assert.equal(JSON.parse(memory.get('yabcm:local-demo:v1')).banked,0);
 } finally {
  Date.now=previous.now;
  for (const key of ['document','localStorage','setInterval','setTimeout','clearTimeout']) {
   if (previous[key] === undefined) delete globalThis[key]; else globalThis[key]=previous[key];
  }
 }
});
