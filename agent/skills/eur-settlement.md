---
name: eur-settlement
description: When and how to pay x402 services and settle counterparties in EUR, with KYA gating and fee math.
---

# EUR settlement playbook

Load this when the user wants to pay for an agent service, settle a counterparty
in euros, or asks about trust/fees.

## Before any payment

1. Run `asterpay_kya` on the counterparty (wallet or ERC-8004 id).
   - Score >= 60: proceed.
   - Score < 60: do not pay. Tell the user the score and why you stopped.
2. If the user cares about cost, run `asterpay_quote` for the USDC amount and show
   the net EUR + fee before paying.

## Paying

- Use `asterpay_pay` with a `maxUsdc` cap. Payments above the deployment ceiling
  (`ASTERPAY_MAX_AUTO_USDC`, default 50) pause for human approval — that is
  intended; do not try to bypass it.
- The agent signs the USDC payment itself (non-custodial). The signing key never
  appears in instructions or in your context.

## Fees and settlement

- AsterPay settles USDC/EURC to EUR via SEPA Instant, typically in under 10
  seconds, through a licensed EU partner (AsterPay is non-custodial and does not
  hold the funds).
- EUR settlement fee: 0.5% of the settled amount (plus the partner spread shown in
  the quote). Read-only calls (KYA, quote) are free.

## Target markets

EU/EEA merchants who invoice in euros. Common: DE, FR, ES, IT, NL.
