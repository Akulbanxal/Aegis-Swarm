# AGENT_DESIGN.md — Aegis Swarm

> **Agent Design Reference**
> Five-Agent Swarm Architecture | Somnia Agentic L1

---

## 1. Agent Swarm Overview

Aegis Swarm deploys five purpose-built autonomous agents. Each is a decentralized, sandboxed compute container running on Somnia's validator network. They operate asynchronously, chaining their outputs through `AegisCore.sol` callbacks.

```
                    ┌────────────────────────────────┐
                    │       AEGIS SWARM              │
                    │                                │
         ┌──────────┤  Agent 1: SENTINEL             ├──────────┐
         │          │  Threat Intelligence           │          │
         │          ├────────────────────────────────┤          │
         │          │  Agent 2: ANALYST              │          │
         │          │  AI Threat Classifier          │          │
         │          ├────────────────────────────────┤          │
Chain    │          │  Agent 3: RESPONDER            │    Chain │
Events ──┤          │  Action Orchestrator           ├──→ Actions│
         │          ├────────────────────────────────┤          │
         │          │  Agent 4: ARCHIVIST            │          │
         │          │  Knowledge Curator             │          │
         │          ├────────────────────────────────┤          │
         │          │  Agent 5: MESSENGER            │          │
         └──────────┤  External Communicator         ├──────────┘
                    └────────────────────────────────┘

Execution: Sentinel → Analyst → Responder (sequential, output-chained)
           Archivist: Independent, scheduled
           Messenger: Parallel with Responder, non-blocking
```

---

## 2. Agent 1: Sentinel Agent

### 2.1 Purpose
External threat intelligence gatherer. Answers the question: **"Is this event pattern known?"**

### 2.2 Agent Type
`JSON API Request` — Somnia Base Agent

### 2.3 Invocation Trigger
- **Reactive**: Fires immediately on `_onEvent()` callback from `AegisCore`
- **Proactive**: Fires every 100 blocks for health checks on all registered contracts

### 2.4 Data Sources

| Source | API | Data |
|---|---|---|
| DeFiHackLabs | `api.defihacklabs.io/check` | Known attacker addresses, exploit signatures |
| Etherscan | `api.etherscan.io/api` | Contract similarity scores vs known exploited contracts |
| CERT/CC | `www.kb.cert.org/vuls/` | CVE database lookup |
| MEV.watch | `api.mev.watch/address` | MEV bot activity, sandwich attack patterns |
| Forta Network | `api.forta.network/alerts` | Real-time blockchain threat alerts |

### 2.5 Invocation Pattern

```solidity
function _dispatchSentinel(
    address target,
    bytes32 topic0,
    bytes calldata eventData
) internal returns (bytes32 requestId) {

    // Encode the JSON API request
    // Somnia JSON API agent format: (method, url, jsonPath)
    bytes memory payload = abi.encode(
        "GET",
        _buildSentinelUrl(target, topic0, eventData),
        "$.threat_assessment"
    );

    // Invoke via Somnia Agent Router
    requestId = IAgentRouter(AGENT_ROUTER).invoke{value: SENTINEL_DEPOSIT}(
        SENTINEL_AGENT_ID,
        payload,
        address(this),
        this.onSentinelResult.selector
    );
}

function _buildSentinelUrl(address target, bytes32 topic0, bytes calldata data)
    internal pure returns (string memory)
{
    // Construct composite threat check URL
    // Real implementation would use a custom Aegis threat aggregator API
    return string(abi.encodePacked(
        "https://api.aegisswarm.io/v1/threat-check",
        "?address=", Strings.toHexString(uint256(uint160(target)), 20),
        "&topic=", Strings.toHexString(uint256(topic0), 32),
        "&chain=50312"
    ));
}
```

### 2.6 Output Schema

```typescript
interface SentinelResult {
    knownAttacker:     boolean;    // Address in known attacker DB
    cveMatches:        string[];   // CVE IDs with pattern match
    attackerRepScore:  number;     // 0-100 historical malice score
    similarExploits:   string[];   // URLs to similar past exploits
    mevBotDetected:    boolean;    // MEV bot activity detected
    flashLoanOrigin:   boolean;    // Transaction originated from flash loan
    threatContext:     string;     // Free-text threat summary (max 500 chars)
}
```

### 2.7 Callback Handling

