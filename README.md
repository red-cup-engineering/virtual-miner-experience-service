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


## Competitive reconstruction selected into the producer

The original product comparison is in [Lenticule Economic Intelligence's clean-room field study](https://github.com/lenticule-science/economic-intelligence-research-service/blob/main/research/market-science/2026-10-17-reward-miner-competitive-reconstruction.md). Source studies CloudMineCrypto's **eight-hour free claim, 24-hour sponsored/check-in plan, finite subscriptions, stacking and boosts**, and RollerCoin's game-funded virtual power. Research uses public publisher documentation and a user-supplied screenshot, not reverse-engineered proprietary code, private APIs or automated rewarded traffic. See competitor EULA/terms for restrictions.

The consumer-selected `site.json.simulationPlans` now drives a reusable, finite [contract state model](src/contract-experience.mjs) and the [actual browser controls](src/contract-browser.mjs). The same static build composes them into the existing YABCM page, preserving house promotions and disabling every real-BTC action. One eight-hour free interval can be started up to three times per UTC day, subject to non-overlap; a separate 24-hour check-in can coexist. Those figures are **Public customer parameters**, not Red Cup global reward policy. There is no financial meaning or server authority to those browser contracts.

**Source-qualified behaviors:** two plans stack; countdown expires at the exact UTC second; accrual is recomputed deterministically from bounded time intervals; claiming demo points transfers only local UI balances; renewal/daily limits, malformed terms, forged expiration, time regression and injected rewardSats/paid offers refuse. Browser-local storage can still be tampered with, so it cannot be used as money bookkeeping. Native tests: [contract source](test/contract-experience.test.mjs), [browser click path](test/contract-browser.test.mjs), [static build](test/build.test.mjs).

We also reconstructed the **competitor-published** hashrate fraction as an explicitly source- and timestamp-bound, exact-rational *synthetic benchmarking calculation* in [`src/mining-index.mjs`](src/mining-index.mjs), with its [comparison tests](test/mining-index.test.mjs). This math is an explanatory estimate only: no actual Bitcoin hashing, hidden competitor policy, financial entitlement, or Lightning payment can be inferred. In an illustrative network scenario (712 EH/s, 3.145 BTC/block, six blocks/hour), 3.39 GH/s for eight hours is only around **0.072 sats (about 72 msat)**. That is why **the real ledger must retain msat precision**, while whole-sat conversion and payout fees are separately received.

**Production-finance handoff:** reusable Engineering [bounded full-term liability quote](https://github.com/red-cup-engineering/capability-pricing-service/blob/main/src/fixed-term-reward-ceiling.mjs) uses exact msat and an explicit upper multiplier, term length, extra bonuses and withdrawal-fee cap; [Lightning inventory](https://github.com/red-cup-engineering/capability-pricing-service/blob/main/src/prefunded-lightning-inventory.mjs) separately checks the wallet's outgoing liquidity and existing commitments. Neither performs the still-missing **atomic reservation**, wallet book write, issuer authorization, signed ad verification or real payout. The competent financial receiving obligation remains [Financial Engineering #36](https://github.com/red-cup-engineering/financial-engineering-services-section/issues/36).

At source revision of this study, the consumer-selected build generated **nine static assets** in an isolated in-memory filesystem and V8 executions of **12 contract-source plus three browser click-path tests** and five mining-index tests passed. This does not claim the entire native suite or a real Cloudflare installation was exercised by that harness.
