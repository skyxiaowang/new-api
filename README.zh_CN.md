<div align="center">

![ModelSet](/web/public/logo.png)

# ModelSet AI 平台

⚡ **统一的 AI 模型网关与管理控制台**

<p align="center">
  <a href="./README.md">English</a> |
  <strong>简体中文</strong> |
  <a href="./README.zh_TW.md">繁體中文</a> |
  <a href="./README.ja.md">日本語</a> |
  <a href="./README.fr.md">Français</a>
</p>

</div>

## 📝 项目简介

ModelSet AI 平台是一套自托管的 AI 模型网关与管理控制台。它将 40+ 家上游 AI 服务商（OpenAI、Claude、Gemini、Azure、AWS Bedrock 等）聚合到一个统一的、兼容 OpenAI 协议的 API 之后，并提供多用户管理、额度计费、限流与企业级管理控制台。

> [!IMPORTANT]
> - 本项目仅用于合法、经授权的 AI API 网关、组织级鉴权、多模型管理、用量分析、成本核算与私有化部署场景。
> - 你必须合法获取上游 API 密钥、账号与模型服务，并遵守上游服务条款及所在地区法律法规。

## ✨ 核心特性

- **统一 API** — 一个兼容 OpenAI 协议的端点接入全部模型服务商，自动完成协议转换
- **40+ 服务商** — OpenAI、Claude、Gemini、Azure、AWS Bedrock 等主流厂商
- **多用户体系** — 用户、分组、额度、令牌的细粒度管理
- **计费与钱包** — 模型级倍率定价、兑换码、在线充值（Stripe、易支付、Pancake）
- **渠道管理** — 负载均衡、加权分流、自动重试与自动禁用
- **可观测性** — 调用日志、消费看板、按令牌/用户维度的用量分析
- **安全** — JWT、WebAuthn/Passkeys、OAuth（GitHub、Discord、OIDC）、IP 限制、速率限制
- **控制台** — 完整的管理端与用户端控制台，支持暗色模式与 7 种语言（zh、en、zh-TW、fr、ru、ja、vi）
- **桌面端** — Electron 打包，支持 Windows / macOS / Linux

## 🚀 快速开始

### Docker

```bash
docker build -t modelset .
docker run -d --name modelset \
  -p 3000:3000 \
  -v modelset-data:/data \
  -e TZ=Asia/Shanghai \
  modelset
```

启动后访问 <http://localhost:3000>，初始管理员账号为 `root` / `123456`，首次登录后请立即修改密码。

### Docker Compose

```bash
docker compose up -d
```

将同时启动服务本体、PostgreSQL 与 Redis，可按需修改 `docker-compose.yml` 中的环境变量。

## 🔨 源码构建

环境要求：Go 1.25+、Bun（前端）。

```bash
# 构建前端
cd web && bun install && bun run build && cd ..

# 构建后端二进制
go build -o modelset
```

## 💻 本地开发

仓库自带基于 Docker 的开发环境：

```bash
make dev-api    # 启动后端 + PostgreSQL + Redis（开发配置）
make dev-web    # 启动前端开发服务器（热更新）
```

后端 API 默认端口 3000，前端开发服务器默认端口 5173。

## 📚 文档

- 官网与文档：<https://ai.modelset.top>

## 📄 开源协议

本项目基于 [AGPL-3.0](./LICENSE) 协议开源。