```solidity
function onSentinelResult(bytes32 requestId, bytes calldata result)
    external
    onlyAgentRouter
    onlyRegisteredCallback(requestId)
    nonReentrant
{
    SentinelResult memory sentinel = abi.decode(result, (SentinelResult));
    PendingAnalysis storage analysis = pendingAnalyses[requestId];

    // Pre-classify based on Sentinel alone (fast-path for known attackers)
    if (sentinel.knownAttacker && sentinel.attackerRepScore >= 90) {
        // Immediate hard pause — don't wait for LLM analysis
        _executeHardPause(analysis.targetContract, requestId);
        emit FastPathDefenseActivated(analysis.targetContract, requestId);
        return;
    }

    // Normal path: proceed to Analyst
    analysis.currentPhase = Phase.ANALYST;
    bytes32 analystRequestId = _dispatchAnalyst(analysis, sentinel);
    analysis.analystRequestId = analystRequestId;

    emit SentinelComplete(requestId, analystRequestId, sentinel.attackerRepScore);
}
```

---

## 3. Agent 2: Analyst Agent

### 3.1 Purpose
AI-powered threat classifier. Answers the question: **"How severe is this threat, and what type is it?"**

### 3.2 Agent Type
`LLM Inference` — Somnia Base Agent (deterministic, temperature=0, fixed seed)

### 3.3 Invocation Trigger
Called by `AegisCore.onSentinelResult()` when Sentinel completes (non-fast-path)

### 3.4 Prompt Engineering

The Analyst Agent receives a structured prompt that produces deterministic, structured output. Because Somnia's LLM runs at temperature=0 with a fixed seed, the same inputs always yield the same classification across all validators — enabling consensus.

```
SYSTEM: You are a blockchain security expert AI. Your task is to classify
smart contract threat events with precision. You MUST respond ONLY with
valid JSON matching the exact schema provided. No preamble, no explanation.

SCHEMA: {
  "severity": <integer 0-100>,
  "confidence": <float 0.00-1.00>,
  "attackVector": <one of: "REENTRANCY" | "FLASH_LOAN" | "ORACLE_MANIPULATION" |
                   "FRONT_RUNNING" | "ACCESS_CONTROL" | "INTEGER_OVERFLOW" |
                   "SANDWICH_ATTACK" | "GOVERNANCE_ATTACK" | "UNKNOWN">,
  "immediateRisk": <boolean>,
  "rationale": <string max 200 chars>,
  "recommendedAction": <one of: "NO_ACTION" | "SOFT_LOCK" | "RATE_LIMIT" | "PAUSE" | "HARD_PAUSE">
}

USER: Classify the following blockchain security event:
Contract: {contractAddress}
Event Topic: {eventTopic}
Raw Event Data: {hexEventData}
Block Number: {blockNumber}

Sentinel Intelligence:
- Known attacker: {sentinel.knownAttacker}
- Attacker reputation score: {sentinel.attackerRepScore}/100
- CVE matches: {sentinel.cveMatches.join(', ')}
- Flash loan origin: {sentinel.flashLoanOrigin}
- MEV bot detected: {sentinel.mevBotDetected}
- Similar past exploits: {sentinel.similarExploits.join(', ')}
- Context: {sentinel.threatContext}

Historical context from ThreatRegistry:
{threatRegistryContext}
```

### 3.5 Output Schema

```typescript
interface AnalystResult {
    severity:            number;    // 0-100 threat score
    confidence:          number;    // 0-1 AI confidence
    attackVector:        string;    // Classification
    immediateRisk:       boolean;   // Requires instant action?
    rationale:           string;    // Human-readable reasoning
    recommendedAction:   string;    // Suggested defense action
}
```

### 3.6 Determinism Guarantee

```
Input:   Same contract address + event data + sentinel context + threat registry state
Output:  Guaranteed identical JSON across all Somnia validator nodes

This is achieved by:
1. Fixed LLM seed (Somnia protocol-enforced)
2. Temperature = 0 (Somnia protocol-enforced)
3. Structured prompt with no randomness
4. Deterministic threat registry state lookup (block-specific)

Result: AegisCore receives a consensus-verified threat classification.
        A malicious validator CANNOT manipulate the output.
```

### 3.7 Callback Handling

```solidity
function onAnalystResult(bytes32 requestId, bytes calldata result)
    external
    onlyAgentRouter
    onlyRegisteredCallback(requestId)
{
    AnalystResult memory analyst = abi.decode(result, (AnalystResult));
    PendingAnalysis storage analysis = pendingAnalyses[requestId];

    emit AnalystComplete(requestId, analyst.severity, analyst.attackVector);

    if (analyst.severity >= CRITICAL_THRESHOLD) {
        // Critical: immediate hard pause + invoke Responder for rationale
        _executeHardPause(analysis.targetContract, requestId);
        _dispatchResponder(analysis, analyst);

    } else if (analyst.severity >= WARNING_THRESHOLD) {
        // Warning: rate limits + invoke Responder for nuanced action
        _executeRateLimit(analysis.targetContract, analyst.severity);
        _dispatchResponder(analysis, analyst);

    } else {
        // Low severity: lift soft-lock, log, done
        _liftSoftLock(analysis.targetContract);
        _logIncident(analysis, analyst, ActionTaken.NONE);
        analysis.currentPhase = Phase.COMPLETE;
    }
}
```

