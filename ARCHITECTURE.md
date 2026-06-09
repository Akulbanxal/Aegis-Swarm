# ARCHITECTURE.md — Aegis Swarm

> **System Architecture Overview**
> For detailed design, see [docs/](./docs/) — particularly [SYSTEM_DESIGN.md](./docs/SYSTEM_DESIGN.md) and [AGENT_DESIGN.md](./docs/AGENT_DESIGN.md)

---

## System Overview

Aegis Swarm is a four-layer system built exclusively on Somnia's Agentic L1 primitives:

```
┌─────────────────────────────────────────────────────────┐
│              SOMNIA TESTNET (Chain ID: 50312)           │
│                                                         │
│  Layer 1: Reactive Contracts                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AegisCore   │  │ ThreatReg.   │  │ AlertReg.    │  │
│  │ (Reactive)  │  │ (Signatures) │  │ (Event Log)  │  │
│  └──────┬──────┘  └──────────────┘  └──────────────┘  │
│         │                                               │
│  Layer 2: Somnia Agent Network                         │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │  Sentinel │ Analyst │ Responder │ Archivist      │   │
│  │  (JSON API) (LLM)   (LLM)      (Parse Web)      │   │
│  └──────┬──────────────────────────────────────────┘   │
│         │                                               │
│  Layer 3: Defense Actions                              │
│  ┌──────▼──────┐  ┌──────────────┐                    │
│  │  VaultGuard │  │  AegisTreasury│                   │
│  └─────────────┘  └──────────────┘                    │
└────────────────────────────┬────────────────────────────┘
                             │ @somnia-chain/streams
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  OFF-CHAIN SERVICES                     │
│  Backend (Node.js) │ PostgreSQL │ Redis │ WebSocket     │
│                             │                           │
│                    SOC Dashboard (Next.js)              │
└─────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Same-Block Defense
`AegisCore` inherits `SomniaEventHandler` and implements `_onEvent()`.  
Somnia calls this **in the same block** as the triggering transaction.  
A **soft-lock** (rate limits) fires immediately — before any agent result.  
**Hard-pause** fires only after Analyst agent confirms severity ≥ 80.

### 2. Deterministic AI
All LLM agents run at `temperature=0` with a fixed seed.  
The **same input always produces the same output** across all validators.  
Validator consensus is achieved — no single validator can manipulate threat classifications.

### 3. Async Callbacks
Somnia agents return results via ABI-encoded callbacks.  
Each invocation gets a `requestId` used to match callbacks to pending analyses.  
All callbacks validate: `onlyAgentRouter` + `onlyRegisteredCallback(requestId)` + `nonReentrant`.

### 4. Zero Funds in AegisCore
`AegisCore` holds no funds — making it an unattractive exploit target.  
All STT deposits live in `AegisTreasury`, segregated per protocol.

---

## Contract Addresses (Somnia Testnet)

> Updated after deployment. See `.env` for current values.

| Contract | Address |
|---|---|
| AegisCore | `TBD` |
| ThreatRegistry | `TBD` |
| AlertRegistry | `TBD` |
| VaultGuard | `TBD` |
| AegisTreasury | `TBD` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.24, Foundry 1.7.1 |
| Agent Wrappers | TypeScript, viem |
| Backend | Node.js, Express, WebSocket |
| Database | PostgreSQL 15, Redis 7 |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion |
| Wallet | wagmi v2, viem |
| Chain Data | `@somnia-chain/streams` |
| Monorepo | npm Workspaces, Turborepo |

---

## Documentation Index

| Document | Description |
|---|---|
| [PROJECT_VISION.md](./docs/PROJECT_VISION.md) | Problem statement, vision, value propositions |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Full 4-layer architecture with ASCII diagrams |
| [SYSTEM_DESIGN.md](./docs/SYSTEM_DESIGN.md) | Contract design, DB schema, frontend components |
| [AGENT_DESIGN.md](./docs/AGENT_DESIGN.md) | All 5 agents: prompts, callbacks, economics |
| [ROADMAP.md](./docs/ROADMAP.md) | 5-phase agentathon development plan |
| [RISKS.md](./docs/RISKS.md) | 19 risks with mitigations and contingencies |
