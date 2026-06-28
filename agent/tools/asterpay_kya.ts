import { defineTool } from "eve/tools";
import { z } from "zod";

const API = process.env.ASTERPAY_API_URL ?? "https://x402.asterpay.io";

export default defineTool({
  description:
    "Look up an agent or wallet's KYA (Know Your Agent) Trust Score (0-100) before " +
    "transacting. Free and read-only. Call this BEFORE asterpay_pay to decide whether " +
    "a counterparty is safe to pay. A score below 60 should block the payment.",
  inputSchema: z.object({
    address: z
      .string()
      .min(1)
      .describe("Counterparty wallet address (0x...) or ERC-8004 identity id."),
  }),
  async execute({ address }) {
    const res = await fetch(`${API}/v1/agent/trust-score/${encodeURIComponent(address)}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return { ok: false, status: res.status, error: `trust-score lookup failed (${res.status})` };
    }
    const data = (await res.json()) as Record<string, unknown>;
    return { ok: true, ...data };
  },
});
