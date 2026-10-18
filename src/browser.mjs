import { newDemo, admitDemo, advanceDemo, claimDemo, upgradeDemo, boostDemo, TIERS, BOOST_COST } from './model.mjs';

const $ = (id) => document.getElementById(id);
const storageKey = 'yabcm:local-demo:v1';
const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
function read() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? admitDemo(JSON.parse(raw)) : newDemo(Date.now());
  } catch {
    return newDemo(Date.now());
  }
}
let state = read();
let noticeTimeout;
function save() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* private mode */ } }
function notice(message) {
  $('feedback').textContent = message;
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => { $('feedback').textContent = ''; }, 4000);
}
function view() {
  const now = Date.now();
  state = advanceDemo(state, now);
  save();
  const tier = TIERS[state.tier];
  const next = TIERS[state.tier + 1];
  const boostSeconds = Math.max(0, Math.ceil((state.boostUntilMs - now) / 1000));
  $('pending').textContent = fmt.format(state.pending);
  $('banked').textContent = fmt.format(state.banked);
  $('rate').textContent = `${fmt.format(tier.rate * (boostSeconds ? 2 : 1))} points / sec`;
  $('tier').textContent = tier.name;
  $('tier-multiplier').textContent = `${tier.multiple}× base rate`;
  $('all-time').textContent = fmt.format(state.allTime);
  $('claim').disabled = state.pending === 0;
  $('upgrade').disabled = !next || state.banked < next.cost;
  $('upgrade').textContent = next ? `Upgrade to ${next.name} · ${fmt.format(next.cost)} demo points` : 'Maximum virtual tier reached';
  $('boost').disabled = Boolean(boostSeconds) || state.banked < BOOST_COST;
  $('boost').textContent = boostSeconds ? `2× boost active · ${boostSeconds}s left` : `2× boost for 30 seconds · ${BOOST_COST} demo points`;
}
$('claim').addEventListener('click', () => {
  const result = claimDemo(state, Date.now()); state = result.state;
  if (result.claimed) notice(`Claimed ${fmt.format(result.claimed)} pretend points. Zero BTC transferred.`);
  view();
});
$('upgrade').addEventListener('click', () => {
  const result = upgradeDemo(state, Date.now()); state = result.state;
  if (result.upgraded) notice(`Virtual rig upgraded to ${TIERS[state.tier].name}.`);
  view();
});
$('boost').addEventListener('click', () => {
  const result = boostDemo(state, Date.now()); state = result.state;
  if (result.boosted) notice('30-second virtual boost activated. No real mining involved.');
  view();
});
$('reset').addEventListener('click', () => {
  state = newDemo(Date.now()); save(); view(); notice('Local demo reset. Nothing real was ever earned.');
});
view();
setInterval(view, 1000);
