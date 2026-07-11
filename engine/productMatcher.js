export async function matchProduct(db, topic) {
  if (topic === "purchase_intent") {
    return db.collection("click_bank").findOne({ category: "general" });
  }

  if (topic === "tech_issue") {
    return db.collection("click_bank").findOne({ category: "software" });
  }

  return db.collection("click_bank").findOne();
}