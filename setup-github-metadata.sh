#!/bin/bash
# Setup GitHub repository metadata (description, topics)
# Requires: GitHub Personal Access Token with 'repo' scope
# Generate at: https://github.com/settings/tokens

set -e

REPO_OWNER="legen07"
REPO_NAME="3e3grams"

echo "🔧 Setting up GitHub repository metadata for ${REPO_OWNER}/${REPO_NAME}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  GITHUB_TOKEN not set in environment."
    read -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
    echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ No token provided. Exiting."
    echo "💡 Generate a token at: https://github.com/settings/tokens"
    exit 1
fi

# Set repository description
echo "📝 Setting repository description..."
curl -s -X PATCH \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}" \
    -d '{
        "description": "Telegram automation framework for intelligent dialog management, trend analysis, and channel operations with Reddit integration and MongoDB persistence.",
        "has_issues": true,
        "has_projects": true,
        "has_wiki": true,
        "has_discussions": true,
        "default_branch": "master"
    }' > /dev/null 2>&1 && echo "✅ Description updated" || echo "❌ Failed to update description"

# Set repository topics
echo "🏷️  Setting repository topics..."
curl -s -X PUT \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/topics" \
    -d '{
        "names": [
            "telegram",
            "automation",
            "telegram-api",
            "telegram-bot",
            "dialogs",
            "trending",
            "reddit",
            "mongodb",
            "playwright",
            "puppeteer",
            "nodejs",
            "javascript",
            "channel-management",
            "scraping",
            "typescript"
        ]
    }' > /dev/null 2>&1 && echo "✅ Topics updated" || echo "❌ Failed to update topics"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ GitHub repository metadata setup complete!"
echo "📋 Visit: https://github.com/${REPO_OWNER}/${REPO_NAME}"
