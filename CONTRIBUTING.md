# 🤝 Contributing to telegram

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## 📌 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)

## 📜 Code of Conduct

Please read and follow the [Code of Conduct](CODE_OF_CONDUCT.md) for this project. We are committed to providing a welcoming and inclusive experience for everyone.

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/telegram.git
   cd telegram
   ```
3. **Add** the upstream remote:
   ```bash
   git remote add upstream git@github.com:legen07/telegram.git
   ```

## 🔧 Development Setup

```bash
# Install dependencies
bun install

# Create .env from example
cp .env.example .env
# Fill in your credentials

# Install Playwright browsers
npx playwright install

# Verify setup
bun run scrape
```

## 📝 Commit Conventions

This project follows **Conventional Commits**:

| Type       | Description                              |
|------------|------------------------------------------|
| `feat`     | New feature                              |
| `fix`      | Bug fix                                  |
| `docs`     | Documentation changes                    |
| `style`    | Code style changes (formatting, etc.)    |
| `refactor` | Code refactoring                         |
| `test`     | Adding or updating tests                 |
| `chore`    | Maintenance tasks                        |
| `perf`     | Performance improvements                 |
| `ci`       | CI/CD configuration changes              |

**Example:**
```bash
git commit -m "feat: add dialog topic detection engine"
git commit -m "fix: resolve session reconnection bug"
```

## 🔀 Pull Request Process

1. **Create a branch** from `master` for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit your changes** following the conventions above
3. **Run all tests** and ensure they pass
4. **Update documentation** if needed
5. **Push** your branch and open a Pull Request
6. **Request review** from a maintainer

## 📏 Coding Standards

- **Language**: JavaScript (ES modules) with TypeScript support
- **Formatter**: Follow the project's ESLint configuration
- **Imports**: Use ES module syntax (`import`/`export`)
- **Environment**: Never commit `.env` files — use `.env.example`
- **Secrets**: API keys and session tokens must never appear in code
- **Logging**: Use `kleur` for colored, structured console output

## 🐛 Reporting Issues

- Use the [GitHub Issues](https://github.com/legen07/telegram/issues) tracker
- Include reproduction steps and environment details
- Prefix issue titles with `[Bug]`, `[Feature]`, or `[Question]`

## 🙏 Acknowledgments

- [telegram.js](https://github.com/telegram-thunder/telegram.js) — Telegram client library
- [Playwright](https://playwright.dev/) — Browser automation
- [Mongoose](https://mongoosejs.com/) — MongoDB ODM
- [Kleur](https://github.com/lukeed/kleur) — Terminal coloring

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
