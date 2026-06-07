# SYSTEM_DESIGN.md — Aegis Swarm

> **Detailed System Design Reference**
> Smart Contract Architecture | Event Flows | Security Design

---

## 1. Smart Contract Architecture

### 1.1 Contract Hierarchy

```
AegisCore.sol                    [Central Orchestrator]
├── implements SomniaEventHandler
├── owns ThreatRegistry.sol      [Threat Signature DB]
├── owns AlertRegistry.sol       [Immutable Event Log]
├── coordinates CircuitBreaker.sol
└── coordinates VaultGuard.sol

ProtectedContractWrapper.sol     [Registration Interface]
├── Proxy pattern (EIP-1967)
├── Standardizes event emission
└── Hooks into AegisCore subscriptions

AegisTreasury.sol                [Economics Layer]
├── Manages STT deposits for agent invocations
├── Manages staking for Aegis operators
└── Distributes rewards/refunds

AegisGovernance.sol              [Protocol Configuration]
├── Threshold settings (severity cutoffs)
├── Whitelist/blacklist management
└── Agent ID registry
```

### 1.2 AegisCore.sol — Core Contract Design

```solidity
// Core state
struct PendingAnalysis {
    address targetContract;
    bytes32 eventTopic;
    bytes   rawEventData;
    uint256 blockNumber;
    bytes32 sentinelRequestId;
    bytes32 analystRequestId;
    bytes32 responderRequestId;
    Phase   currentPhase;
}

enum Phase { SENTINEL, ANALYST, RESPONDER, COMPLETE }

// Storage
mapping(bytes32 => PendingAnalysis) public pendingAnalyses;
mapping(address => bool)            public registeredContracts;
mapping(address => bool)            public circuitBreakerActive;

// Threat thresholds (governance-controlled)
uint256 public CRITICAL_THRESHOLD = 80;  // Triggers full pause
uint256 public WARNING_THRESHOLD  = 40;  // Triggers withdrawal limits
uint256 public INFO_THRESHOLD     = 10;  // Log only

// Agent IDs (set during deployment, updatable via governance)
bytes32 public constant SENTINEL_AGENT_ID  = 0x...;
bytes32 public constant ANALYST_AGENT_ID   = 0x...;
bytes32 public constant RESPONDER_AGENT_ID = 0x...;
bytes32 public constant ARCHIVIST_AGENT_ID = 0x...;
bytes32 public constant MESSENGER_AGENT_ID = 0x...;
```

### 1.3 On-Chain Reactivity Implementation

Somnia's `SomniaEventHandler` gives `AegisCore` the ability to react to events from registered contracts within the same block — no external keeper required.

```solidity
contract AegisCore is SomniaEventHandler, ReentrancyGuard, Ownable {

    // Called by Somnia protocol when a subscribed event fires
    function _onEvent(
        address source,      // Contract that emitted the event
        bytes32 topic0,      // Event signature hash
        bytes calldata data  // ABI-encoded event data
    ) internal override nonReentrant {

        // Gate: Only process registered contracts
        require(registeredContracts[source], "AegisCore: unregistered source");

        // Phase 0: Immediate pre-analysis safety action
        // Soft-lock: rate limits only, not full pause (avoids false positive downtime)
        _softLock(source);

        // Phase 1: Dispatch Sentinel Agent (external threat intel)
        bytes32 requestId = _dispatchSentinel(source, topic0, data);

        // Record pending analysis
        pendingAnalyses[requestId] = PendingAnalysis({
            targetContract: source,
            eventTopic:     topic0,
            rawEventData:   data,
            blockNumber:    block.number,
            sentinelRequestId: requestId,
            analystRequestId:  bytes32(0),
            responderRequestId: bytes32(0),
            currentPhase:   Phase.SENTINEL
        });

        emit ThreatDetected(source, topic0, requestId, block.number);
    }
}
```

### 1.4 VaultGuard.sol — Withdrawal Protection