---

## 4. Agent 3: Responder Agent

### 4.1 Purpose
Strategic action coordinator. Answers the question: **"What is the optimal defense strategy, and should we escalate?"**

### 4.2 Agent Type
`LLM Inference` — Somnia Base Agent (deterministic)

### 4.3 Invocation Trigger
Called by `AegisCore.onAnalystResult()` when severity >= WARNING_THRESHOLD

### 4.4 Design Philosophy

The Responder operates on a layered decision tree. It doesn't just validate the Analyst's recommendation — it considers broader context:

- Is this a coordinated multi-contract attack?
- Should we notify the protocol team immediately?
- Should we invoke emergency governance mechanisms?
- Is the circuit breaker action proportional to the threat?

```
SYSTEM: You are the chief security incident response coordinator for
a blockchain defense system. You must provide precise, actionable directives.
Respond ONLY with valid JSON matching the schema. Be conservative: false
negatives (missed attacks) are worse than false positives (over-reaction).

SCHEMA: {
  "finalAction": <"NO_ACTION" | "SOFT_LOCK" | "RATE_LIMIT" | "PAUSE" | "HARD_PAUSE">,
  "escalateToGovernance": <boolean>,
  "coordinatedAttack": <boolean>,
  "alertLevel": <"INFO" | "WARNING" | "CRITICAL" | "CATASTROPHIC">,
  "humanResponseRequired": <boolean>,
  "additionalContracts": <string[] — other contracts that may be targeted>,
  "rationale": <string max 300 chars>
}

USER: Incident Response Required.

Analyst Findings:
- Severity: {severity}/100
- Attack Vector: {attackVector}
- Confidence: {confidence}
- Recommended Action: {recommendedAction}
- Rationale: {rationale}

Current System State:
- Current circuit breaker state: {circuitBreakerState}
- Recent incidents (last 10 blocks): {recentIncidents}
- Protected contracts at risk: {potentialTargets}
- Total TVL at risk: {tvlAtRisk} STT

Provide your final incident response directive.
```

### 4.5 Callback Handling

```solidity
function onResponderResult(bytes32 requestId, bytes calldata result)
    external
    onlyAgentRouter
    onlyRegisteredCallback(requestId)
{
    ResponderResult memory responder = abi.decode(result, (ResponderResult));
    PendingAnalysis storage analysis = pendingAnalyses[requestId];

    // Responder validates/overrides any immediate action taken
    if (responder.finalAction == Action.HARD_PAUSE
        && !circuitBreakerActive[analysis.targetContract]) {
        _executeHardPause(analysis.targetContract, requestId);
    }

    // Check for coordinated attack across multiple contracts
    if (responder.coordinatedAttack) {
        for (uint i = 0; i < responder.additionalContracts.length; i++) {
            if (registeredContracts[responder.additionalContracts[i]]) {
                _executeSoftLock(responder.additionalContracts[i]);
                emit CoordinatedAttackWarning(responder.additionalContracts[i], requestId);
            }
        }
    }

    // Governance escalation
    if (responder.escalateToGovernance) {
        IAegisGovernance(governanceContract).createEmergencyProposal(
            analysis.targetContract, requestId, responder.alertLevel
        );
    }

    // Final incident log with full agent chain
    _logFinalIncident(analysis, responder, requestId);

    // Dispatch Messenger (async, non-blocking)
    _dispatchMessenger(analysis, responder);

    analysis.currentPhase = Phase.COMPLETE;
}
```

---

## 5. Agent 4: Archivist Agent

### 5.1 Purpose
Knowledge curator and proactive vulnerability researcher. Answers the question: **"What new threats exist that we haven't encountered yet?"**

### 5.2 Agent Type
`LLM Parse Website` — Somnia Base Agent

### 5.3 Invocation Pattern
Scheduled via on-chain reactive timer (every 1 hour). This uses Somnia's on-chain reactivity with a time-based trigger — no off-chain cron job required.

