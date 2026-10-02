# 🔐 telegram

**Telegram automation framework for intelligent dialog management, trend analysis, and channel operations.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E18.0.0-brightgreen)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-%3E1.0.0-003344?logo=bun)](https://bun.sh/)
[![Telegram](https://img.shields.io/badge/Telegram-API-2DA5EC?logo=telegram)](https://core.telegram.org/api)
[![SQLite](https://img.shields.io/badge/SQLite-%3E3.44-47A248?logo=sqlite)](https://www.sqlite.org/)
[![Playwright](https://img.shields.io/badge/Playwright-%3E1.59-2A808E?logo=playwright)](https://playwright.dev/)

---

## 📋 Overview

A robust Telegram automation toolkit built for scraping, analyzing, and managing Telegram dialogs with integrated Reddit trend detection and SQLite persistence. Powered by the [Telegram Client API](https://github.com/telegram-thunder/telegram.js) and [Playwright](https://playwright.dev/).

## ✨ Features

- **🤖 Telegram Client Automation** — Full-featured Telegram session management with `telegram.js` and `StringSession`
- **📊 Dialog Intelligence** — Fetch, analyze, and categorize dialogs with topic detection via `chatAnalyzer`
- **📈 Reddit Trend Integration** — Cross-platform keyword and trending topic extraction from Reddit
- **💬 Channel Operations** — Automated channel monitoring and management
- **🔍 Advanced Search** — Powerful Telegram message search and crawling capabilities
- **💾 SQLite Persistence** — Structured dialog and data storage via `node:sqlite`
- **🛡️ Stealth Browsing** — Puppeteer-extra stealth plugin for undetected automation
- **⚙️ TypeScript** — Fully written in TypeScript with a strict configuration, type-checked with `tsc` and run directly by Bun

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) or Node.js ≥ 18
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

# SQLite connection (created automatically under ./data/)
SQLITE_PATH=./data/dialogs.sqlite
```

### Running

```bash
# Start the automation
bun run start
```

## 📁 Project Structure

```text
telegram/
├── engine/          # Chat analysis engine
├── telegram/        # Telegram client modules
│   ├── client.ts    # Telegram client setup
│   ├── live.ts      # Live session management
│   ├── dialogs.ts   # Dialog fetching
│   ├── search.ts    # Message search
│   ├── crawler.ts   # Web crawling
│   ├── channel.ts   # Channel operations
│   └── chat.ts      # Chat management
├── reddit/          # Reddit trend extraction
├── helpers/         # Utility actions
├── queue/           # Task queue management
├── db/              # Database models
├── assets/          # Static assets
├── index.ts         # Main entry point
└── package.json     # Project configuration
```

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## ⚠️ Disclaimer

This tool is for educational and authorized automation purposes only. Use responsibly and comply with Telegram's Terms of Service.
