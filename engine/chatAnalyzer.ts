export type Topic = "purchase_intent" | "question" | "tech_issue" | "general";

/**
 * Detects the intent of a message from its text.
 * @param messageText - The message text to analyse.
 * @returns The detected topic, or `null` when there is no text.
 */
export function detectTopic(messageText?: string | null): Topic | null {
  if (!messageText) return null;

  const text = messageText.toLowerCase();

  if (text.includes("buy") || text.includes("price")) return "purchase_intent";
  if (text.includes("help") || text.includes("how")) return "question";
  if (text.includes("error") || text.includes("not working"))
    return "tech_issue";

  return "general";
}
