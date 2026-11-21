# Virtual Miner Experience Service

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

Red Cup Web Game Engineering maintains the static site generator and local virtual-credit simulator. The generator uses ASSIST to validate the public service configuration.

Causeway’s Public Bitcoin Services owns the **Yet Another Bitcoin Cloud Miner** instance at `yabcm.assist.561.group`. It selects the name and host from the ASSIST roster and supplies the game terms, supported operations and first-party promotions.

## Build and test

Use Node 22 or newer from this package directory. Set `site` to the directory containing the product’s `site.json` and `assist` and `public` to the ASSIST and Public Services checkout roots.

```sh
node scripts/check-public-build.mjs "$site/site.json" "$assist" "$public"
node scripts/build.mjs --config "$site/site.json" --assist-root "$assist" --public-root "$public" --out "$site/dist"
```

The build check compares all files from the current and historical source paths and verifies that altered source bytes are rejected. Serve `dist/` with a static HTTP server to play the result. The Public site owner maintains the Cloudflare Worker configuration and verifies the live host.

The app is intentionally limited to **nontransferable, nonredeemable browser points**. Level upgrades and temporary boosts spend only local demo points. There is no backend, cookie, remote account, tracking, client ad SDK, x402 payment, wallet, user funds or sats payout. Clearing browser storage erases progress. A browser counter is not a financial journal; clicking any house promotion never credits a reward. `/api/status.json` explicitly names disabled monetary features.

## Next real commercial increment

