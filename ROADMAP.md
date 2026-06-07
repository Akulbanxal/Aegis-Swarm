# ROADMAP.md — Aegis Swarm

> **Development Roadmap**
> Agentathon Timeline + Post-Hackathon Milestones

---

## Agentathon Timeline

The Somnia Agentathon runs for **4 weeks** starting May 20, 2026.

```
Week 1 (May 20–27): Foundation
Week 2 (May 28 – Jun 3): Core Implementation
Week 3 (Jun 4–10): Integration & Security Hardening
Week 4 (Jun 11–17): Polish, Demo, Submission
```

---

## PHASE 0 — Architecture & Research (Pre-implementation)
**Status: COMPLETE (you are here)**

- [x] Research Somnia Agent framework (Phase 1 base agents)
- [x] Research on-chain reactivity (`SomniaEventHandler`)
- [x] Research `@somnia-chain/streams` SDK
- [x] Research Agentathon requirements
- [x] Define agent swarm architecture (5 agents)
- [x] Define smart contract hierarchy
- [x] Write PROJECT_VISION.md
- [x] Write ARCHITECTURE.md
- [x] Write SYSTEM_DESIGN.md
- [x] Write AGENT_DESIGN.md
- [x] Write ROADMAP.md
- [x] Write RISKS.md

---

## PHASE 1 — Smart Contract Foundation
**Target: Week 1 (May 20–27)**

### 1.1 Development Environment Setup
- [ ] Initialize Hardhat project with TypeScript
- [ ] Configure Somnia Testnet network (`chainId: 50312`, `rpc: dream-rpc.somnia.network`)
- [ ] Install Somnia Reactivity SDK (`@somnia-chain/reactivity-contracts`)
- [ ] Install Somnia Streams SDK (`@somnia-chain/streams`)
- [ ] Set up Foundry for fuzz testing
- [ ] Configure `hardhat.config.ts` with Somnia fork support
- [ ] Set up wallet and obtain STT from faucet

### 1.2 Core Smart Contracts (v0.1)
- [ ] `ThreatRegistry.sol` — threat signature storage, CRUD
- [ ] `AlertRegistry.sol` — append-only incident log
- [ ] `VaultGuard.sol` — rate limiting and withdrawal velocity checks
- [ ] `AegisTreasury.sol` — STT deposit management and agent fee routing

### 1.3 Reactive Core (v0.1)
- [ ] `AegisCore.sol` inheriting `SomniaEventHandler`
- [ ] `_onEvent()` implementation (soft-lock + Sentinel dispatch)
- [ ] `registerContract()` function (registers target + subscribes to events)
- [ ] Basic `ProtectedContractWrapper.sol` (standardized event emission)

### 1.4 Unit Tests
- [ ] ThreatRegistry: add/update/remove signatures
- [ ] AlertRegistry: append-only enforcement, log retrieval
- [ ] VaultGuard: rate limit logic, velocity checks
- [ ] AegisCore: event subscription, soft-lock logic

**Phase 1 Deliverable:** Deployable smart contracts on local Hardhat fork. Basic event flow working without agents.

---

## PHASE 2 — Agent Integration
**Target: Week 2 (May 28 – June 3)**

### 2.1 Sentinel Agent Integration
- [ ] Implement `_dispatchSentinel()` in AegisCore
- [ ] Implement `onSentinelResult()` callback handler
- [ ] Build Aegis threat aggregator API endpoint (simple Node.js server)
  - [ ] Integrates DeFiHackLabs API
  - [ ] Integrates Etherscan contract API
  - [ ] Returns structured `SentinelResult` JSON
- [ ] Test Sentinel Agent invocation on Somnia Testnet
- [ ] Implement fast-path: known attacker → immediate hard pause

### 2.2 Analyst Agent Integration
- [ ] Implement `_dispatchAnalyst()` in AegisCore
- [ ] Craft and test Analyst LLM prompt for deterministic output
- [ ] Implement `onAnalystResult()` callback handler
- [ ] Test severity threshold routing (critical / warning / info paths)

