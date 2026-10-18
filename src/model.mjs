/** Local-only, nonredeemable demonstration economy. No currency, no user funds. */
export const TIERS = Object.freeze([
  Object.freeze({ name: 'Pocket cloud', cost: 0, rate: 1, multiple: 1 }),
  Object.freeze({ name: 'Desktop thunder', cost: 25, rate: 3, multiple: 3 }),
  Object.freeze({ name: 'Garage nebula', cost: 125, rate: 8, multiple: 8 }),
  Object.freeze({ name: 'Warehouse dreams', cost: 650, rate: 20, multiple: 20 }),
  Object.freeze({ name: 'Imaginary hyperscaler', cost: 3000, rate: 48, multiple: 48 }),
]);
export const BOOST_COST = 20;
export const BOOST_DURATION_MS = 30000;
export const MAX_OFFLINE_MS = 3600000;
export const MAX_DEMO_BALANCE = 1000000000;
const safeInt = (n) => Number.isSafeInteger(n) && n >= 0;
const clampBalance = n => Math.min(n, MAX_DEMO_BALANCE);
export function newDemo(now) {
  if (!safeInt(now)) throw new TypeError('timestamp must be a nonnegative safe integer');
  return { version: 1, tier: 0, banked: 0, pending: 0, allTime: 0, lastTickMs: now, boostUntilMs: 0 };
}
export function admitDemo(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) ||
    candidate.version !== 1 || !safeInt(candidate.tier) || candidate.tier >= TIERS.length ||
    !['banked', 'pending', 'allTime'].every(key => safeInt(candidate[key]) && candidate[key] <= MAX_DEMO_BALANCE) ||
    !safeInt(candidate.lastTickMs) || !safeInt(candidate.boostUntilMs)) {
    throw new TypeError('invalid local demo state');
  }
  // The browser can tamper with this local game, which is fine: no economic claims.
  return { version: 1, tier: candidate.tier, banked: candidate.banked, pending: candidate.pending,
    allTime: candidate.allTime, lastTickMs: candidate.lastTickMs, boostUntilMs: candidate.boostUntilMs };
}
export function advanceDemo(candidate, now) {
  const state = admitDemo(candidate);
  if (!safeInt(now)) throw new TypeError('timestamp must be a nonnegative safe integer');
  if (now <= state.lastTickMs) return state;
  const elapsedSeconds = Math.floor(Math.min(now - state.lastTickMs, MAX_OFFLINE_MS) / 1000);
  if (!elapsedSeconds) return state;
  const base = TIERS[state.tier].rate;
  const activeBoostSeconds = Math.min(elapsedSeconds,
    Math.max(0, Math.ceil((state.boostUntilMs - state.lastTickMs) / 1000)));
  const earned = elapsedSeconds * base + activeBoostSeconds * base;
  return {
    ...state,
    pending: clampBalance(state.pending + earned),
    allTime: clampBalance(state.allTime + earned),
    // Discard beyond one hour rather than granting unlimited offline progress.
    lastTickMs: now - state.lastTickMs > MAX_OFFLINE_MS ? now : state.lastTickMs + elapsedSeconds * 1000,
  };
}
export function claimDemo(candidate, now) {
  const state = advanceDemo(candidate, now);
  if (state.pending === 0) return { state, claimed: 0 };
  return { state: { ...state, banked: clampBalance(state.banked + state.pending), pending: 0 }, claimed: state.pending };
}
export function upgradeDemo(candidate, now) {
  const state = advanceDemo(candidate, now);
  const next = TIERS[state.tier + 1];
  if (!next) return { state, upgraded: false, reason: 'max-tier' };
  if (state.banked < next.cost) return { state, upgraded: false, reason: 'insufficient-demo-points' };
  return { state: { ...state, banked: state.banked - next.cost, tier: state.tier + 1 }, upgraded: true };
}
export function boostDemo(candidate, now) {
  const state = advanceDemo(candidate, now);
  if (state.boostUntilMs > now) return { state, boosted: false, reason: 'boost-active' };
  if (state.banked < BOOST_COST) return { state, boosted: false, reason: 'insufficient-demo-points' };
  return { state: { ...state, banked: state.banked - BOOST_COST, boostUntilMs: now + BOOST_DURATION_MS }, boosted: true };
}