```solidity
// Archivist scheduling setup (one-time, done during AegisCore deployment)
function scheduleArchivist() external onlyOwner {
    // Somnia's reactive timer: subscribe to block-based timer events
    IReactiveTimer(REACTIVE_TIMER).schedule(
        address(this),
        this.onArchivistTimer.selector,
        BLOCKS_PER_HOUR  // ≈ 720 blocks at ~5s block time
    );
}

function onArchivistTimer() external onlyReactiveTimer {
    bytes memory payload = abi.encode(
        "https://rekt.news",
        "Extract all smart contract exploit incidents from the past 24 hours. " +
        "For each incident, extract: protocol name, attack vector, amount stolen, " +
        "vulnerability type, and any contract addresses mentioned. " +
        "Return as JSON array."
    );

    IAgentRouter(AGENT_ROUTER).invoke{value: ARCHIVIST_DEPOSIT}(
        ARCHIVIST_AGENT_ID,
        payload,
        address(this),
        this.onArchivistResult.selector
    );
}
```

### 5.4 Data Sources Crawled

| Source | Content | Frequency |
|---|---|---|
| rekt.news | DeFi exploit post-mortems | Every 1 hour |
| github.com/SunWeb3Sec/DeFiHackLabs | Community-maintained exploit DB | Every 1 hour |
| blog.openzeppelin.com | Smart contract security advisories | Every 6 hours |
| medium.com/tag/defi-security | Community research articles | Every 4 hours |
| github.com advisories (DeFi tags) | GitHub Security Advisories | Every 2 hours |

### 5.5 Output Processing

```solidity
function onArchivistResult(bytes32 requestId, bytes calldata result)
    external
    onlyAgentRouter
{
    ExploitReport[] memory reports = abi.decode(result, (ExploitReport[]));

    for (uint i = 0; i < reports.length; i++) {
        ExploitReport memory report = reports[i];

        // Add new signature to ThreatRegistry
        bytes32 sigHash = keccak256(abi.encode(
            report.attackVector,
            report.vulnerabilityType
        ));

        if (!threatRegistry.signatureExists(sigHash)) {
            threatRegistry.addSignature(
                sigHash,
                report.attackVector,
                report.severity,
                report.description
            );
            emit NewThreatSignatureDiscovered(sigHash, report.attackVector);
        }

        // Proactive scan: do any registered contracts match new vuln patterns?
        _proactiveScan(sigHash, registeredContracts);
    }
}
```

---

## 6. Agent 5: Messenger Agent

### 6.1 Purpose
External notification coordinator. Answers the question: **"How do we alert humans who need to know?"**

### 6.2 Agent Type
HTTP POST / Outbound Communication — Somnia Base Agent

### 6.3 Design Principle

The Messenger Agent is deliberately **non-critical path**. Defense actions execute regardless of whether the Messenger succeeds. Notification failure never blocks security response.

### 6.4 Supported Channels

```typescript
interface MessengerConfig {
    webhooks: {
        discord?:   string;   // Discord webhook URL
        telegram?:  string;   // Telegram bot API endpoint
        pagerduty?: string;   // PagerDuty Events API v2
        slack?:     string;   // Slack Incoming Webhook
        custom?:    string[]; // Any HTTP POST endpoint
    };
    thresholds: {
        info:     number;  // Min severity for INFO alerts (default: 0)
        warning:  number;  // Min severity for WARNING alerts (default: 40)
        critical: number;  // Min severity for CRITICAL alerts (default: 80)
    };
}
```

### 6.5 Message Templates

```
🛡️ AEGIS SWARM ALERT — {SEVERITY_EMOJI} {ALERT_LEVEL}

Contract: {contractAddress}
Chain: Somnia Testnet (50312)
Block: #{blockNumber}

⚠️ Threat Detected
Attack Vector: {attackVector}
Severity Score: {severity}/100
AI Confidence: {confidence*100}%

🤖 Swarm Response
Action Taken: {actionTaken}
Circuit Breaker: {circuitBreakerState}

📋 Analysis
{rationale}

🔗 Links
• Incident: https://aegisswarm.io/incidents/{requestId}
• Block Explorer: https://shannon-explorer.somnia.network/tx/{txHash}
• Agent Receipt: https://docs.somnia.network/agents/receipts/{receiptHash}
```

### 6.6 Invocation

```solidity
function _dispatchMessenger(
    PendingAnalysis memory analysis,
    ResponderResult memory responder
) internal {
    bytes memory payload = abi.encode(
        "POST",
        _buildMessengerPayload(analysis, responder)
    );

    // Non-blocking: don't track requestId, don't fail if messenger errors
    try IAgentRouter(AGENT_ROUTER).invoke{value: MESSENGER_DEPOSIT}(
        MESSENGER_AGENT_ID,
        payload,
        address(0),  // No callback needed
        bytes4(0)
    ) returns (bytes32) {
        // Success — notification queued
    } catch {
        // Failure is acceptable — alerts are best-effort
        emit MessengerFailed(analysis.targetContract, block.number);
    }
}
```

