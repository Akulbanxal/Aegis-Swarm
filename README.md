<div align="center">

# ⬡ AEGIS SWARM

### Autonomous Multi-Agent Smart Contract Defense System
### Built for the Somnia Agentathon 2026

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chain: Somnia Testnet](https://img.shields.io/badge/Chain-Somnia%20Testnet-00E5FF)](https://testnet.somnia.network)
[![Status: Active Development](https://img.shields.io/badge/Status-Active%20Development-FFB300)](.)

> **The first fully on-chain, AI-powered, autonomous smart contract defense system.**
> Powered by Somnia's Agentic L1 — the only blockchain where this architecture is possible.

[Live Demo](./[(https://frontend-hvbihzr27-akuls-projects-e61c97ca.vercel.app)]) · [Documentation](./docs/) · [Architecture](./ARCHITECTURE.md)

</div>

---

## 🛡️ What is Aegis Swarm?

Aegis Swarm is the immune system for smart contracts on Somnia. It deploys a coordinated swarm of five autonomous AI agents that:

1. **Monitor** registered contracts by subscribing to their events via Somnia's native on-chain reactivity
2. **Detect** threats using external intelligence (DeFiHackLabs, CERT/CC, MEV.watch)
3. **Classify** threats using deterministic on-chain LLM inference (consensus-verified, temperature=0)
4. **Respond** autonomously — soft-locks, rate limits, circuit breakers — all within the same block as the attack
5. **Archive** new vulnerability signatures from security blogs (rekt.news, OpenZeppelin advisories)
6. **Alert** humans via Discord, Telegram, and PagerDuty

**No off-chain bots. No centralized servers. No keeper networks. Pure on-chain intelligence.**

---

## 🤖 The Swarm

| Agent | Type | Function |
|---|---|---|
| **Sentinel** | JSON API Request | External threat intelligence (DeFiHackLabs, CVE feeds) |
| **Analyst** | LLM Inference | Deterministic AI threat classification (severity 0-100) |
| **Responder** | LLM Inference | Strategic defensive action directive |
| **Archivist** | LLM Parse Website | Hourly scrape of rekt.news, DeFiHackLabs, GitHub advisories |
| **Messenger** | HTTP POST | Discord/Telegram/PagerDuty alerts (non-critical path) |

---

## 🏗️ Repository Structure

```
aegis-swarm/
├── frontend/          # Next.js 14 SOC Dashboard
│   └── src/
│       ├── app/       # App Router pages (overview, threats, contracts, incidents...)
│       └── components/ # UI components (ThreatMap, SwarmStatus, SeverityGauge...)
│
├── backend/           # Node.js streams indexer + REST API
│   └── src/
│       ├── streams/   # @somnia-chain/streams subscriber
│       ├── api/       # REST endpoints
│       └── db/        # PostgreSQL + Redis
│
├── contracts/         # Solidity contracts (Foundry)
│   ├── src/
│   │   ├── AegisCore.sol        # Central orchestrator (SomniaEventHandler)
│   │   ├── ThreatRegistry.sol   # On-chain attack signature DB
│   │   ├── AlertRegistry.sol    # Append-only incident log
│   │   ├── VaultGuard.sol       # Circuit breaker + rate limiter
│   │   └── AegisTreasury.sol    # Agent fee management
│   ├── test/          # Foundry tests (unit + fuzz)
│   └── script/        # Deploy scripts
│
├── agents/            # TypeScript agent wrappers
│   └── src/
│       ├── sentinel/  # Threat intel aggregator
│       ├── analyst/   # LLM prompt engineering
│       ├── responder/ # Action orchestration
│       ├── archivist/ # CVE scraper
│       └── messenger/ # Alert delivery
│
├── tests/             # Integration + E2E tests
├── scripts/           # Deployment + utility scripts
└── docs/              # Architecture + API documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.0.0
- **Foundry** (forge, cast, anvil) — install with `curl -L https://foundry.paradigm.xyz | bash`
- **Git**

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/aegis-swarm
cd aegis-swarm

# Install all workspace dependencies
npm install

# Build contracts
npm run contracts:build
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values:
# - DEPLOYER_PRIVATE_KEY
# - SOMNIA_TESTNET_RPC_URL (already set)
# - Agent IDs (from docs.somnia.network/agents)
```

### 3. Deploy Contracts

```bash
# Deploy to Somnia Testnet
npm run contracts:deploy

# Seed ThreatRegistry with known attack signatures
npx ts-node scripts/seed-threats.ts
```

### 4. Run Development Servers

```bash
# Start all workspaces (frontend + backend)
npm run dev

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

### 5. Simulate an Attack (Demo)

```bash
npx ts-node scripts/simulate-attack.ts --type=reentrancy --contract=0x...
```

---

## 🔧 Development

### Contract Development

```bash
# Build contracts
npm run contracts:build

# Run tests
npm run contracts:test

# Run with fuzz testing
cd contracts && forge test --fuzz-runs 1000

# Deploy locally (Anvil)
cd contracts && anvil --fork-url https://dream-rpc.somnia.network &
forge script script/Deploy.s.sol --rpc-url localhost --broadcast
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # TypeScript check
```

### Backend Development

```bash
cd backend
npm run dev          # Start with hot reload (tsx watch)
npm run build        # TypeScript compile
npm run typecheck    # TypeScript check
```

---

## 🌐 Network Configuration

| Network | Chain ID | RPC | Block Explorer |
|---|---|---|---|
| Somnia Testnet | `50312` | `https://dream-rpc.somnia.network` | `https://shannon-explorer.somnia.network` |
| Somnia Mainnet | `5031` | `https://mainnet-rpc.somnia.network` | — |

---

## 📐 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview.  
See [docs/](./docs/) for detailed design documents.

### Why Somnia?

Aegis Swarm is **architecturally impossible** on any other L1:

| Feature | Somnia | Ethereum | Other L1s |
|---|---|---|---|
| Same-block reactive defense | ✅ Native | ❌ No reactivity | ❌ No reactivity |
| On-chain AI threat analysis | ✅ LLM Inference agents | ❌ Not possible | ❌ Not possible |
| External CVE data on-chain | ✅ JSON API agents | ❌ Centralized oracles | ❌ Centralized oracles |
| No off-chain keeper bots | ✅ Event subscriptions | ❌ Requires keepers | ❌ Requires keepers |

---

## 🛣️ Roadmap

| Phase | Status | Milestone |
|---|---|---|
| Phase 0: Architecture | ✅ Complete | 6 design documents |
| Phase 1: Contracts | 🟡 In Progress | Core smart contracts scaffolded |
| Phase 2: Agents | ⬜ Planned | 5-agent swarm live on Somnia Testnet |
| Phase 3: Security Hardening | ⬜ Planned | Fuzz tests, security review |
| Phase 4: Dashboard | ⬜ Planned | Full SOC dashboard with live data |
| Phase 5: Submission | ⬜ Planned | Demo video, public deployment |

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)

---

<div align="center">

**Built with ❤️ on Somnia**

[Somnia Docs](https://docs.somnia.network) · [Encode Club Agentathon](https://www.encode.club) · [DeFiHackLabs](https://github.com/SunWeb3Sec/DeFiHackLabs)

</div>
