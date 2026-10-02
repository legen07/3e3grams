import type { Topic } from "./chatAnalyzer.ts";

/** Minimal shape of a stored affiliate product. */
export interface Product {
  name: string;
  affiliateLink: string;
  category?: string;
}

/** Legacy MongoDB-style collection handle kept for API compatibility. */
interface ProductCollection {
  findOne(query?: Record<string, unknown>): Promise<Product | null>;
}

interface ProductDb {
  collection(name: string): ProductCollection;
}

/**
 * Matches a stored affiliate product to a detected topic.
 * @param db - Legacy collection-style database handle.
 * @param topic - The topic detected by {@link detectTopic} (`null` falls back
 *   to the first available product).
 */
export async function matchProduct(
  db: ProductDb,
  topic: Topic | null,
): Promise<Product | null> {
  if (topic === "purchase_intent") {
    return db.collection("click_bank").findOne({ category: "general" });
  }

  if (topic === "tech_issue") {
    return db.collection("click_bank").findOne({ category: "software" });
  }

  return db.collection("click_bank").findOne();
}
