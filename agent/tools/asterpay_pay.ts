import { defineTool } from "eve/tools";
import { z } from "zod";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

// Spend that exceeds this ceiling pauses for a human. Override per deployment.
const MAX_AUTO_USDC = Number(process.env.ASTERPAY_MAX_AUTO_USDC ?? "50");

export default defineTool({
  description:
    "Pay an x402-protected resource in USDC; the counterparty can be settled in EUR " +
    "via SEPA Instant through AsterPay. Only call this after asterpay_kya returns an " +
    "acceptable trust score for the counterparty.",
  inputSchema: z.object({
    url: z.string().url().describe("The x402-protected resource URL to pay for."),
    maxUsdc: z
      .number()
      .positive()
      .describe(
        "Hard cap on USDC you authorize for this call. Above the deployment ceiling, a human must approve.",
      ),
    settleEurTo: z
      .string()
      .optional()
      .describe("Merchant EUR settlement reference registered with AsterPay (optional)."),
  }),
  // Money movement over the ceiling pauses for a person; eve durably parks the
  // turn and resumes after approval without burning compute. (true -> user-approval)
  approval: ({ toolInput }) => (toolInput?.maxUsdc ?? 0) > MAX_AUTO_USDC,
  async execute({ url }) {
    const pk = process.env.ASTERPAY_AGENT_PRIVATE_KEY;
    if (!pk) {
      return {
        ok: false,
        error:
          "ASTERPAY_AGENT_PRIVATE_KEY is not set. Provide the agent's USDC signing key as an " +
          "encrypted environment variable (never in instructions or model context).",
      };
    }

    // The signing key is read only inside this execute sandbox. eve keeps it out
    // of instructions.md and out of the model's context.
    const signer = privateKeyToAccount(pk as `0x${string}`);
    const client = new x402Client();
    registerExactEvmScheme(client, { signer });
    const payFetch = wrapFetchWithPayment(fetch, client);

    const res = await payFetch(url);
    const body = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      paymentResponse: res.headers.get("x-payment-response") ?? undefined,
      body: body.slice(0, 4000),
    };
  },
});
