#!/usr/bin/env node
/** One reusable publisher: consumer chooses its name, offers and domain. */
import { readFile, writeFile, mkdir, copyFile, realpath, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname, resolve, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { admitSimulationPlans } from '../src/contract-experience.mjs';
import { projectAssistPublicServiceInstance } from '@red-cup-engineering/assist/public-service-instance';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const gitBlobSha = /^[a-f0-9]{40}$/u;
/** Read exactly one original selected Git source, without following symlinks. */
async function readPinnedOriginal({root: selectedRoot, spec, expectedRepository, allowedPath}) {
  if (typeof selectedRoot !== 'string' || !isAbsolute(selectedRoot) ||
      !spec || Object.keys(spec).sort().join('|') !== 'gitBlobSha|recordPath|repository' ||
      spec.repository !== expectedRepository ||
      typeof spec.recordPath !== 'string' || !allowedPath.test(spec.recordPath) ||
      !gitBlobSha.test(spec.gitBlobSha ?? '')) {
    throw new TypeError('virtual miner needs the exact original repository, typed path and pinned Git blob');
  }
  const base = await realpath(selectedRoot);
  const target = resolve(base, spec.recordPath);
  if (!target.startsWith(base + sep) || await realpath(target) !== target) {
    throw new TypeError('virtual miner rejects redirected original source paths');
  }
  const stat = await lstat(target);
  if (!stat.isFile() || stat.size < 1 || stat.size > 1_048_576) {
    throw new TypeError('virtual miner source must be one bounded regular file');
  }
  const bytes = await readFile(target);
  const observed = createHash('sha1').update('blob ' + bytes.length + '\0')
    .update(bytes).digest('hex');
  if (observed !== spec.gitBlobSha) {
    throw new TypeError('virtual miner source does not match the selected Git blob');
  }
  return Object.freeze({
    document: JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes)),
    sourceDigest: 'ni:///sha-256;' + createHash('sha256').update(bytes).digest('base64url'),
    source: Object.freeze({...spec}),
  });
}

/**
 * Original Web Game Engineering effect ceiling. Source may truthfully declare
 * what is absent, but cannot create a payment, sponsor SDK, wallet or sats
 * settlement merely by claiming its operation is ready.
 */
function admitVirtualMinerOperationalCeiling(operations) {
  const allowed = new Map([
    ['play-local-mining-demo', ['local-browser-simulation','source-implemented','not-independently-observed']],
    ['visit-first-party-house-offers', ['external-navigation','source-implemented','not-independently-observed']],
    ['upgrade-virtual-rig', ['nonredeemable-points-exchange','source-implemented','not-independently-observed']],
    ['watch-ad-for-sats', ['advertiser-funded-reward','not-implemented','disabled']],
    ['purchase-agent-service-x402', ['paid-api-purchase','not-implemented','disabled']],
  ]);
  if (!Array.isArray(operations) || operations.length !== allowed.size) {
    throw new TypeError('virtual miner needs exactly its five declared, financially inert operations');
  }
  for (const op of operations) {
    const required = allowed.get(op.operationId);
    if (!required || [op.interactionClass,op.sourceCapability,op.publicAvailability]
      .some((value,i)=>value!==required[i])) {
      throw new TypeError('virtual miner cannot invent or enable operation: '+op.operationId);
    }
    allowed.delete(op.operationId);
  }
  if (allowed.size) throw new TypeError('virtual miner needs every explicitly disabled monetary operation');
}

