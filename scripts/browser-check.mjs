import assert from 'node:assert/strict';

export async function check({ wait, click, evaluate, reload }) {
  const key = 'virtual-miner:local-demo:v1';
  const saved = name => JSON.parse(localStorage.getItem(name));
  await click('#arcade-mode:not([open]) > summary');
  await wait(() => document.querySelector('#claim')?.disabled === false);
  await click('#claim');
  const balance = (await evaluate(saved, key)).banked;
  assert.ok(balance > 0);
  await click('[data-demo-plan-id="free"]');
  await click('[data-demo-plan-id="checkin"]');
  await wait(() => document.querySelector('#contract-active').textContent === '2');
  await reload();
  await wait(() => document.querySelector('#contract-active')?.textContent === '2');
  assert.equal((await evaluate(saved, key)).banked, balance);
  await evaluate(name => localStorage.setItem(name, '{unreadable'), key);
  await reload();
  await click('#arcade-mode:not([open]) > summary');
  await wait(() => document.querySelector('#counter-save-status')?.textContent.includes('temporarily'));
  await wait(() => document.querySelector('#claim').disabled === false);
  await click('#claim');
  assert.equal(await evaluate(name => localStorage.getItem(name), key), '{unreadable');
  await click('#reset');
  const reset = await evaluate(saved, key);
  assert.equal(reset.banked, 0);
  assert.equal(reset.tier, 0);
  return {title:'Yet Another Bitcoin Cloud Miner', claimedDemoPoints:balance, restoredPlans:2,
    damagedCounter:'preserved until explicit reset'};
}