```solidity
contract VaultGuard {
    struct WithdrawalConfig {
        uint256 maxPerBlock;        // Max withdrawal per block
        uint256 maxPerTransaction;  // Max single withdrawal
        uint256 cooldownBlocks;     // Blocks between large withdrawals
        uint256 flashLoanThreshold; // Flash loan detection threshold
        bool    paused;             // Emergency pause flag
    }

    // Per-contract configuration
    mapping(address => WithdrawalConfig) public configs;
    mapping(address => uint256)          public lastWithdrawalBlock;
    mapping(address => uint256)          public blockWithdrawalTotal;

    modifier defensiveWithdrawal(address target, uint256 amount) {
        WithdrawalConfig memory cfg = configs[target];
        require(!cfg.paused, "VaultGuard: contract paused");
        require(amount <= cfg.maxPerTransaction, "VaultGuard: exceeds single tx limit");

        if (block.number == lastWithdrawalBlock[target]) {
            require(
                blockWithdrawalTotal[target] + amount <= cfg.maxPerBlock,
                "VaultGuard: exceeds block limit"
            );
        } else {
            // New block — reset counter
            blockWithdrawalTotal[target] = 0;
            lastWithdrawalBlock[target] = block.number;
        }

        // Flash loan detection: balance before vs expected after
        uint256 expectedBalance = target.balance - amount;
        _;
        require(
            target.balance >= expectedBalance,
            "VaultGuard: flash loan manipulation detected"
        );

        blockWithdrawalTotal[target] += amount;
    }
}
```

### 1.5 ThreatRegistry.sol — Threat Signature Database

```solidity
contract ThreatRegistry {
    struct ThreatSignature {
        bytes32 signatureHash;    // Keccak256 of attack pattern
        string  attackVector;     // e.g., "FLASH_LOAN_REENTRANCY"
        uint256 severity;         // 0-100
        uint256 lastSeenBlock;
        uint256 occurrenceCount;
        bool    active;
    }

    // Known attack signatures (updated by Archivist Agent)
    mapping(bytes32 => ThreatSignature) public signatures;
    bytes32[] public signatureIndex;

    // Historical incidents (immutable audit trail)
    struct Incident {
        address targetContract;
        bytes32 signatureHash;
        uint256 blockNumber;
        uint256 severity;
        ActionTaken action;
        bytes32 agentReceiptHash; // Somnia agent execution receipt
    }
    Incident[] public incidents;
}
```

---

## 2. Event Flow Architecture

### 2.1 Primary Defense Flow (Attack Response)

```
T=0   Block N begins
      Protected Contract receives malicious transaction

T=0   [Somnia Reactivity — same block]
      AegisCore._onEvent() fires
      - Soft-lock activated (rate limits applied)
      - Sentinel Agent invoked → requestId_1

T=+Δ  Sentinel Agent callback (block N or N+1)
      Returns: {cve_matches: [...], known_attacker: true, attack_vector: "REENTRANCY"}
      - Analyst Agent invoked → requestId_2

T+2Δ  Analyst Agent callback (LLM inference)
      Returns: {severity: 91, confidence: 0.97, vector: "REENTRANCY_CROSS_FUNCTION"}
      - severity >= CRITICAL_THRESHOLD (80)
      → Responder Agent invoked → requestId_3
      → CircuitBreaker.pause(targetContract) [IMMEDIATE — does NOT wait for responder]

T+3Δ  Responder Agent callback
      Returns: {action: "FULL_PAUSE", rationale: "..."}
      - Validates alignment with AegisCore's immediate pause action
      - AlertRegistry.logIncident(CRITICAL, receipt_hash)
      - Messenger Agent invoked (async, non-blocking)

T+3Δ  AlertRegistry event emitted
      @somnia-chain/streams broadcasts to SOC Dashboard
      Discord/Telegram webhook delivered
```

### 2.2 Proactive Monitoring Flow (Scheduled Scanning)

