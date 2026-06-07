# ARCHITECTURE.md — Aegis Swarm

> **System Architecture Reference**
> Somnia Agentic L1 | Chain ID: 50312 (Testnet) / 5031 (Mainnet)

---

## 1. Architecture Philosophy

Aegis Swarm is designed around four non-negotiable principles:

1. **On-Chain First**: Every critical defense action happens on-chain. No off-chain middleware controls security decisions.
2. **Consensus-Verified Intelligence**: AI threat analysis runs on Somnia's deterministic LLM agents — consensus-verified, auditable, immutable.
3. **Autonomous by Default**: The swarm operates without human input. Humans can override but are never required.
4. **Zero Single Points of Failure**: The swarm is decentralized. If a component fails, others continue. No agent is a bottleneck.

---

## 2. High-Level Architecture Overview

```
╔══════════════════════════════════════════════════════════════════════╗
║                         AEGIS SWARM                                  ║
║                    On-Chain Defense System                           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   ┌────────────────────────────────────────────────────────────┐    ║
║   │                  REACTIVE CONTRACT LAYER                   │    ║
║   │   AegisCore.sol  ←→  Threat Detection (SomniaEventHandler) │    ║
║   │   CircuitBreaker.sol  ←→  ProtectedContract (subscriber)   │    ║
║   └──────────────────────────┬─────────────────────────────────┘    ║
║                              │ triggers                              ║
║   ┌──────────────────────────▼─────────────────────────────────┐    ║
║   │                   SOMNIA AGENT LAYER                        │    ║
║   │                                                             │    ║
║   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│    ║
║   │  │  Sentinel    │  │  Analyst    │  │    Responder        ││    ║
║   │  │  Agent       │  │  Agent      │  │    Agent            ││    ║
║   │  │ (JSON API)   │  │ (LLM Infer) │  │ (Orchestrator)     ││    ║
║   │  └─────────────┘  └─────────────┘  └─────────────────────┘│    ║
║   │                                                             │    ║
║   │  ┌─────────────┐  ┌─────────────┐                          │    ║
║   │  │  Archivist  │  │  Messenger  │                          │    ║
║   │  │  Agent      │  │  Agent      │                          │    ║
║   │  │(LLM Parse)  │  │ (HTTP POST) │                          │    ║
║   │  └─────────────┘  └─────────────┘                          │    ║
║   └─────────────────────────────────────────────────────────────┘    ║
║                              │ results via ABI callback              ║
║   ┌──────────────────────────▼─────────────────────────────────┐    ║
║   │                 DEFENSIVE ACTION LAYER                      │    ║
║   │  AegisTreasury.sol  |  VaultGuard.sol  |  AlertRegistry.sol│    ║
║   └─────────────────────────────────────────────────────────────┘    ║
║                              │                                       ║
║   ┌──────────────────────────▼─────────────────────────────────┐    ║
║   │              DATA STREAMS LAYER (Off-Chain)                 │    ║
║   │          @somnia-chain/streams WebSocket SDK                │    ║
║   │          SOC Dashboard  |  Alert Webhooks                   │    ║
║   └─────────────────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 3. Layer-by-Layer Breakdown

### Layer 1: Reactive Contract Layer

The backbone of Aegis Swarm. Every registered protected contract emits events that `AegisCore.sol` subscribes to via Somnia's native on-chain reactivity.

**Key Contracts:**
- `AegisCore.sol` — Central orchestrator. Inherits `SomniaEventHandler`. Receives event triggers and dispatches agent requests.
- `ProtectedContractWrapper.sol` — Proxy wrapper that protected contracts register with. Emits standardized security events.
- `CircuitBreaker.sol` — Autonomous pause/unpause logic that executes within the same block as threat detection.
- `ThreatRegistry.sol` — On-chain registry of known threat signatures, attack patterns, and vulnerability fingerprints.

**How on-chain reactivity works:**
```solidity
// AegisCore inherits SomniaEventHandler
contract AegisCore is SomniaEventHandler {
    function _onEvent(
        address source,
        bytes32 topic0,
        bytes calldata eventData
    ) internal override {
        // Called by Somnia protocol when subscribed event fires
        // This runs IN THE SAME BLOCK as the triggering transaction
        _dispatchThreatAnalysis(source, topic0, eventData);
    }
}
```

### Layer 2: Somnia Agent Layer

Five specialized agents run as decentralized sandboxed compute containers on Somnia's validator network. Each is invoked via ABI-encoded HTTP POST, receives a `requestId`, and delivers results via callback to `AegisCore`.

**Agent 1: Sentinel Agent**
- Type: `JSON API Request` agent
- Function: Fetches external threat intelligence
- Sources: CERT/CC CVE feeds, DeFiHackLabs database, Etherscan contract similarity APIs, real-time MEV bot tracker APIs
- Invoked: Every N blocks for proactive scanning + on any suspicious event

**Agent 2: Analyst Agent**
- Type: `LLM Inference` agent (deterministic, temperature=0)
- Function: Classifies threat patterns using AI
- Input: Raw event data + threat context from Sentinel
- Output: Threat severity score (0-100), attack vector classification, recommended response
- Determinism: Same event data always yields identical threat classification across all validators

**Agent 3: Responder Agent**
- Type: `LLM Inference` agent (orchestrator logic)
- Function: Determines optimal defensive action from threat analysis
- Input: Analyst output + current protocol state
- Output: Action directive (PAUSE | DRAIN_LIMIT | ALERT | BLACKLIST_ADDRESS | NO_ACTION)
- Constraint: Can only recommend — `AegisCore` executes based on governance-set thresholds

**Agent 4: Archivist Agent**
- Type: `LLM Parse Website` agent
- Function: Monitors security forums, GitHub advisories, Rekt.news for new vulnerability announcements
- Schedule: Runs on timed on-chain subscription (every 1 hour via reactive timer)
- Output: Enriches on-chain `ThreatRegistry.sol` with new signatures

**Agent 5: Messenger Agent**
- Type: HTTP POST / Outbound Communication agent
- Function: Sends human-readable alerts to external webhooks (Discord, Telegram, PagerDuty)
- Input: Responder directive + event context
- Output: Formatted alert delivered to registered webhook URLs
- Note: Non-critical path — defense executes regardless of messenger success

### Layer 3: Defensive Action Layer

The execution layer. Contracts that perform actual defensive actions, triggered by `AegisCore` after agent callbacks.

- `AegisTreasury.sol` — Manages staking and incentive pool for Aegis operation
- `VaultGuard.sol` — Implements withdrawal limits, velocity checks, and flash-loan circuit breakers
- `AlertRegistry.sol` — Immutable on-chain log of every security event, action taken, and receipt hash

### Layer 4: Data Streams Layer (Off-Chain)

Uses `@somnia-chain/streams` SDK to subscribe to `AlertRegistry` events and stream them to the SOC Dashboard in real-time. This layer is purely observational — it never controls security decisions.

---

## 4. Event Flow Architecture

```
ATTACK ATTEMPT
      │
      ▼