Existing source-owner financial quote capability:
[`@red-cup-engineering/capability-pricing-service/rewarded-attention`](https://github.com/red-cup-engineering/capability-pricing-service/blob/main/src/rewarded-attention.mjs). It computes a hypothetical conservative reward envelope, **not** a payable sat amount, real provider contract, user financial entitlement or settlement.

Enable genuine sats only after a specific advertiser-permitted ad or offer, signed conversion callbacks/reversals, real prefunded cash reservation, customer eligibility, privacy/age/payout rules and independent confirmation of a user payout. Keep financial service payment behind the canonical x402 market, never duplicate it in this demo.

Original Public consumer: [Public Services #64](https://github.com/causeway-services/public-services-section/issues/64). Attention/cross-service media: [Public Media #53](https://github.com/causeway-services/public-media-services-section/issues/53).


## Competitive reconstruction selected into the producer

The original product comparison is in [Lenticule Economic Intelligence's clean-room field study](https://github.com/lenticule-science/economic-intelligence-research-service/blob/main/research/market-science/2026-10-17-reward-miner-competitive-reconstruction.md). Source studies CloudMineCrypto's **eight-hour free claim, 24-hour sponsored/check-in plan, finite subscriptions, stacking and boosts**, and RollerCoin's game-funded virtual power. Research uses public publisher documentation and a user-supplied screenshot, not reverse-engineered proprietary code, private APIs or automated rewarded traffic. See competitor EULA/terms for restrictions.

The consumer-selected `site.json.simulationPlans` now drives a reusable, finite [contract state model](src/contract-experience.mjs) and the [actual browser controls](src/contract-browser.mjs). The same static build composes them into the existing YABCM page, preserving house promotions and disabling every real-BTC action. One eight-hour free interval can be started up to three times per UTC day, subject to non-overlap; a separate 24-hour check-in can coexist. Those figures are **Public customer parameters**, not Red Cup global reward policy. There is no financial meaning or server authority to those browser contracts.

**Source-qualified behaviors:** two plans stack; countdown expires at the exact UTC second; accrual is recomputed deterministically from bounded time intervals; claiming demo points transfers only local UI balances; renewal/daily limits, malformed terms, forged expiration, time regression and injected rewardSats/paid offers refuse. Browser-local storage can still be tampered with, so it cannot be used as money bookkeeping. The [browser check](scripts/browser-check.mjs) verifies the two plans and restored balances.

We also reconstructed the **competitor-published** hashrate fraction as an explicitly source- and timestamp-bound, exact-rational *synthetic benchmarking calculation* in [`src/mining-index.mjs`](src/mining-index.mjs). This math is an explanatory estimate only: no actual Bitcoin hashing, hidden competitor policy, financial entitlement, or Lightning payment can be inferred. In an illustrative network scenario (712 EH/s, 3.145 BTC/block, six blocks/hour), 3.39 GH/s for eight hours is only around **0.072 sats (about 72 msat)**. That is why **the real ledger must retain msat precision**, while whole-sat conversion and payout fees are separately received.

**Production-finance handoff:** reusable Engineering [bounded full-term liability quote](https://github.com/red-cup-engineering/capability-pricing-service/blob/main/src/fixed-term-reward-ceiling.mjs) uses exact msat and an explicit upper multiplier, term length, extra bonuses and withdrawal-fee cap; [Lightning inventory](https://github.com/red-cup-engineering/capability-pricing-service/blob/main/src/prefunded-lightning-inventory.mjs) separately checks the wallet's outgoing liquidity and existing commitments. Neither performs the still-missing **atomic reservation**, wallet book write, issuer authorization, signed ad verification or real payout. The competent financial receiving obligation remains [Financial Engineering #36](https://github.com/red-cup-engineering/financial-engineering-services-section/issues/36).

At source revision of this study, the consumer-selected build generated **nine static assets** in an isolated in-memory filesystem and V8 executions of **12 contract-source plus three browser click-path tests** and five mining-index tests passed. This does not claim the entire native suite or a real Cloudflare installation was exercised by that harness.

## Same-origin developer-only wallet capacity visibility

The [source-owned regtest catalog reader](src/regtest-catalog-client.mjs) is bundled by the existing static publisher, rendered only as a collapsed **Developer laboratory** section. It makes a GET with `credentials:'omit'` to the same-origin `/v1/catalog`, accepts only `RewardContractCatalogRegtest.v1` with `mainnetSalesEnabled:false`, and presents **aggregate count of source-quoted test plans** with `textContent`. No wallet ID, user balance, operator token, invoice, raw payment amount or earning entitlement enters the browser. A missing/malformed catalog fails closed to the normal playable zero-money demo. No browser route sends any financial operation.

The authoritative [Red Cup Finance regtest service](https://github.com/red-cup-engineering/financial-engineering-services-section/tree/main/services/lightning-reward-contract-service) can optionally mount the generated static files on the same **operator loopback origin** via `--demo-dist`; the Public site remains the only owner of the brand, plan selection and house promotions. The static Cloudflare publication doesn't magically inherit any backend, and production customer authentication and wallet spending are deliberately absent.

The [build check](scripts/check-public-build.mjs) verifies published assets and pinned sources. The [browser check](scripts/browser-check.mjs) exercises the local counter, saved contracts and reset. The build's CSP now permits **same-origin GETs only** (`connect-src 'self'`) without admitting arbitrary ad scripts or cross-origin callbacks. The real rewarded-ad and paid-miner controls remain disabled until verified ad rights and payouts.

This adds a **runnable local finance/UX integration** rather than a second mining economy. It is not a mainnet product or installed remote Cloudflare release.

## Original ASSIST source, typed operations, and actual public build

The former `assist-instance.json` was an unconsumed declaration of mixed
`operation/effect/status` fields. The Public instance is now
`AssistPublicServiceInstance` v2, with separately declared `operationId`,
`interactionClass`, `sourceCapability` and `publicAvailability`, validated
by the `@red-cup-engineering/assist`
`./public-service-instance` reader and its JSON Schema 2020-12 contract.

The actual site `site.json` is presentation parameterization, not another
identity registry. It selects **two exact original Git blob identities**:
ASSIST's app roster (brand, hostname, summary and responsible engine owner) and
Causeway Public Services' service instance (per-operation capability,
public availability and constraints). The existing `scripts/build.mjs`
requires both source checkout roots, reads their actual files without
following symlinks, checks the Git blobs, checks that the service instance names the selected app
through the original ASSIST schema and refuses source drift or mismatched
product/host. A caller-supplied site brand or host is rejected.

The game engine's independently implemented source ceiling is deliberately
stricter than the source owner's vocabulary: the public manifest **cannot**
enable paid advertising, real sats, wallets or x402 payments by changing
JSON. Only local simulation, imaginary upgrades and unpaid house links may
be source-implemented; the other two monetary operations must be explicitly
disabled and not implemented.

The same original build now produces eleven assets, including existing game/browser
modules and `index.html` with source-authored capability descriptions;
`/api/status.json` with both exact NI source content digests and every
qualified operation; and standard
[schema.org SoftwareApplication](https://schema.org/SoftwareApplication)
`/api/application.jsonld` with DCMI and PROV-O source relationships,
offered via the same Cloudflare static asset handler with
`application/ld+json` MIME. Only implemented **source** capabilities enter
the linked-data feature list; the metadata explicitly says public hosting
and payments are unverified.

This adds no second game, transaction ledger, ad callback service, query
engine, personal account, payment runtime or independently hosted Actor.
The release owner checks the deployed hostname and browser flow separately.
