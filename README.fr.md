<div align="center">

![ModelSet](/web/public/logo.png)

# Plateforme ModelSet AI

⚡ **Passerelle IA unifiée & console d'administration**

<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README.zh_CN.md">简体中文</a> |
  <a href="./README.zh_TW.md">繁體中文</a> |
  <a href="./README.ja.md">日本語</a> |
  <strong>Français</strong>
</p>

</div>

## 📝 Présentation

La plateforme ModelSet AI est une passerelle IA auto-hébergée et une console d'administration. Elle agrège plus de 40 fournisseurs d'IA en amont (OpenAI, Claude, Gemini, Azure, AWS Bedrock, etc.) derrière une API unifiée compatible OpenAI, avec gestion multi-utilisateurs, facturation au quota, limitation de débit et console d'administration complète.

> [!IMPORTANT]
> - Ce projet est destiné uniquement à des usages légaux et autorisés : passerelle d'API IA, authentification organisationnelle, gestion multi-modèles, analyse d'usage, comptabilisation des coûts et déploiement privé.
> - Vous devez obtenir légitimement les clés API, comptes et services en amont, et respecter leurs conditions d'utilisation ainsi que les lois applicables.

## ✨ Fonctionnalités clés

- **API unifiée** — un point d'entrée compatible OpenAI pour tous les fournisseurs, avec conversion automatique de protocole
- **40+ fournisseurs** — OpenAI, Claude, Gemini, Azure, AWS Bedrock, et bien d'autres
- **Multi-utilisateurs** — utilisateurs, groupes, quotas et jetons gérés finement
- **Facturation & portefeuille** — tarification par modèle, codes de recharge, paiement en ligne (Stripe, Epay, Pancake)
- **Gestion des canaux** — répartition de charge, pondération, relances et désactivation automatiques
- **Observabilité** — journaux d'appels, tableaux de bord de consommation, analyses par jeton/utilisateur
- **Sécurité** — JWT, WebAuthn/Passkeys, OAuth (GitHub, Discord, OIDC), limites IP, limitation de débit
- **Console** — consoles admin et utilisateur complètes, mode sombre, 7 langues
- **Bureau** — application Electron pour Windows / macOS / Linux

## 🚀 Démarrage rapide

```bash
docker build -t modelset .
docker run -d --name modelset \
  -p 3000:3000 \
  -v modelset-data:/data \
  -e TZ=Asia/Shanghai \
  modelset
```

Ensuite, ouvrez <http://localhost:3000>. Le compte administrateur initial est `root` / `123456` — modifiez-le immédiatement après la première connexion.

## 🔨 Compilation depuis les sources

Prérequis : Go 1.25+, Bun (frontend).

```bash
cd web && bun install && bun run build && cd ..
go build -o modelset
```

## 📚 Documentation

- Site officiel : <https://ai.modelset.top>

## 📄 Licence

Ce projet est publié sous licence [AGPL-3.0](./LICENSE).
