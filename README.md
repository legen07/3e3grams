# 🔐 telegram

**Telegram automation framework for intelligent dialog management, trend analysis, and channel operations.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E18.0.0-brightgreen)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-%3E1.0.0-003344?logo=bun)](https://bun.sh/)
[![Telegram](https://img.shields.io/badge/Telegram-API-2DA5EC?logo=telegram)](https://core.telegram.org/api)
[![MongoDB](https://img.shields.io/badge/MongoDB-%3E7.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Playwright](https://img.shields.io/badge/Playwright-%3E1.59-2A808E?logo=playwright)](https://playwright.dev/)

---

## 📋 Overview

A robust Telegram automation toolkit built for scraping, analyzing, and managing Telegram dialogs with integrated Reddit trend detection and MongoDB persistence. Powered by the [Telegram Client API](https://github.com/telegram-thunder/telegram.js) and [Playwright](https://playwright.dev/).

## ✨ Features

- **🤖 Telegram Client Automation** — Full-featured Telegram session management with `telegram.js` and `StringSession`
- **📊 Dialog Intelligence** — Fetch, analyze, and categorize dialogs with topic detection via `chatAnalyzer`
- **📈 Reddit Trend Integration** — Cross-platform keyword and trending topic extraction from Reddit
- **💬 Channel Operations** — Automated channel monitoring and management
- **🔍 Advanced Search** — Powerful Telegram message search and crawling capabilities
- **💾 MongoDB Persistence** — Structured dialog and data storage with Mongoose
- **🛡️ Stealth Browsing** — Puppeteer-extra stealth plugin for undetected automation
- **⚙️ TypeScript Ready** — Full TypeScript support with strict config

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) or Node.js ≥ 18
- [MongoDB](https://www.mongodb.com/) instance running locally
- Chrome/Chromium installed for Playwright

### Installation

```bash
# Clone the repository
git clone git@github.com:legen07/telegram.git
cd telegram

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials
nano .env
```

### Environment Variables

```env
# Telegram API credentials (get from my.telegram.org)
API_ID=your_api_id
API_HASH=your_api_hash
PASSWORD=your_2fa_password
SESSION=your_session_id

# MongoDB connection
MONGODB_URI=mongodb://localhost:port/dialogs
```

### Running

```bash
# Start the automation
bun run scrape

# Start MongoDB and Compass
bun run mongo
```

## 📁 Project Structure

```
telegram/
├── engine/          # Chat analysis engine
├── telegram/        # Telegram client modules
│   ├── client.js    # Telegram client setup
│   ├── live.js      # Live session management
│   ├── dialogs.js   # Dialog fetching
│   ├── search.js    # Message search
│   ├── crawler.js   # Web crawling
│   ├── channel.js   # Channel operations
│   └── chat.js      # Chat management
├── reddit/          # Reddit trend extraction
├── helpers/         # Utility actions
├── queue/           # Task queue management
├── db/              # Database models
├── assets/          # Static assets
├── index.js         # Main entry point
└── package.json     # Project configuration
```

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## ⚠️ Disclaimer

This tool is for educational and authorized automation purposes only. Use responsibly and comply with Telegram's Terms of Service.