### 2.3 Responder Agent Integration
- [ ] Implement `_dispatchResponder()` in AegisCore
- [ ] Craft Responder LLM prompt (strategic, context-aware)
- [ ] Implement `onResponderResult()` callback handler
- [ ] Implement coordinated attack detection logic
- [ ] Test multi-contract alert propagation

### 2.4 Archivist Agent Integration
- [ ] Implement `scheduleArchivist()` using Somnia reactive timer
- [ ] Implement `onArchivistTimer()` → agent invocation
- [ ] Craft LLM Parse Website prompt for rekt.news
- [ ] Implement `onArchivistResult()` → ThreatRegistry update
- [ ] Test proactive scanning against registered contracts

### 2.5 Messenger Agent Integration
- [ ] Implement `_dispatchMessenger()` (non-blocking try/catch)
- [ ] Build Discord/Telegram webhook payload templates
- [ ] Test alert delivery on real Discord test server
- [ ] Implement `MessengerConfig` per-contract customization

**Phase 2 Deliverable:** Full 5-agent swarm operational on Somnia Testnet. Complete event → agent → defense flow working end-to-end.

---

## PHASE 3 — Security Hardening
**Target: Week 3 (June 4–10), Part 1**

### 3.1 Smart Contract Security Audit (Self-Review)
- [ ] Reentrancy analysis: every external call pathway
- [ ] Access control: `onlyAgentRouter`, `onlyRegisteredCallback` modifiers
- [ ] Integer arithmetic: SafeMath / overflow/underflow checks
- [ ] Callback validation: requestId matching, phase enforcement
- [ ] Circuit breaker: false positive analysis, anti-griefing protections
- [ ] Agent deposit management: rebate logic, fee handling

### 3.2 Fuzz Testing (Foundry)
- [ ] Fuzz `VaultGuard.defensiveWithdrawal()` with random amounts/addresses
- [ ] Fuzz `AegisCore._onEvent()` with random event data
- [ ] Fuzz `ThreatRegistry.addSignature()` with adversarial inputs
- [ ] Fuzz callback handlers with malformed ABI data

### 3.3 Integration Tests
- [ ] End-to-end: reentrancy attack → detection → pause
- [ ] End-to-end: flash loan attack → detection → rate limit
- [ ] End-to-end: false positive → soft lock → auto-release
- [ ] End-to-end: Archivist discovers new CVE → ThreatRegistry update → proactive scan
- [ ] End-to-end: coordinated attack → multi-contract alert

### 3.4 Anti-Griefing Implementation
- [ ] Rate limiting on `registerContract()` (max 10 per address per block)
- [ ] Stake requirement for registration
- [ ] Hard pause challenge mechanism (`AegisGovernance.challengePause()`)
- [ ] Maximum pending analyses per contract (prevent DOS via spam)

**Phase 3 Deliverable:** Security-hardened contracts. All test suites passing.

---

## PHASE 4 — Dashboard & Off-Chain Services
**Target: Week 3 (June 4–10), Part 2**

### 4.1 Data Streams Service (Backend)
- [ ] Node.js streams service connecting to `@somnia-chain/streams`
- [ ] Subscribe to `AlertRegistry` event topics
- [ ] Index events to PostgreSQL database
- [ ] Publish to Redis for real-time dashboard
- [ ] REST API: `/incidents`, `/contracts`, `/swarm/status`, `/metrics`
- [ ] WebSocket server for dashboard live updates

### 4.2 SOC Dashboard (Frontend)
- [ ] Initialize Next.js 14 project with TypeScript + Tailwind
- [ ] **Overview Page**: Threat map, swarm status hexagons, contract health grid
- [ ] **Threat Feed Page**: Real-time event stream with severity filtering
- [ ] **Contract Registry Page**: Register/manage protected contracts
- [ ] **Incident Viewer Page**: Full incident timeline with agent receipts
- [ ] **Swarm Intelligence Page**: Agent performance metrics
- [ ] Wallet connection (wagmi v2 + MetaMask for Somnia)
- [ ] Live data via WebSocket connection to streams service

### 4.3 Demo Mode
- [ ] Pre-seeded demo contracts (DeFi vault, NFT marketplace, DEX)
- [ ] Scripted attack simulations (reentrancy, flash loan, oracle manipulation)
- [ ] "Run Demo" button that fires a simulated attack sequence
- [ ] Visual replay of full agent response chain