Protected Contract emits event
(e.g., UnusualWithdrawal, FlashLoanDetected, ReentrancyAttempt)
      │
      ▼ [Somnia native reactivity — same block]
AegisCore._onEvent() fires
      │
      ├──→ CircuitBreaker.softLock() [immediate, pre-analysis safety]
      │
      ▼
AegisCore invokes Sentinel Agent
(requestId_1 = sentinel.invoke(contractAddress, eventData))
      │
      ▼ [Agent callback — within block]
Sentinel returns: threat_context (CVE matches, known attack vectors)
      │
      ▼
AegisCore invokes Analyst Agent
(requestId_2 = analyst.invoke(eventData, threat_context))
      │
      ▼ [Agent callback — deterministic LLM]
Analyst returns: {severity: 87, vector: "FLASH_LOAN_REENTRANCY", confidence: 0.94}
      │
      ├──[severity >= 80]──→ AegisCore invokes Responder Agent
      │                       Responder returns: "EXECUTE_FULL_PAUSE"
      │                       AegisCore → ProtectedContract.pause()
      │                       AegisCore → AlertRegistry.log(CRITICAL)
      │
      ├──[severity 40-79]──→ AegisCore → VaultGuard.setWithdrawalLimit(reduced)
      │                       AegisCore → AlertRegistry.log(WARNING)
      │
      └──[severity < 40]──→ AegisCore → CircuitBreaker.unlock()
                             AegisCore → AlertRegistry.log(INFO)
      │
      ▼