```
Every 1 hour (via on-chain reactive timer):
      Archivist Agent invoked
      → Fetches: Rekt.news, DeFiHackLabs, GitHub security advisories
      → LLM parse: extracts structured vulnerability data
      → ThreatRegistry.updateSignatures(new_sigs)
      → For each registered contract: checks bytecode similarity against new vulns
      → Issues pre-emptive WARNING alerts if matches found
```

### 2.3 New Contract Registration Flow

```
Developer calls: AegisCore.registerContract(contractAddress, config)
│
├── VaultGuard.initConfig(contractAddress, config.withdrawalLimits)
├── ThreatRegistry.initCoverage(contractAddress)
├── SomniaEventHandler.subscribe(contractAddress, eventTopics)
│   [Subscribes to all specified event topics from target contract]
├── AegisTreasury.deposit{value: initialDeposit}(contractAddress)
└── AlertRegistry.logRegistration(contractAddress, msg.sender)
    └── Event: ContractRegistered(contractAddress, block.number)
        → SOC Dashboard updates via @somnia-chain/streams
```

---

## 3. Security Design

### 3.1 Threat Model

Aegis Swarm must defend against both external attackers (targeting protected contracts) AND adversarial inputs (targeting Aegis itself).

**Threats we protect against:**
| Threat | Vector | Mitigation |
|---|---|---|
| Reentrancy | Malicious callback loops | Immediate circuit breaker + `nonReentrant` guards on AegisCore |
| Flash loan manipulation | Borrow → manipulate → repay in 1 tx | VaultGuard balance-before/after checks + block velocity limits |
| Oracle price manipulation | Skewed price feeds | Sentinel Agent cross-references multiple price sources |
| Governance attacks | Malicious proposals | `AegisGovernance` requires time-lock + multi-sig |
| Front-running | MEV bots exploiting detected vulnerabilities | Defensive actions execute in same block as detection |
| False positive abuse | Triggering false alarms to grief protocols | Confidence threshold requirement before hard pause |
| Agent callback spoofing | Fake responses to AegisCore | `onlyAgentRouter` modifier + requestId validation |
| Rug pulls | Owner draining contracts | Rate limits apply to all actors including contract owner |

### 3.2 AegisCore Security Properties

```solidity
// Security modifiers on all critical functions
modifier onlyAgentRouter() {
    require(msg.sender == SOMNIA_AGENT_ROUTER, "AegisCore: caller not agent router");
    _;
}

modifier onlyRegisteredCallback(bytes32 requestId) {
    require(pendingAnalyses[requestId].targetContract != address(0), "AegisCore: unknown requestId");
    _;
}

modifier validSeverity(uint256 severity) {
    require(severity <= 100, "AegisCore: invalid severity");
    _;
}

// Callback validation pattern
function onAnalystResult(bytes32 requestId, bytes calldata result)
    external
    onlyAgentRouter               // Only Somnia network can call
    onlyRegisteredCallback(requestId)  // Must match pending analysis
    nonReentrant                  // No re-entry on callbacks
{
    // Validate result integrity
    require(result.length > 0, "AegisCore: empty result");
    AnalystResult memory res = abi.decode(result, (AnalystResult));

    // Enforce analysis belongs to correct phase
    require(
        pendingAnalyses[requestId].currentPhase == Phase.ANALYST,
        "AegisCore: wrong phase"
    );

    // Proceed with validated result...
}
```

### 3.3 Circuit Breaker Design

Aegis uses a two-stage circuit breaker to balance security with availability:

**Stage 1 — Soft Lock** (Triggered immediately on any suspicious event):
- Rate limits applied: max 10% of TVL withdrawable per block
- Applied automatically before any agent analysis
- Lifts automatically if Analyst returns severity < INFO_THRESHOLD

**Stage 2 — Hard Pause** (Triggered on CRITICAL threat):
- Full withdrawal halt
- Requires both Analyst severity >= CRITICAL_THRESHOLD AND Responder confirmation
- OR automatic if smart contract state matches known exploit pattern (no agent needed)
- Liftable only by multi-sig OR after 24-block timeout (anti-griefing)