const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
function validText(value, name) {
  if (typeof value !== 'string' || !value.trim() || value.length > 240) throw new TypeError(`${name} must be nonempty short text`);
  return value;
}
export function validateConfig(config) {
  if (!config || config.kind !== 'virtual-miner-public-site/v1' || config.mode !== 'demo')
    throw new TypeError('site config must be a virtual-miner-public-site/v1 demo');
  const { brand, description, host, promotions } = config;
  validText(brand, 'brand'); validText(description, 'description');
  if (typeof host !== 'string' || !/^[a-z0-9-]+\.assist\.561\.group$/u.test(host))
    throw new TypeError('site host must be a specific ASSIST subdomain');
  if (!Array.isArray(promotions) || promotions.length > 6) throw new TypeError('promotions must be an array of at most six');
  const ids = new Set();
  for (const [i, p] of promotions.entries()) {
    validText(p.id, `promotions[${i}].id`);
    if (!/^[a-z0-9-]+$/u.test(p.id) || ids.has(p.id)) throw new TypeError('promotion ids must be unique slugs');
    ids.add(p.id);
    validText(p.label, 'promotion label');validText(p.description, 'promotion description');
    if (p.kind !== 'house') throw new TypeError('sponsor payouts and third-party advertising not yet supported');
    let url;
    try { url = new URL(p.href); } catch { throw new TypeError('promotion URL invalid'); }
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !(url.hostname === 'koios.news' || url.hostname === '561.group' || url.hostname.endsWith('.561.group')))
      throw new TypeError('demo house promotion URL must be a verified HTTPS 561 public property');
  }
  if (config.simulationPlans !== undefined) admitSimulationPlans(config.simulationPlans);
  return config;
}
export function renderHtml(config, serviceProjection = null) {
  validateConfig(config);
  const cards = config.promotions.map(p => `<article class="promo"><span class="small-label">From 561 Group · No reward</span><h3>${esc(p.label)}</h3><p>${esc(p.description)}</p><a rel="noopener noreferrer" href="${esc(p.href)}">Explore ${esc(p.label)} →</a></article>`).join('\n');

  const plans = config.simulationPlans ?? [];
  const planButtons = plans.map(p => '<button type="button" class="secondary" data-demo-plan-id="' + esc(p.id) + '">' +
    esc(p.label) + ' · ' + (p.durationSeconds / 3600) + 'h</button>').join('');
  const contractSection = plans.length ? '<section class="panel widepanel" aria-labelledby="contract-heading">' +
    '<div class="small-label">Finite contracts · Browser-only · Demo credits</div>' +
    '<h2 id="contract-heading">Your imaginary mining contracts</h2>' +
    '<p>Start a free plan or claim your daily check-in. Independent timers stack, then expire. These produce only pretend points. No paid ad, miner purchase, or Bitcoin payout happens here.</p>' +
    '<div class="contract-buttons">' + planButtons + '</div>' +
    '<div class="stats"><div class="stat"><span class="small-label">Active contracts</span><b id="contract-active">0</b></div>' +
    '<div class="stat"><span class="small-label">Virtual contract rate</span><b id="contract-rate">0 demo points/sec</b></div>' +
    '<div class="stat"><span class="small-label">Unclaimed demo points</span><b id="contract-pending">0</b></div>' +
    '<div class="stat"><span class="small-label">Collected demo points</span><b id="contract-claimed">0</b></div></div>' +
    '<ul id="contract-list" class="contract-list" aria-label="Current virtual contracts"></ul>' +
    '<button id="contract-claim" class="wide" type="button">Collect demo points</button>' +
    '<p id="contract-feedback" role="status" aria-live="polite" class="feedback"></p>' +
    '<div hidden id="plan-definitions" data-plans="' + esc(JSON.stringify(plans)) + '"></div>' +
    '<p class="fine muted">UTC claim limits and expiry are enforced locally for play; reload keeps your progress on this device. Browser storage is not trusted money accounting.</p>' +
    '</section>' : '';
  const serviceSection = !serviceProjection ? '' :
    '<section class="panel widepanel" aria-labelledby="service-capabilities">' +
    '<div class="small-label">ASSIST service truth · source-built, public receipt unverified</div>' +
    '<h2 id="service-capabilities">What this game can and cannot do</h2>' +
    '<p>Browser-only play and house navigation are source-implemented. Real sats, sponsored ads and agent-paid purchases are disabled.</p>' +
    '<ul>' + serviceProjection.declaredOperations.map(op =>
      '<li><strong>' + esc(op.operationId.replaceAll('-', ' ')) + '</strong> — ' +
      esc(op.customerMeaning) + ' (' + esc(op.sourceCapability) + ', ' +
      esc(op.publicAvailability) + ')</li>').join('') + '</ul>' +
    '<p><a href="/api/status.json">Source-qualified operations</a> · ' +
    '<a href="/api/application.jsonld">SoftwareApplication JSON-LD</a></p></section>';
  const regtestSection = '<details class="panel widepanel" id="regtest-lab">' +
    '<summary class="arcade-summary">Developer laboratory · read-only regtest availability</summary>' +
    '<p id="regtest-capacity" role="status" aria-live="polite">' +
    'Regtest backend not connected. No real Bitcoin or paid ad rewards are enabled.' +
    '</p><p class="fine muted">This is not checkout, a wallet or a balance. Only an installed local regtest operator service can provide a capacity quote. All financial actions remain disabled.</p></details>';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(config.brand)} — free simulation</title><meta name="description" content="${esc(config.description)}">
