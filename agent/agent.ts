import { defineAgent } from "eve";

export default defineAgent({
  // Any model eve supports works here. Sonnet is a good default for tool use.
  model: "anthropic/claude-sonnet-4.6",
});