Messenger Agent → Discord/Telegram webhook
      │
      ▼
@somnia-chain/streams pushes AlertRegistry event to SOC Dashboard
```

---

## 5. Agent Invocation Pattern (Somnia Native)

All agents follow Somnia's EVM-native schema:

```solidity
// Invoke a Somnia Agent from within AegisCore
function _invokeSentinelAgent(address target, bytes calldata eventData)
    internal
    returns (bytes32 requestId)
{
    bytes memory payload = abi.encode(
        "GET",
        string(abi.encodePacked(
            "https://api.defihacklabs.io/check?address=",
            Strings.toHexString(uint256(uint160(target)), 20)
        )),
        "$.threats"  // JSON path selector
    );

    requestId = IAgentRouter(AGENT_ROUTER).invoke{value: agentDepositAmount}(
        SENTINEL_AGENT_ID,  // bytes32 agentId
        payload,
        address(this),      // callback target
        this.onSentinelResult.selector  // callback function
    );
}

// Callback — called by Somnia network after agent consensus
function onSentinelResult(bytes32 requestId, bytes calldata result)
    external
    onlyAgentRouter
{
    ThreatContext memory ctx = abi.decode(result, (ThreatContext));
    _invokeAnalystAgent(pendingEvents[requestId], ctx);
}
```

---

## 6. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SOMNIA TESTNET                           │
│                                                                 │
│  Protected Contracts                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │Contract A│  │Contract B│  │Contract C│  ...                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                      │
│       │              │              │                            │
│       └──────────────┴──────────────┘                           │
│                      │ events                                   │
│                      ▼                                          │
│            ┌─────────────────┐                                  │
│            │   AegisCore.sol  │ ← SomniaEventHandler            │
│            └────────┬────────┘                                  │
│                     │ agent invocations                         │
│                     ▼                                           │
│  ┌──────────────────────────────────────────────┐               │
│  │          Somnia Agent Network                │               │
│  │  Sentinel│Analyst│Responder│Archivist│Msngr  │               │
│  └──────────────────┬─────────────────────────-─┘               │
│                     │ ABI callbacks                             │
│                     ▼                                           │
│            ┌────────────────┐  ┌─────────────┐                  │
│            │ AlertRegistry  │  │ VaultGuard  │                  │
│            └────────┬───────┘  └─────────────┘                  │
│                     │                                            │
└─────────────────────┼──────────────────────────────────────────┘
                      │ @somnia-chain/streams WebSocket
                      ▼
           ┌──────────────────────┐
           │   SOC Dashboard      │
           │   (React / Next.js)  │
           └──────────────────────┘
```

---

## 7. Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| Smart Contracts | Solidity 0.8.24 + Somnia Reactivity SDK | EVM-native, battle-tested, `SomniaEventHandler` integration |
| Agent Types | JSON API Request, LLM Inference, LLM Parse Website | Core Somnia agents (Phase 1 available now) |
| Development | Hardhat + TypeScript | Industry standard, Somnia-compatible |
| Testing | Foundry (fuzz testing) | Fast, Somnia fork testing |
| Off-chain SDK | `@somnia-chain/streams` | Official Somnia data streaming |
| Frontend | Next.js 14 + TypeScript | SSR for real-time dashboard |
| Styling | TailwindCSS + shadcn/ui | Rapid development, SOC aesthetic |
| State | Zustand + React Query | Real-time data management |
| Database | PostgreSQL (event history) + Redis (real-time cache) | Persistent audit log + live stream cache |
| Deployment | Vercel (frontend) + Railway (backend streams service) | Zero-ops, global CDN |
| Wallet | wagmi v2 + viem | Somnia-compatible wallet integration |

---

## 8. Scalability Architecture

Aegis Swarm is designed to scale from 10 to 10,000+ protected contracts without architectural changes:

- **Agent parallelism**: Each protected contract's events trigger independent agent invocations — no serialization bottleneck
- **Batch analysis**: Archivist Agent scans all registered contracts in a single invocation
- **Somnia's 1M+ TPS**: The base chain can handle all concurrent event streams without degradation
- **IceDB**: Nanosecond-latency reads for threat signature lookups — no caching layer needed on-chain
- **Subscription batching**: Multiple contracts can subscribe to `AegisCore` — single handler, fan-out response
