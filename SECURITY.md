# 🔒 Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing **gafful07@gmail.com**. We will acknowledge receipt within 48 hours and provide an update on our remediation timeline.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.0   | ✅ Current          |
| < 1.0.0 | ❌ No longer supported |

## Security Guidelines

### Environment Security

- **Never commit `.env` files** to the repository
- **Never expose** `API_ID`, `API_HASH`, `SESSION`, or `MONGODB_URI` in code
- Always use `.env.example` as a template for new contributors
- Rotate session tokens periodically

### Dependency Security

- Keep dependencies up to date
- Review pull requests that modify `package.json` or `bun.lock`
- Use the CI pipeline to detect dependency vulnerabilities

### Telegram API Security

- Store API credentials securely on the server only
- Do not share session files (`StringSession`) publicly
- Use 2FA passwords for Telegram accounts
- Monitor active sessions regularly

### MongoDB Security

- Use authentication and network isolation
- Do not expose MongoDB ports publicly
- Encrypt sensitive data at rest
- Regularly back up the database

## Response Timeline

| Action                        | Timeline                  |
| ----------------------------- | ------------------------- |
| Acknowledge receipt           | Within 48 hours           |
| Initial assessment            | Within 7 days             |
| Patch released                | Depends on severity       |
| Public disclosure             | After patch is available  |

## Bug Bounty

While this project does not currently offer a formal bug bounty program, responsible disclosure is always appreciated and credited in the project's contributors list.

## Contacts

- **Joe Legen** — <gafful07@gmail.com>
- **GitHub** — [@legen07](https://github.com/legen07)