```solidity
// Hard pause — only callable by AegisCore (after agent confirmation)
// or by registered operators (human override)
function hardPause(address target)
    external
    {
    require(
        msg.sender == address(aegisCore)      // Agent-confirmed
        || operators[msg.sender],              // Human operator override
        "VaultGuard: unauthorized"
    );
    configs[target].paused = true;
    emit HardPauseActivated(target, msg.sender, block.number);
}
```

### 3.4 Agent Security Guarantees

Somnia's agent design gives us three security properties for free:

1. **Determinism**: LLM agents run at temperature=0 with fixed seeds. Given identical inputs, all validators produce byte-identical threat classifications. No single validator can produce a biased "pause" recommendation.

2. **Consensus Validation**: A majority of Somnia validators must agree on agent output before `AegisCore` receives the callback. An attacker cannot inject false threat data.

3. **Audit Receipts**: Every agent invocation produces a signed execution receipt on-chain. Every decision Aegis makes is permanently auditable, usable in incident reports, insurance claims, and legal proceedings.

### 3.5 Anti-Griefing Protections

Bad actors could attempt to trigger constant false alarms on registered contracts, causing availability harm:

```
Griefing Mitigations:
├── Rate limiting: Max 5 hard pauses per 100 blocks per contract
├── Stake requirement: Caller must stake 0.1 STT per registration (slashed on false alarms)
├── Confidence gate: Soft lock auto-lifts if Analyst confidence < 0.7
├── Challenge period: Any hard pause can be challenged within 24 blocks
│   └── AegisGovernance.challengePause(requestId) — opens 5-minute community review
└── Insurance backstop: AegisTreasury compensates TVL loss from false-positive pauses
```

---

## 4. Frontend Design

### 4.1 SOC Dashboard — Interface Specification

The Security Operations Center dashboard is the human window into Aegis Swarm. It connects to the Somnia network via `@somnia-chain/streams` for real-time event streaming.

**Pages:**
1. **Overview / Command Center** — Live threat map, active swarm status, protected contract health grid
2. **Threat Feed** — Real-time stream of all security events, filterable by severity/contract/type
3. **Contract Registry** — Register/manage protected contracts, view per-contract threat history
4. **Incident Viewer** — Deep dive into any incident: full event timeline, agent receipts, actions taken
5. **Swarm Intelligence** — Agent performance metrics, invocation counts, success rates, cost tracking
6. **Governance Panel** — View/vote on threshold changes, operator management, treasury stats

### 4.2 Real-Time Connection Architecture

```typescript
// Dashboard data layer — @somnia-chain/streams
import { SDK } from '@somnia-chain/streams';

const sdk = new SDK({
  rpcUrl: 'https://rpc.somnia.network',
  chainId: 50312, // Testnet
});

// Subscribe to AlertRegistry events
const threatStream = await sdk.streams.subscribe({
  contractAddress: ALERT_REGISTRY_ADDRESS,
  eventSignatures: [
    'ThreatDetected(address,bytes32,bytes32,uint256)',
    'IncidentLogged(address,uint8,uint256,bytes32)',
    'CircuitBreakerActivated(address,bool,uint256)',
    'ContractRegistered(address,address)',
  ],
  onData: (event) => {
    // Update real-time dashboard state
    dashboardStore.dispatch(processThreatEvent(event));
  },
  onlyPushChanges: true,
});
```

### 4.3 UI Component Architecture

```
SOC Dashboard (Next.js App Router)
├── /app
│   ├── /overview         → ThreatMap, ActiveSwarmStatus, ContractHealthGrid
│   ├── /threats          → LiveThreatFeed, ThreatFilters, SeverityHeatmap
│   ├── /contracts        → RegistrationWizard, ContractTable, HealthMonitor
│   ├── /incidents/[id]   → IncidentTimeline, AgentReceiptViewer, ActionLog
│   ├── /intelligence     → AgentMetricsDashboard, InvocationHistory
│   └── /governance       → ThresholdEditor, OperatorManager, TreasuryStats
│
├── /components
│   ├── ThreatMap.tsx      → D3.js world map with real-time attack visualization
│   ├── SwarmStatus.tsx    → 5-agent hexagonal status display
│   ├── SeverityGauge.tsx  → Animated severity meter (0-100)
│   ├── EventFeed.tsx      → Real-time scrolling threat stream
│   ├── AgentReceipt.tsx   → Tree view of agent execution steps
│   └── CircuitBreakerUI.tsx → Toggle with confirmation modal
│
└── /lib
    ├── streams.ts         → @somnia-chain/streams connection manager
    ├── contracts.ts       → Wagmi contract hooks for AegisCore
    └── threatClassifier.ts → Client-side severity color mapping
```