---

## 7. Agent Interaction Diagram

```
Block N: Attack transaction hits Protected Contract
         │
         │ [Somnia reactivity — same block]
         ▼
┌────────────────┐
│   AEGISCORE    │──────────────────────────────────────────────┐
│  _onEvent()    │                                              │
└───────┬────────┘                                              │
        │                                               Soft Lock
        │ invoke(SENTINEL_AGENT_ID)                     Applied
        ▼                                              Immediately
┌────────────────┐
│   SENTINEL     │ ← JSON API: DeFiHackLabs + CERT + MEV.watch
│   AGENT        │
└───────┬────────┘
        │ callback: onSentinelResult(requestId, result)
        │
        ├─[known attacker: fast path]──────────────► HARD PAUSE ──► ALERT
        │
        │ invoke(ANALYST_AGENT_ID)
        ▼
┌────────────────┐
│   ANALYST      │ ← LLM Inference (deterministic)
│   AGENT        │   temperature=0, fixed seed
└───────┬────────┘
        │ callback: onAnalystResult(requestId, result)
        │
        ├─[severity < 40]──────────────────────────► LIFT SOFT LOCK ──► LOG
        │
        ├─[severity 40-79]──────────────────────────► RATE LIMIT
        │         │
        │         │ invoke(RESPONDER_AGENT_ID) [parallel with action]
        │         ▼
        │ ┌────────────────┐
        │ │   RESPONDER    │ ← LLM Inference (context-aware)
        │ │   AGENT        │
        │ └───────┬────────┘
        │         │ callback: onResponderResult
        │         ├──► LOG INCIDENT ──► MESSENGER ──► DISCORD/TELEGRAM
        │         └──► GOVERNANCE ESCALATION (if coordinated attack)
        │
        └─[severity >= 80]──────────────────────────► HARD PAUSE
                  │
                  │ invoke(RESPONDER_AGENT_ID) [parallel with pause]
                  ▼
          ┌────────────────┐
          │   RESPONDER    │ ← Strategic coordination
          │   AGENT        │
          └───────┬────────┘
                  │ callback: onResponderResult
                  ├──► VALIDATE PAUSE DECISION
                  ├──► SCAN RELATED CONTRACTS
                  ├──► GOVERNANCE EMERGENCY PROPOSAL
                  └──► MESSENGER ──► PAGERDUTY (CRITICAL)

Separately (scheduled, every 1 hour):
┌────────────────┐
│   ARCHIVIST    │ ← LLM Parse Website: rekt.news, DeFiHackLabs
│   AGENT        │
└───────┬────────┘
        │ callback: onArchivistResult
        ├──► UPDATE ThreatRegistry
        └──► PROACTIVE SCAN of registered contracts
```

---

## 8. Agent Economics

Somnia agents require STT (testnet) / SOMI (mainnet) deposits. `AegisTreasury` manages all agent funding.

| Agent | Estimated Cost/Invocation | Frequency | Daily Estimated Cost |
|---|---|---|---|
| Sentinel | ~0.005 STT | Per threat event | Variable |
| Analyst | ~0.01 STT | Per threat event | Variable |
| Responder | ~0.01 STT | Per medium/high event | Variable |
| Archivist | ~0.05 STT | Every hour | ~1.2 STT/day |
| Messenger | ~0.002 STT | Per alert | Variable |
| **Baseline** | — | Archivist only | **~1.2 STT/day** |
| **Active Attack** | — | Full chain per event | **~0.025 STT/event** |

Protocol operators fund `AegisTreasury` when registering contracts. Registration fee covers estimated 30 days of baseline monitoring + 500 agent invocation events.

---

## 9. Agent Upgrade Path

Somnia Agents are in **Phase 1** (prototype) with Phase 2 (custom user-defined agents) planned for 2026. Aegis Swarm is designed to seamlessly adopt Phase 2 capabilities:

**Phase 2 Upgrades Planned:**
- Custom Sentinel Agent: A bespoke Aegis threat aggregation agent with proprietary signature database
- ML Pattern Agent: A custom agent running fine-tuned smart contract vulnerability detection models
- Bytecode Analyzer Agent: A custom agent that performs static analysis on contract bytecode on-chain
- Simulation Agent: A custom agent that simulates transactions in a sandboxed EVM before allowing execution