<meta name="theme-color" content="#0b1020"><link rel="stylesheet" href="/assets/style.css"></head>
<body><div class="page"><header><a href="/" class="brand"><span class="mark" aria-hidden="true">₿</span><span>561 Group / ASSIST</span></a><span class="status">Simulation · Free · No real sats</span></header>
<main id="main">
<section class="hero"><div><div class="small-label">Cloud mining, without the cloud mining</div><h1>${esc(config.brand)}</h1><p>Acquire an imaginary miner. Watch the counter trickle. Upgrade the rig. <strong>It's just a game.</strong> No money down, no mining hardware, no wallet, no real Bitcoin earned.</p></div><div class="rig-art" aria-hidden="true"></div></section>
<div class="caution" role="note"><strong>Demo mode:</strong> All points here are pretend, non-transferable and worth $0. This is not real Bitcoin mining or a cryptocurrency faucet. No withdrawable satoshis or purchasable miners are currently available.</div>
<div class="layout">
${contractSection}
${regtestSection}
<details class="panel widepanel" id="arcade-mode"><summary class="arcade-summary">Optional endless arcade workshop · separate pretend balance</summary><p class="fine muted">This legacy sandbox is independent from your eight-hour and daily contracts. Arcade claims, tiers and boosts do not change those contracts or earn Bitcoin.</p><div class="arcade-grid"><section class="panel" aria-labelledby="machine-heading"><div class="small-label">Your imaginary rig</div><h2 id="machine-heading">A little bit of nothing, forever</h2>
<div class="numbers"><output id="pending" aria-label="Unclaimed virtual points">0</output><span>pending demo points</span></div><div class="meter" aria-hidden="true"></div>
<div class="stats"><div class="stat"><span class="small-label">Demo wallet (not BTC)</span><b id="banked">0</b></div><div class="stat"><span class="small-label">Current animation rate</span><b id="rate">1 point / sec</b></div><div class="stat"><span class="small-label">Virtual rig tier</span><b id="tier">Pocket cloud</b></div><div class="stat"><span class="small-label">Multiplier</span><b id="tier-multiplier">1× base rate</b></div></div>
<button id="claim" class="wide">Claim pretend points</button><p class="fine muted">Claims only move nonredeemable demo points around on this device. There is no withdrawal or blockchain transfer.</p>
<p id="feedback" class="feedback" aria-live="polite"></p></section>
<section class="panel" aria-labelledby="workshop-heading"><h2 id="workshop-heading">Rig workshop</h2><div class="group"><div class="small-label">Spend play points only</div><button id="upgrade" class="secondary">Upgrade virtual miner</button><small>No real purchase; unlock a bigger imaginary hash rate.</small></div><div class="group"><button id="boost" class="secondary">2× boost</button><small>Boosts apply to demo points, not Bitcoin or cash.</small></div><div class="group"><span class="small-label">Real reward lane</span><button disabled aria-disabled="true">Watch ad → real sats (not available)</button><small>Will require an approved ad supplier, financial reserve and verified payout before activation. Our own house promotions never pay sats.</small></div><div class="group"><span class="small-label">Total pretend points produced</span><strong id="all-time">0</strong><button id="reset" class="tertiary">Reset my local demo</button></div></section>
</div></details>
<section class="panel widepanel" aria-labelledby="discover-heading"><div class="small-label">House promotions · Zero reward</div><h2 id="discover-heading">While your virtual rig hums…</h2><p>These are genuine links to other 561 Group properties. Visiting them earns no sats, points, or mining income.</p><div class="promos">${cards}</div></section>
${serviceSection}
<section class="panel widepanel" aria-labelledby="about-heading"><h2 id="about-heading">What is this, really?</h2><p>A working, self-contained demo of a small attention product: a simulated timer, free upgrades, a boost, and places to explore next. The next commercial step is a supplier-approved <em>real</em> ad reward backed by actual cash—not fake mining, user deposits, or player-to-player payments.</p><p><a href="/api/status.json">Machine-readable product status</a> · <a href="https://market.561.group/">Explore agent services on the 561 Market</a></p></section></div>
</main><footer class="footer">${esc(config.brand)} is an independent 561 Group simulation. No miners, BTC, NFTs, ad impressions or crypto rewards are sold or credited. All state stays in this browser and can be reset.<br>Made for humans first; an ASSIST app instance is planned. No tracking, accounts or payment processing in this release.</footer>
<noscript>Enable JavaScript to run the local-only demo. No real Bitcoin can be earned here.</noscript>
</div><script type="module" src="/assets/browser.mjs"></script></body></html>\n`;
}
export async function build({configPath, outPath}) {
  if (!configPath || !outPath) throw new Error('--config and --out required');
  const config = validateConfig(JSON.parse(await readFile(resolve(configPath), 'utf8')));
  const dest = resolve(outPath);
  await mkdir(join(dest, 'assets'), {recursive:true});
  await mkdir(join(dest, 'api'), {recursive:true});
  await writeFile(join(dest, 'index.html'), renderHtml(config));
  for (const [from, to] of [['src/browser.mjs','assets/browser.mjs'], ['src/model.mjs','assets/model.mjs'], ['src/contract-experience.mjs','assets/contract-experience.mjs'], ['src/contract-browser.mjs','assets/contract-browser.mjs'], ['src/regtest-catalog-client.mjs','assets/regtest-catalog-client.mjs'], ['src/style.css','assets/style.css']])
    await copyFile(join(root, from), join(dest, to));
  await writeFile(join(dest, 'api/status.json'), JSON.stringify({
    kind: '561-group.assist-demo-status/v1', brand:config.brand, host:config.host,
    state: 'source-demo-build', realBitcoinMining:false, bitcoinEarnedSats:0,
    realRewardsEnabled:false, sponsorCallbacksEnabled:false, externalAdsEnabled:false,
    walletOrCustodyEnabled:false, x402PaymentsEnabled:false, playerDepositsAccepted:false,
    playableDemo:true, storage:'local-browser-only',
    nextMilestones:['provider-permitted-paid-ad', 'financially-funded-sats-rewards', 'signed-postback-and-reversal', 'independent-public-receiving'],
  }, null, 2) + '\n');
  await writeFile(join(dest, '_headers'), `/*\n  Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n`);
  await writeFile(join(dest, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  return {dest, files:['index.html','assets/browser.mjs','assets/model.mjs','assets/contract-experience.mjs','assets/contract-browser.mjs','assets/regtest-catalog-client.mjs','assets/style.css','api/status.json','_headers','robots.txt']};
}
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const option = key => { const index = args.indexOf(key); return index >= 0 ? args[index+1] : undefined; };
  build({ configPath:option('--config'), outPath:option('--out') }).then(result => console.log(JSON.stringify(result)), error => { console.error(error.message);process.exitCode=1; });
}
