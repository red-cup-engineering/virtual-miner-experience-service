# Virtual Miner Experience Service

Red Cup Web Game Engineering owns this reusable, zero-custody, dependency-free static site fabricator and pure virtual-credit simulator. It is **not** a Bitcoin miner, sat issuer, rewarded-ad integration, ASSIST payment implementation, or an independent ad server.

The first real consumer is Causeway Public Agent Services, branded **Yet Another Bitcoin Cloud Miner** (planned `yabcm.assist.561.group`). That owner defines the name, first-party house promotions, hostname, configuration, and receiving. No app brand or customer traffic source is embedded in the reusable generator.

## Build and test

Run from this package directory with Node >= 22:

```sh
npm test
node scripts/build.mjs --config /path/to/causeway/sites/yabcm.assist.561.group/site.json --out /path/to/causeway/sites/yabcm.assist.561.group/dist
```

Serve `dist/` on an HTTP static server to test. Cloudflare Workers Static Assets can publish that same directory using the **Causeway-owned** `wrangler.jsonc` configuration. The Public site owner must independently confirm Cloudflare route/DNS authority, Worker name, no conflict with the existing ASSIST host, installed CLI/account credentials and public HTTP receiving before claiming the address is live. A source-only build is not deployment.

The app is intentionally limited to **nontransferable, nonredeemable browser points**. Level upgrades and temporary boosts spend only local demo points. There is no backend, cookie, remote account, tracking, client ad SDK, x402 payment, wallet, user funds or sats payout. Clearing browser storage erases progress. A browser counter is not a financial journal; clicking any house promotion never credits a reward. `/api/status.json` explicitly names disabled monetary features.

## Next real commercial increment

Existing source-owner financial quote capability:
[`@red-cup-engineering/capability-pricing-service/rewarded-attention`](https://github.com/red-cup-engineering/capability-pricing-service/blob/main/src/rewarded-attention.mjs). It computes a hypothetical conservative reward envelope, **not** a payable sat amount, real provider contract, user financial entitlement or settlement.

Enable genuine sats only after a specific advertiser-permitted ad or offer, signed conversion callbacks/reversals, real prefunded cash reservation, customer eligibility, privacy/age/payout rules and independent user receiving. Keep financial service payment behind the canonical x402 market, never duplicate it in this demo.

Original Public consumer: [Public Services #64](https://github.com/causeway-services/public-services-section/issues/64). Attention/cross-service media: [Public Media #53](https://github.com/causeway-services/public-media-services-section/issues/53).