### 4.4 Design System

**Color Palette (Security SOC Aesthetic):**
- Background: `#050A0E` (deep space black)
- Surface: `#0D1B2A` (midnight navy)
- Primary: `#00E5FF` (cyan — active/safe)
- Warning: `#FFB300` (amber — elevated threat)
- Critical: `#FF1744` (red — attack in progress)
- Success: `#00E676` (green — all clear)
- Text: `#E0F7FA` (ice white)

**Typography:** Space Grotesk (headings) + JetBrains Mono (data/addresses)

**Animations:**
- Threat pulses: CSS keyframe animation on severity indicators
- Swarm hexagons: Idle breathing animation, activation burst on agent invocation
- Event feed: Smooth scroll-in with severity-colored left border
- Circuit breaker: Dramatic red flash + system-wide opacity reduction on CRITICAL

---

## 5. Database Design

### 5.1 On-Chain Storage (Primary)

All security-critical data lives on-chain in `AlertRegistry.sol` and `ThreatRegistry.sol`. This is the source of truth — tamper-proof, immutable, auditable.

```
On-Chain Storage:
├── ThreatRegistry
│   ├── signatures: mapping(bytes32 → ThreatSignature)
│   └── incidents:  Incident[]
├── AlertRegistry
│   ├── events: Event[] (append-only)
│   └── receipts: mapping(bytes32 → AgentReceiptHash)
└── AegisCore
    ├── registeredContracts: mapping(address → bool)
    ├── pendingAnalyses: mapping(bytes32 → PendingAnalysis)
    └── circuitBreakerActive: mapping(address → bool)
```

### 5.2 Off-Chain Database (PostgreSQL — Performance Layer)

Provides fast querying for dashboard and historical analytics. Indexed from on-chain events via the streams service.

