import { defineTool } from "eve/tools";
import { z } from "zod";

const API = process.env.ASTERPAY_API_URL ?? "https://x402.asterpay.io";

export default defineTool({
  description:
    "Estimate what a USDC amount settles to in EUR via AsterPay (SEPA Instant), " +
    "including the fee. Free and read-only. Use this to show the user the net EUR " +
    "and cost before paying.",
  inputSchema: z.object({
    amount: z.number().positive().describe("Amount in USDC to estimate EUR settlement for."),
  }),
  async execute({ amount }) {
    const res = await fetch(
      `${API}/v1/settlement/estimate?amount=${encodeURIComponent(String(amount))}`,
      { headers: { accept: "application/json" } },
    );
    if (!res.ok) {
      return { ok: false, status: res.status, error: `estimate failed (${res.status})` };
    }
    const data = (await res.json()) as Record<string, unknown>;
    return { ok: true, ...data };
  },
});
