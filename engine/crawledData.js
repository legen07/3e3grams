// sanitize.js

import kleur from "kleur";

/**
 * Sanitizes a string by removing potentially dangerous characters
 * @param {string} str - The string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  let sanitized = str.replace(/<[^>]*>/g, '');
  
  // Remove any script-like content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Escape special characters that could be dangerous
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  return sanitized;
}

/**
 * Extracts Telegram links and usernames from a string
 * @param {string} str - The string to analyze
 * @returns {Object} - Object containing arrays of links and usernames
 */
export function extractTelegramData(str) {
  if (typeof str !== 'string') {
    return { links: [], usernames: [] };
  }

  const links = [];
  const usernames = [];

  // ✅ FIXED: Extract ALL Telegram links including private invites with + and share links
  // This matches:
  // - t.me/username
  // - t.me/+invitecode (private invite)
  // - t.me/c/123456789 (channel post)
  // - t.me/joinchat/abc123 (old invite format)
  const linkRegex = /(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me|telegram\.org)\/([a-zA-Z0-9_+]+)(?:\/[a-zA-Z0-9_]+)?(?:\?[^\s]*)?/gi;
  let match;
  
  while ((match = linkRegex.exec(str)) !== null) {
    const fullLink = match[0];
    // Ensure the link has a protocol for standardization
    const standardizedLink = fullLink.startsWith('http') 
      ? fullLink 
      : `https://${fullLink}`;
    if (!links.includes(standardizedLink)) {
      links.push(standardizedLink);
    }
  }

  // ✅ FIXED: Also extract standalone invite codes
  const inviteRegex = /t\.me\/\+[a-zA-Z0-9_]+/gi;
  let inviteMatch;
  while ((inviteMatch = inviteRegex.exec(str)) !== null) {
    const fullLink = `https://${inviteMatch[0]}`;
    if (!links.includes(fullLink)) {
      links.push(fullLink);
    }
  }

  // Extract Telegram usernames (starting with @)
  const usernameRegex = /(?:^|\s|\(|\)|[,;:!?]|@)(@[a-zA-Z0-9_]{5,32})(?=\s|$|\(|\)|[,;:!?]|@|\.\s|$)/g;
  
  while ((match = usernameRegex.exec(str)) !== null) {
    const username = match[1];
    if (/^@[a-zA-Z0-9_]{5,32}$/.test(username)) {
      if (!usernames.includes(username)) {
        usernames.push(username);
      }
    }
  }

  // Also catch standalone @usernames
  const standaloneRegex = /@[a-zA-Z0-9_]{5,32}/g;
  let standMatch;
  while ((standMatch = standaloneRegex.exec(str)) !== null) {
    const username = standMatch[0];
    if (!usernames.includes(username) && /^@[a-zA-Z0-9_]{5,32}$/.test(username)) {
      usernames.push(username);
    }
  }

  return { 
    links: [...new Set(links)].sort(), 
    usernames: [...new Set(usernames)].sort() 
  };
}

/**
 * Main function: sanitizes a string and extracts Telegram data
 * @param {string} str - The input string
 * @returns {Object} - Object containing sanitized string, links, and usernames
 */
export function sanitizeAndExtract(str) {
  if (typeof str !== 'string') {
    return { sanitized: '', links: [], usernames: [] };
  }

  // First extract data BEFORE sanitizing (to preserve links)
  
  // Then sanitize the string
  const sanitized = sanitizeString(str);
  
  const { links: extLinks, usernames: extUsernames } = extractTelegramData(sanitized);

  
  return { 
    sanitized, 
    extLinks, 
    extUsernames 
  };
}

// Default export for convenience
export default {
  sanitizeString,
  extractTelegramData,
  sanitizeAndExtract
};