```sql
-- Core tables

CREATE TABLE protected_contracts (
    address         VARCHAR(42) PRIMARY KEY,
    registered_at   BIGINT NOT NULL,           -- block number
    registered_by   VARCHAR(42) NOT NULL,
    config          JSONB NOT NULL,
    status          VARCHAR(20) DEFAULT 'active', -- active | paused | deregistered
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE security_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash         VARCHAR(66) NOT NULL,
    block_number    BIGINT NOT NULL,
    contract_addr   VARCHAR(42) NOT NULL REFERENCES protected_contracts(address),
    event_topic     VARCHAR(66) NOT NULL,
    raw_data        BYTEA,
    threat_severity INTEGER,                   -- 0-100
    attack_vector   VARCHAR(100),
    action_taken    VARCHAR(50),               -- NONE | SOFT_LOCK | RATE_LIMIT | PAUSE
    agent_request_ids JSONB,                   -- {sentinel, analyst, responder}
    receipt_hash    VARCHAR(66),               -- Somnia agent receipt
    created_at      TIMESTAMP DEFAULT NOW(),
    INDEX idx_contract_addr (contract_addr),
    INDEX idx_block_number (block_number),
    INDEX idx_severity (threat_severity)
);

CREATE TABLE threat_signatures (
    signature_hash  VARCHAR(66) PRIMARY KEY,
    attack_vector   VARCHAR(100) NOT NULL,
    severity        INTEGER NOT NULL,
    description     TEXT,
    first_seen_block BIGINT,
    occurrence_count INTEGER DEFAULT 0,
    active          BOOLEAN DEFAULT TRUE,
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_invocations (
    request_id      VARCHAR(66) PRIMARY KEY,
    agent_type      VARCHAR(50) NOT NULL,      -- SENTINEL | ANALYST | RESPONDER | ARCHIVIST | MESSENGER
    event_id        UUID REFERENCES security_events(id),
    input_hash      VARCHAR(66),
    output_hash     VARCHAR(66),
    execution_time_ms INTEGER,
    cost_stt        NUMERIC(18, 9),
    receipt_url     TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE circuit_breaker_log (
    id              SERIAL PRIMARY KEY,
    contract_addr   VARCHAR(42) NOT NULL,
    action          VARCHAR(20) NOT NULL,      -- SOFT_LOCK | HARD_PAUSE | RELEASE
    triggered_by    VARCHAR(100),              -- agent requestId or 'operator'
    severity        INTEGER,
    block_number    BIGINT,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

### 5.3 Redis Cache (Real-Time Layer)

```
Redis Key Schema:
├── aegis:contract:{address}:status     → "active"|"soft_locked"|"paused"
├── aegis:contract:{address}:severity   → current threat score (TTL: 60s)
├── aegis:swarm:status                  → JSON: {sentinel, analyst, responder, ...} activity
├── aegis:feed:latest                   → Sorted set: latest 100 events by timestamp
└── aegis:metrics:agent:{type}:count   → Invocation counter (INCR)
```

---

## 6. Deployment Architecture

### 6.1 Smart Contract Deployment Sequence

```
Step 1: Deploy AegisTreasury.sol
        → Records deployment address

Step 2: Deploy ThreatRegistry.sol
        → Seeds with 50+ known exploit signatures

Step 3: Deploy AlertRegistry.sol
        → Initializes append-only event log

Step 4: Deploy VaultGuard.sol(alertRegistry.address)

Step 5: Deploy AegisCore.sol(
            treasury, threatRegistry, alertRegistry, vaultGuard,
            sentinelAgentId, analystAgentId, responderAgentId,
            archivistAgentId, messengerAgentId
        )
        → Registers as SomniaEventHandler

Step 6: Deploy AegisGovernance.sol(aegisCore.address)
        → Transfers ownership of all contracts to governance

Step 7: Deploy ProtectedContractWrapper.sol (factory pattern)
        → Template for contract registration

Step 8: Verify all contracts on Somnia block explorer
Step 9: Fund AegisTreasury with initial STT for agent operations
Step 10: Archivist Agent initial run — seed ThreatRegistry
```

### 6.2 Off-Chain Services Deployment

```
Vercel (Frontend)
├── SOC Dashboard (Next.js)
├── Environment: NEXT_PUBLIC_SOMNIA_RPC, NEXT_PUBLIC_AEGIS_CORE_ADDRESS
└── Auto-deploys from GitHub main branch

Railway (Backend Services)
├── streams-service (Node.js)
│   ├── @somnia-chain/streams subscriber
│   ├── PostgreSQL event indexer
│   └── Redis publisher
├── PostgreSQL 15 (persistent event storage)
└── Redis 7 (real-time cache)

Docker Compose (Local Development)
├── hardhat node (local Somnia fork)
├── postgres
├── redis
└── next.js dev server
```

### 6.3 Network Configuration

```javascript
// Somnia Testnet (primary development/demo)
const somniaTestnet = {
  chainId: 50312,
  name: 'Somnia Testnet',
  rpcUrl: 'https://dream-rpc.somnia.network',
  wsUrl:  'wss://dream-rpc.somnia.network',
  blockExplorer: 'https://shannon-explorer.somnia.network',
  nativeCurrency: { symbol: 'STT', decimals: 18 },
};

// Somnia Mainnet (post-agentathon production)
const somniaMainnet = {
  chainId: 5031,
  name: 'Somnia Mainnet',
  rpcUrl: 'https://mainnet-rpc.somnia.network',
  nativeCurrency: { symbol: 'SOMI', decimals: 18 },
};
```
