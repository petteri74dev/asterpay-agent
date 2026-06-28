# asterpay-agent — x402 EUR settlement for eve agents

A drop-in [eve](https://github.com/vercel/eve) agent template that gives any eve
agent the ability to **pay for x402 services in USDC and settle counterparties in
euros (EUR) via SEPA Instant**, with a **KYA (Know Your Agent) trust check** before
money moves — powered by [AsterPay](https://asterpay.io).

This is the missing money layer for eve agents. eve handles the agent runtime;
AsterPay handles paying, settling to a European bank, and checking who you pay.

## What you get

| Surface | File | What it does |
| --- | --- | --- |
| Connection (read-only) | `agent/connections/asterpay.ts` | Exposes AsterPay's hosted MCP tools (trust check, settlement estimate, merchant resolve, market rates). No API key. The model never sees a URL or credential. |
| KYA tool | `agent/tools/asterpay_kya.ts` | Free trust score (0-100) for any wallet / ERC-8004 id. The differentiator: nobody else scores the counterparty. |
| Quote tool | `agent/tools/asterpay_quote.ts` | Free USDC→EUR settlement estimate with the fee. |
| Pay tool | `agent/tools/asterpay_pay.ts` | x402 payment in USDC, gated by **human approval** above a configurable ceiling. Counterparty settles to EUR. |
| Skill | `agent/skills/eur-settlement.md` | Playbook: when to KYA, thresholds, fee math. |

## Quick start

```bash
# Clone the template directly:
git clone https://github.com/petteri74dev/asterpay-agent
cd asterpay-agent
cp .env.example .env   # fill in keys
npm install
npm run dev
```

Or drop the `agent/connections`, `agent/tools` and `agent/skills` files into an
existing eve project (`npx eve@latest init my-agent`).

## Configuration

See `.env.example`. The only required secret for payments is
`ASTERPAY_AGENT_PRIVATE_KEY` — the agent's own USDC signing key.

## Security model

AsterPay is **non-custodial**: the agent signs its own USDC payments. The signing
key lives only inside the eve tool's `execute` sandbox as an encrypted environment
variable — never in `instructions.md`, never in model context. For production, use
a **session key or smart account with an on-chain spend cap**, and keep the
human-approval gate on. Two doors guard the money: a hard on-chain cap and a human
sign-off above the ceiling.

## Read-only vs. money movement

Read-only AsterPay tools (KYA, quote, discovery) are served through the
`connections/` surface, where eve brokers everything. The payment tool is authored
natively so it can sit behind eve's `approval` gate. Calls above
`ASTERPAY_MAX_AUTO_USDC` (default 50) durably pause for a human.

## Endpoints used

- KYA trust score (free): `GET https://x402.asterpay.io/v1/agent/trust-score/{address}`
- Settlement estimate (free): `GET https://x402.asterpay.io/v1/settlement/estimate?amount={usdc}`
- Hosted MCP (read-only, no key): `https://mcp-api.asterpay.io/mcp`

## Links

- This template: https://github.com/petteri74dev/asterpay-agent
- AsterPay for eve agents: https://asterpay.io/eve/
- AsterPay docs: https://asterpay.io
- eve: https://github.com/vercel/eve

License: MIT.
