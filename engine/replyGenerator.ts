import type { Topic } from "./chatAnalyzer.ts";

export interface AnalyzedMessage {
  text?: string;
  topic?: Topic | null;
}

export interface Product {
  name: string;
  affiliateLink: string;
}

export interface ReplySuggestion {
  originalMessage: string | undefined;
  detectedTopic: Topic | null | undefined;
  suggestion: string;
}

/**
 * Builds a suggested reply that recommends a product for a message.
 * @param message - The analysed message.
 * @param product - The product to recommend.
 */
export function generateReply(
  message: AnalyzedMessage,
  product: Product,
): ReplySuggestion {
  return {
    originalMessage: message.text,
    detectedTopic: message.topic,
    suggestion: `
Suggested reply:

"${product.name} might help with this.
You can check details here: ${product.affiliateLink}"
    `.trim(),
  };
}
