export function detectTopic(messageText) {
  if (!messageText) return null;

  const text = messageText.toLowerCase();

  if (text.includes("buy") || text.includes("price")) return "purchase_intent";
  if (text.includes("help") || text.includes("how")) return "question";
  if (text.includes("error") || text.includes("not working")) return "tech_issue";

  return "general";
}