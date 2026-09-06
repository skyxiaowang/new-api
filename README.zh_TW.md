<div align="center">

![ModelSet](/web/public/logo.png)

# ModelSet AI 平台

⚡ **統一的 AI 模型閘道與管理控制台**

<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README.zh_CN.md">简体中文</a> |
  <strong>繁體中文</strong> |
  <a href="./README.ja.md">日本語</a> |
  <a href="./README.fr.md">Français</a>
</p>

</div>

## 📝 專案簡介

ModelSet AI 平台是一套自託管的 AI 模型閘道與管理控制台。它將 40+ 家上游 AI 服務商（OpenAI、Claude、Gemini、Azure、AWS Bedrock 等）聚合到一個統一的、相容 OpenAI 協定的 API 之後，並提供多使用者管理、額度計費、限流與完整的管理控制台。

> [!IMPORTANT]
> - 本專案僅用於合法、經授權的 AI API 閘道、組織級鑑權、多模型管理、用量分析、成本核算與私有化部署場景。
> - 你必須合法取得上游 API 金鑰、帳號與模型服務，並遵守上游服務條款及所在地區法律法規。

## ✨ 核心特性

- **統一 API** — 一個相容 OpenAI 協定的端點接入全部模型服務商，自動完成協定轉換
- **40+ 服務商** — OpenAI、Claude、Gemini、Azure、AWS Bedrock 等主流廠商
- **多使用者體系** — 使用者、分組、額度、權杖的細粒度管理
- **計費與錢包** — 模型級倍率定價、兌換碼、線上儲值（Stripe、易支付、Pancake）
- **渠道管理** — 負載平衡、加權分流、自動重試與自動停用
- **可觀測性** — 呼叫日誌、消費看板、按權杖/使用者維度的用量分析
- **安全** — JWT、WebAuthn/Passkeys、OAuth（GitHub、Discord、OIDC）、IP 限制、速率限制
- **控制台** — 完整的管理端與使用者端控制台，支援暗色模式與 7 種語言（zh、en、zh-TW、fr、ru、ja、vi）
- **桌面端** — Electron 打包，支援 Windows / macOS / Linux

## 🚀 快速開始

```bash
docker build -t modelset .
docker run -d --name modelset \
  -p 3000:3000 \
  -v modelset-data:/data \
  -e TZ=Asia/Shanghai \
  modelset
```

啟動後造訪 <http://localhost:3000>，初始管理員帳號為 `root` / `123456`，首次登入後請立即修改密碼。

## 🔨 源碼建置

環境需求：Go 1.25+、Bun（前端）。

```bash
cd web && bun install && bun run build && cd ..
go build -o modelset
```

## 📚 文件

- 官網與文件：<https://ai.modelset.top>

## 📄 開源協議

本專案基於 [AGPL-3.0](./LICENSE) 協議開源。