**Phase 4 Deliverable:** Fully functional SOC dashboard with real-time Somnia data. Demo mode ready.

---

## PHASE 5 — Deployment & Demo Polish
**Target: Week 4 (June 11–17)**

### 5.1 Mainnet Testnet Deployment
- [ ] Deploy all contracts to Somnia Testnet (chain ID 50312)
- [ ] Verify all contracts on Somnia block explorer
- [ ] Fund AegisTreasury with STT
- [ ] Register 3 demo protected contracts
- [ ] Run Archivist Agent initial seed (populate ThreatRegistry)
- [ ] Deploy streams service to Railway
- [ ] Deploy dashboard to Vercel
- [ ] Configure custom domain: `aegisswarm.io`

### 5.2 Demo Preparation
- [ ] Record 3-minute demo video:
  - 0:00–0:30: The problem (why Aegis is needed)
  - 0:30–1:30: Live demo: attack simulation → agent response → dashboard
  - 1:30–2:30: Architecture walkthrough (Somnia primitives used)
  - 2:30–3:00: Vision & call to action
- [ ] Prepare 5-slide pitch deck (for judges)
- [ ] Set up live demo URL for judges

### 5.3 Submission Materials
- [ ] GitHub repository (public, clean README)
- [ ] `README.md` with: quick start, architecture overview, live demo link
- [ ] `CONTRACTS.md` with deployed contract addresses
- [ ] Encode Club submission form
- [ ] Demo video link (YouTube/Loom)

### 5.4 Final Quality Checks
- [ ] All contracts verified on block explorer
- [ ] Dashboard accessible on live URL
- [ ] Demo simulation works end-to-end
- [ ] All documentation complete
- [ ] Agent receipt hashes linkable from dashboard

**Phase 5 Deliverable:** Production-ready submission. Public demo live. Judges can interact with the system.

---

## Post-Agentathon Roadmap

### v1.1 — Open Beta (Month 1-2 Post-Agentathon)
- Community registration: Any Somnia developer can register their contract
- Enhanced threat database: 200+ known attack signatures
- Mobile-responsive dashboard
- Email/SMS alert channel support
- Discord bot for real-time monitoring

### v1.2 — Protocol Integrations (Month 3-4)
- Aave integration: automatic liquidation protection
- Uniswap integration: sandwich attack detection
- OpenZeppelin Defender integration: complementary monitoring
- Nexus Mutual integration: coverage linked to Aegis defense proof

### v2.0 — Somnia Agent Phase 2 Adoption (Month 6-12)
- Custom Aegis Sentinel Agent (bespoke, not just JSON API)
- ML-based vulnerability detection model (fine-tuned on DeFi exploits)
- Bytecode static analysis agent
- Transaction simulation agent (simulate before execution)
- User-defined defense rules (Solidity DSL)

### v3.0 — Decentralized Governance (Month 12-24)
- AEGIS governance token launch
- Community-curated threat signature database (DAO-controlled)
- Cross-chain monitoring (Ethereum, BSC via Somnia bridges)
- Bug bounty coordination protocol
- Autonomous smart contract upgrading (AI-suggested patches + governance vote)
- Insurance protocol: AEGIS stakes backing protocol coverage claims

---

## Key Milestones Summary

| Milestone | Target Date | Success Criteria |
|---|---|---|
| Architecture Complete | Day 1 (you are here) | All 6 design docs complete |
| Contracts Deployed (local) | Week 1 end | Full event flow on Hardhat fork |
| 5 Agents Integrated | Week 2 end | End-to-end Sentinel→Analyst→Responder chain working |
| Security Hardened | Week 3 mid | All fuzz tests passing, security checklist complete |
| Dashboard Live | Week 3 end | Real-time data from Somnia Testnet on production URL |
| Submission Ready | Week 4 | Public repo + demo video + live URL + contracts verified |
| Open Beta | Month 2 | 10+ external contracts registered |
| v2.0 Custom Agents | Month 9 | Phase 2 agent features fully adopted |
