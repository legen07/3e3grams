export function generateReply(message, product) {
  return {
    originalMessage: message.text,
    detectedTopic: message.topic,
    suggestion: `
Suggested reply:

"${product.name} might help with this.
You can check details here: ${product.affiliateLink}"
    `.trim()
  };
}