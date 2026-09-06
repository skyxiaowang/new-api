<div align="center">

![ModelSet](/web/public/logo.png)

# ModelSet AI プラットフォーム

⚡ **統一 AI モデルゲートウェイ & 管理コンソール**

<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README.zh_CN.md">简体中文</a> |
  <a href="./README.zh_TW.md">繁體中文</a> |
  <strong>日本語</strong> |
  <a href="./README.fr.md">Français</a>
</p>

</div>

## 📝 概要

ModelSet AI プラットフォームは、セルフホスト型の AI モデルゲートウェイおよび管理コンソールです。OpenAI、Claude、Gemini、Azure、AWS Bedrock など 40 以上の上流 AI プロバイダを、OpenAI 互換の統一 API の背後に集約し、マルチユーザー管理、クォータ課金、レート制限、完全な管理コンソールを提供します。

> [!IMPORTANT]
> - 本プロジェクトは、合法かつ授权された AI API ゲートウェイ、組織レベルの認証、マルチモデル管理、使用量分析、コスト核算、プライベートデプロイのみを目的としています。
> - 上流プロバイダの API キー、アカウント、モデルサービスは合法に取得し、利用規約および適用法令を遵守してください。

## ✨ 主な機能

- **統一 API** — すべてのプロバイダに OpenAI 互換の単一エンドポイントでアクセス、プロトコル自動変換
- **40+ プロバイダ** — OpenAI、Claude、Gemini、Azure、AWS Bedrock など
- **マルチユーザー** — ユーザー、グループ、クォータ、トークンの細粒度管理
- **課金 & ウォレット** — モデル単位の価格設定、引換コード、オンラインチャージ（Stripe、Epay、Pancake）
- **チャネル管理** — ロードバランシング、加重分散、自動リトライと自動無効化
- **可観測性** — 呼び出しログ、消費ダッシュボード、トークン/ユーザー別の使用分析
- **セキュリティ** — JWT、WebAuthn/Passkeys、OAuth（GitHub、Discord、OIDC）、IP 制限、レート制限
- **コンソール** — 管理/ユーザーコンソール、ダークモード、7 言語対応
- **デスクトップ** — Electron による Windows / macOS / Linux 対応

## 🚀 クイックスタート

```bash
docker build -t modelset .
docker run -d --name modelset \
  -p 3000:3000 \
  -v modelset-data:/data \
  -e TZ=Asia/Shanghai \
  modelset
```

起動後 <http://localhost:3000> にアクセス。初期管理者アカウントは `root` / `123456` です。初回ログイン後すぐにパスワードを変更してください。

## 🔨 ソースビルド

要件：Go 1.25+、Bun（フロントエンド）。

```bash
cd web && bun install && bun run build && cd ..
go build -o modelset
```

## 📚 ドキュメント

- 公式サイト：<https://ai.modelset.top>

## 📄 ライセンス

本プロジェクトは [AGPL-3.0](./LICENSE) ライセンスで公開されています。
