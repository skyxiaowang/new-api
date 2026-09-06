<div align="center">

![ModelSet](/web/public/logo.png)

# ModelSet AI 平台

⚡ **Unified AI Model Gateway & Management Console**

<p align="center">
  <strong>English</strong> |
  <a href="./README.zh_CN.md">简体中文</a> |
  <a href="./README.zh_TW.md">繁體中文</a> |
  <a href="./README.ja.md">日本語</a> |
  <a href="./README.fr.md">Français</a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-development">Development</a> •
  <a href="#-documentation">Documentation</a>
</p>

</div>

## 📝 Overview

ModelSet AI 平台 is a self-hosted AI gateway and management console. It aggregates 40+ upstream AI providers (OpenAI, Claude, Gemini, Azure, AWS Bedrock, and more) behind one unified, OpenAI-compatible API, with multi-user management, quota billing, rate limiting, and a complete admin console.

> [!IMPORTANT]
> - This project is intended for lawful and authorized AI API gateway, organization-level authentication, multi-model management, usage analytics, cost accounting, and private deployment scenarios.
> - You must lawfully obtain upstream API keys, accounts, and model services, and comply with upstream terms of service and applicable laws and regulations.

## ✨ Key Features

- **Unified API** — one OpenAI-compatible endpoint for all your model providers, with automatic protocol conversion
- **40+ providers** — OpenAI, Claude, Gemini, Azure, AWS Bedrock, and many more
- **Multi-user system** — users, groups, quotas, and tokens with fine-grained control
- **Billing & wallet** — model-level pricing/ratios, redemption codes, online top-up (Stripe, Epay, Pancake)
- **Channel management** — load balancing, weighted distribution, automatic retries and disabling
- **Observability** — usage logs, consumption dashboards, per-token/per-user analytics
- **Security** — JWT, WebAuthn/Passkeys, OAuth (GitHub, Discord, OIDC), IP limits, rate limiting
- **Console** — complete admin & user console with dark mode and 7 languages (en, zh, zh-TW, fr, ru, ja, vi)
- **Desktop app** — Electron packaging for Windows / macOS / Linux

## 🚀 Quick Start

### Docker

```bash
docker build -t modelset .
docker run -d --name modelset \
  -p 3000:3000 \
  -v modelset-data:/data \
  -e TZ=Asia/Shanghai \
  modelset
```

Then open <http://localhost:3000>. The initial administrator account is `root` / `123456` — change it immediately after first login.

### Docker Compose

```bash
docker compose up -d
```

This starts the service with PostgreSQL and Redis. Adjust environment variables in `docker-compose.yml` as needed.

## 🔨 Build from Source

Requirements: Go 1.25+, Bun (for the frontend).

```bash
# Build the frontend
cd web && bun install && bun run build && cd ..

# Build the backend binary
go build -o modelset
```

## 💻 Development

The repo ships a Docker-based development stack:

```bash
make dev-api    # start backend + PostgreSQL + Redis (dev profile)
make dev-web    # start the frontend dev server with hot reload
```

Backend API defaults to port 3000, frontend dev server to port 5173.

## 📚 Documentation

- Website & docs: <https://ai.modelset.top>

## 📄 License

This project is licensed under the [AGPL-3.0](./LICENSE) license.
