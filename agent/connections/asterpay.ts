import { defineMcpClientConnection } from "eve/connections";

/**
 * Read-only AsterPay tools, served straight from the hosted AsterPay MCP server.
 * The model discovers these via eve's `connection_search` and calls them as
 * `asterpay__<tool>`. The MCP server requires no API key, so no `auth` is needed;
 * even if it did, eve would broker it and the model would never see a credential.
 *
 * Money movement is intentionally NOT exposed here — it lives in the native
 * `asterpay_pay` tool so it can sit behind a human-approval gate.
 */
export default defineMcpClientConnection({
  url: process.env.ASTERPAY_MCP_URL ?? "https://mcp-api.asterpay.io/mcp",
  description:
    "AsterPay: trust, discovery and EUR-settlement layer for AI agent commerce. " +
    "Read-only tools to check an agent's KYA trust score, estimate a USDC-to-EUR " +
    "settlement, resolve a merchant's payment details, and read market rates. " +
    "No API key required.",
  // Keep the surface read-only; the payment tool is authored natively.
  tools: { allow: ["check_agent_trust", "settlement_estimate", "merchant_resolve", "market_rates"] },
});
