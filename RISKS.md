# RISKS.md — Aegis Swarm

> **Risk Register**
> Technical, Protocol, Security, Business, and Hackathon Risks

---

## Risk Classification

| Likelihood | Impact | Priority |
|---|---|---|
| 🔴 High | 🔴 High | CRITICAL — Address immediately |
| 🟡 Medium | 🔴 High | HIGH — Address before launch |
| 🔴 High | 🟡 Medium | HIGH — Address before launch |
| 🟡 Medium | 🟡 Medium | MEDIUM — Mitigate during development |
| 🟢 Low | Any | LOW — Monitor, contingency plan |

---

## 1. Protocol Risks (Somnia-Specific)

### RISK-001: Somnia Agents in Prototype State
**Category:** Protocol  
**Likelihood:** 🔴 High  
**Impact:** 🔴 High  
**Priority:** CRITICAL

**Description:**  
Somnia Agents are explicitly documented as "prototype state" with a notice that "Features and APIs may change as development progresses." Any API change during the 4-week agentathon could break our agent invocation layer.

**Mitigation:**
1. Build a thin **Agent Abstraction Layer** (`IAgentRouter`) between `AegisCore` and the Somnia agent contracts. Any API change requires only updating one interface, not all our contracts.
2. Monitor Somnia Discord `#dev-chat` and `#announcements` daily for API changes.
3. Build the system with **mock agents** that can stand in if live agents are unavailable during demo (same interface, returns hardcoded realistic responses).
4. Version-pin the Somnia SDK packages to a known-good commit.

**Contingency:**  
If Somnia agents are unavailable: fall back to mock agents for the demo. The architecture is unchanged; only the agent layer is simulated.

---

### RISK-002: Asynchronous Agent Callbacks in Same-Block Context
**Category:** Protocol  
**Likelihood:** 🟡 Medium  
**Impact:** 🔴 High  
**Priority:** HIGH

**Description:**  
Somnia documentation states that agent execution is asynchronous — "A contract sends a request, receives a `requestId` immediately, and the result is returned later via a callback." The exact timing (same block vs. next block) is not guaranteed. If callbacks arrive in a different block than the triggering event, the "same-block defense" guarantee of Aegis is weakened.

**Mitigation:**
1. Design `AegisCore` to execute **immediate pre-analysis safety actions** (soft-lock, rate limits) synchronously in `_onEvent()` — before waiting for any agent callback. This preserves same-block protection.
2. Only the **nuanced analysis** (full pause, rate limit adjustment) depends on agent callbacks.
3. Document this distinction clearly: "Aegis provides same-block soft protection and callback-confirmed hard protection."
4. Test actual callback latency on Somnia Testnet during Phase 2.

**Contingency:**  
If callbacks consistently arrive 2+ blocks later: adjust the soft-lock duration to cover the callback latency window. Extend hard-pause timeout windows accordingly.

---

### RISK-003: Agent Gas Cost Unpredictability
**Category:** Protocol  
**Likelihood:** 🟡 Medium  
**Impact:** 🟡 Medium  
**Priority:** MEDIUM

**Description:**  
Somnia's gas fee documentation notes that agent deposits cover "operations reserve" and "agent reward pot," with the unused portion rebated. The exact deposit size required is hard to predict at design time, especially for LLM inference agents whose compute costs may vary.

**Mitigation:**
1. Fund `AegisTreasury` conservatively — 10x the estimated cost per invocation.
2. Implement `SENTINEL_DEPOSIT`, `ANALYST_DEPOSIT`, etc. as governance-adjustable parameters.
3. Build an automatic treasury top-up warning: if balance drops below 30-day runway, emit alert.
4. Test actual costs on Somnia Testnet with real agent invocations and calibrate.

---

### RISK-004: SomniaEventHandler API Availability
**Category:** Protocol  
**Likelihood:** 🟢 Low  
**Impact:** 🔴 High  
**Priority:** HIGH

**Description:**  
The `SomniaEventHandler` base contract enables native on-chain reactivity. If this contract is not deployed on Somnia Testnet or has a different interface than documented, our reactive architecture breaks.

**Mitigation:**
1. Verify `SomniaEventHandler` deployment address on testnet in Phase 1, Day 1.
2. Read the actual deployed bytecode to confirm interface matches documentation.
3. Build a compatibility test: deploy a minimal `SomniaEventHandler` subclass and verify `_onEvent()` fires on a test subscription.

**Contingency:**  
If `SomniaEventHandler` is unavailable: use off-chain event monitoring via `@somnia-chain/streams` + a keeper bot to call `AegisCore` functions directly. This is less elegant but functionally equivalent for the demo.

---

### RISK-005: @somnia-chain/streams SDK Stability
**Category:** Protocol  
**Likelihood:** 🟡 Medium  
**Impact:** 🟡 Medium  
**Priority:** MEDIUM

**Description:**  
The `@somnia-chain/streams` SDK is used for the off-chain dashboard. If the WebSocket connection is unstable or the SDK has breaking changes, the dashboard real-time feed breaks.

**Mitigation:**
1. Implement reconnection logic with exponential backoff in the streams service.
2. Fall back to polling `eth_getLogs` if WebSocket connection fails.
3. The dashboard always shows the last known state — it degrades gracefully rather than showing errors.

---

## 2. Technical Risks

### RISK-006: LLM Prompt Determinism Breaks
**Category:** Technical  
**Likelihood:** 🟡 Medium  
**Impact:** 🔴 High  
**Priority:** HIGH

**Description:**  
Somnia's LLM agents guarantee determinism only with fixed seeds and temperature=0. If our prompts are non-deterministic (e.g., including timestamps, random context), different validators will produce different outputs and consensus will fail.

**Mitigation:**
1. Make all prompt inputs **fully deterministic** — never include timestamps, `block.number` alone, or random data.
2. Use block-specific state lookups as context (same block = same state = deterministic).
3. Test prompt determinism: invoke the same agent with identical inputs 10 times and verify byte-identical outputs.
4. Keep prompts short and structured — long prompts increase the surface area for non-determinism.
5. Validate output is always valid JSON before decoding with `abi.decode`.

---

### RISK-007: ABI Decode Failures on Malformed Agent Output
**Category:** Technical  
**Likelihood:** 🟡 Medium  
**Impact:** 🟡 Medium  
**Priority:** MEDIUM

**Description:**  
If an LLM agent produces output that doesn't conform to our expected ABI encoding, `abi.decode()` will revert. This could halt the analysis pipeline for affected incidents.

**Mitigation:**
1. Use `try/catch` around all `abi.decode()` calls in callback handlers.
2. On decode failure: log the raw bytes to `AlertRegistry`, escalate to WARNING level, and continue.
3. Implement output validation before decoding: check minimum length, validate JSON structure.
4. Fallback: if Analyst fails, use Sentinel-only result to make conservative action decision.

```solidity
function onAnalystResult(bytes32 requestId, bytes calldata result) external {
    try this._decodeAnalystResult(result) returns (AnalystResult memory r) {
        _processAnalystResult(requestId, r);
    } catch {
        emit AnalystDecodeFailed(requestId, result);
        // Conservative fallback: treat as WARNING severity
        _applyConservativeFallback(requestId);
    }
}
```

---

### RISK-008: Reentrancy in AegisCore Callback Handlers
**Category:** Technical / Security  
**Likelihood:** 🟡 Medium  
**Impact:** 🔴 High  
**Priority:** CRITICAL

**Description:**  
If a malicious protected contract implements callback hooks that re-enter `AegisCore` during agent callbacks, it could manipulate the analysis state.

**Mitigation:**
1. Apply `nonReentrant` modifier to ALL external functions on `AegisCore`.
2. Follow checks-effects-interactions pattern strictly.
3. Set `currentPhase` to `COMPLETE` before any external calls in callback handlers.
4. Foundry fuzz test with reentrant mock contracts.

---

### RISK-009: False Positive Rate Causing Protocol DOS
**Category:** Technical / Security  
**Likelihood:** 🟡 Medium  
**Impact:** 🔴 High  
**Priority:** HIGH

**Description:**  
If Aegis triggers hard pauses on legitimate transactions (false positives), it becomes a liability rather than an asset — protocols would avoid registering.

**Mitigation:**
1. Two-stage circuit breaker: soft-lock (always immediate) vs. hard pause (requires Analyst + Responder consensus).
2. Confidence threshold: hard pause requires Analyst confidence >= 0.75.
3. Challenge mechanism: any hard pause can be challenged and reviewed within 24 blocks.
4. Calibrate thresholds on testnet with real DeFi transaction patterns before mainnet.
5. Implement "learning mode": first 7 days of registration = alerting only, no auto-pause.

---

### RISK-010: Agent Network Downtime
**Category:** Technical  
**Likelihood:** 🟢 Low  
**Impact:** 🔴 High  
**Priority:** HIGH

**Description:**  
If the Somnia agent network is unavailable (validator subset downtime), agent callbacks never arrive. `PendingAnalysis` states could pile up and block new analyses.

**Mitigation:**
1. Implement agent timeout: if no callback within N blocks, mark analysis as `TIMED_OUT`.
2. On timeout: execute conservative action (soft-lock, not hard pause).
3. Implement `pendingAnalyses` cleanup — garbage collect timed-out entries.
4. Cap concurrent pending analyses per contract at 5 to prevent state bloat.

---

## 3. Security Risks

### RISK-011: AegisCore Itself as Attack Target
**Category:** Security  
**Likelihood:** 🟡 Medium  
**Impact:** 🔴 High  
**Priority:** CRITICAL

**Description:**  
If Aegis becomes critical infrastructure, it becomes a high-value target. Attackers could attempt to exploit `AegisCore` itself to disable defenses before attacking registered contracts.

**Mitigation:**
1. `AegisCore` stores **zero funds** — not an attractive target for fund theft.
2. All governance functions are time-locked and multi-sig protected.
3. `AegisCore` itself cannot be "paused" by the same mechanisms it uses on registered contracts.
4. Consider formal verification of `AegisCore`'s core state machine.
5. Bug bounty program post-launch.

---

### RISK-012: Callback Spoofing (Fake Agent Results)
**Category:** Security  
**Likelihood:** 🟢 Low  
**Impact:** 🔴 High  
**Priority:** HIGH

**Description:**  
An attacker could attempt to call `onSentinelResult()` / `onAnalystResult()` directly, spoofing agent results (e.g., "severity: 0" to prevent a legitimate pause).

**Mitigation:**
1. `onlyAgentRouter` modifier on all callback functions — only the Somnia Agent Router contract can call these.
2. `onlyRegisteredCallback(requestId)` — validates the requestId exists in `pendingAnalyses`.
3. Phase enforcement — callbacks must match the expected analysis phase.
4. Test: attempt to call callbacks from non-router addresses, confirm revert.

---

### RISK-013: Governance Attack (Threshold Manipulation)
**Category:** Security  
**Likelihood:** 🟢 Low  
**Impact:** 🔴 High  
**Priority:** MEDIUM

**Description:**  
If `AegisGovernance` is compromised, an attacker could change `CRITICAL_THRESHOLD` to 101 (impossible to trigger) and effectively disable Aegis protection.

**Mitigation:**
1. Time-lock all governance parameter changes: 48-hour delay before taking effect.
2. Multi-sig requirement: 3-of-5 keys required for any governance action.
3. Hard-coded floor/ceiling bounds on all thresholds (e.g., `CRITICAL_THRESHOLD` must be 50-90).
4. Threshold changes emit events that are picked up by the SOC Dashboard immediately.

---

### RISK-014: MEV Front-running of Defense Actions
**Category:** Security  
**Likelihood:** 🟡 Medium  
**Impact:** 🟡 Medium  
**Priority:** MEDIUM

**Description:**  
When `AegisCore` dispatches `_executeHardPause()`, a MEV bot observing the mempool could front-run the pause with a final extraction transaction.

**Mitigation:**
1. Immediate soft-lock in `_onEvent()` (same block as attack) applies rate limits before any MEV can react.
2. Hard-pause execution in callback handler: by this time, the attacking transaction is already settled.
3. This is a fundamental limitation of public mempool — not solvable at the application layer.
4. Accept that Aegis protects against sustained attacks, not instantaneous MEV exploits.

---

## 4. Business Risks

### RISK-015: Adoption Risk — Protocol Teams Don't Register
**Category:** Business  
**Likelihood:** 🟡 Medium  
**Impact:** 🟡 Medium  
**Priority:** MEDIUM

**Description:**  
Protocol teams may be reluctant to register if they don't trust Aegis's false positive rate or if registration requires code changes.

**Mitigation:**
1. "Zero-code" registration path: register contract address, configure withdrawal limits, done.
2. Learning mode (7-day alert-only period) builds trust before auto-defense activates.
3. Transparent audit trail: every action Aegis takes is on-chain and explainable.
4. Open-source all smart contracts — nothing hidden.
5. Start with Somnia native protocols built during the agentathon.

---

### RISK-016: Regulatory Risk
**Category:** Business  
**Likelihood:** 🟢 Low  
**Impact:** 🟡 Medium  
**Priority:** LOW

**Description:**  
Autonomous pausing of financial contracts could attract regulatory scrutiny in some jurisdictions.

**Mitigation:**
1. Protocol teams opt in — Aegis does not pause contracts without explicit registration.
2. All pause actions are reversible by the registered operator.
3. Document this clearly in terms of service.

---

## 5. Hackathon-Specific Risks

### RISK-017: Demo Failure During Judges' Review
**Category:** Hackathon  
**Likelihood:** 🟡 Medium  
**Impact:** 🔴 High  
**Priority:** CRITICAL

**Description:**  
Live demos are high-risk. Network issues, smart contract bugs, or agent downtime during the judge review could leave a poor impression.

**Mitigation:**
1. Pre-record a high-quality demo video (3 minutes) as the primary submission artifact.
2. Live demo URL is a bonus, not a requirement.
3. Build "demo mode" with scripted attack simulations that work offline.
4. Deploy contracts 3+ days before submission deadline, not the night before.
5. Test the full demo flow at least 5 times before recording the video.

---

### RISK-018: Scope Creep — Building Too Much
**Category:** Hackathon  
**Likelihood:** 🔴 High  
**Impact:** 🟡 Medium  
**Priority:** HIGH

**Description:**  
4 weeks is short. Trying to build every feature in the design docs will result in nothing working well.

**Mitigation (MVP Scope Prioritization):**

**Must Have (Core demo requires this):**
- `AegisCore.sol` with `SomniaEventHandler` reactivity
- Sentinel + Analyst + Responder agent chain (3 agents)
- `VaultGuard.sol` hard pause capability
- `AlertRegistry.sol` event log
- SOC Dashboard Overview + Threat Feed pages
- 1 scripted attack simulation (reentrancy) that works end-to-end
- Deployed on Somnia Testnet with contracts verified

**Should Have (Strong submission):**
- Archivist + Messenger agents
- Contract Registry page on dashboard
- Incident Viewer with agent receipt display
- 2-3 attack simulation types

**Nice to Have (Post-agentathon):**
- Full governance system
- Insurance integration
- Mobile responsive design
- Custom domain

**Contingency:**  
If behind schedule, cut governance panel, Messenger agent, and dashboard polish. The core story (reactive + AI agents + defense) must be demonstrable.

---

### RISK-019: Competitor Analysis
**Category:** Hackathon  
**Likelihood:** 🟡 Medium  
**Impact:** 🟡 Medium  
**Priority:** MEDIUM

**Description:**  
Other teams may build similar security-focused submissions.

**Mitigation:**
1. Aegis Swarm's differentiator is depth: 5 specialized agents, full on-chain reactivity, production-grade security design. Build the most complete submission.
2. The SOC Dashboard is highly visual — judges remember what they can see.
3. Agent receipt linkability (every defense action linkable to a Somnia audit receipt) is unique.
4. Focus on the Somnia-native angle: Aegis is architecturally impossible on any other L1 — make this argument forcefully in the video.

---

## Risk Summary Matrix

| Risk ID | Description | Priority | Status |
|---|---|---|---|
| RISK-001 | Somnia Agents prototype state | CRITICAL | ⚠️ Mitigated (mock agents ready) |
| RISK-002 | Async callback timing | HIGH | ⚠️ Mitigated (soft-lock immediate) |
| RISK-003 | Gas cost unpredictability | MEDIUM | 🟡 Monitor during Phase 2 |
| RISK-004 | SomniaEventHandler availability | HIGH | 🔴 Verify Day 1 of Phase 1 |
| RISK-005 | Streams SDK stability | MEDIUM | 🟡 Fallback polling ready |
| RISK-006 | LLM prompt non-determinism | HIGH | ⚠️ Test in Phase 2 |
| RISK-007 | ABI decode failures | MEDIUM | ⚠️ try/catch pattern adopted |
| RISK-008 | Reentrancy in callbacks | CRITICAL | ⚠️ nonReentrant required |
| RISK-009 | False positive DOS | HIGH | ⚠️ Two-stage design mitigates |
| RISK-010 | Agent network downtime | HIGH | ⚠️ Timeout mechanism planned |
| RISK-011 | AegisCore as attack target | CRITICAL | ⚠️ Stateless design mitigates |
| RISK-012 | Callback spoofing | HIGH | ⚠️ onlyAgentRouter mitigates |
| RISK-013 | Governance attack | MEDIUM | ⚠️ Time-lock + multi-sig |
| RISK-014 | MEV front-running | MEDIUM | 🟡 Acceptable limitation |
| RISK-015 | Protocol adoption | MEDIUM | 🟡 Post-agentathon focus |
| RISK-016 | Regulatory risk | LOW | 🟢 Opt-in, monitor |
| RISK-017 | Demo failure | CRITICAL | ⚠️ Pre-record video + demo mode |
| RISK-018 | Scope creep | HIGH | ⚠️ MVP scope defined above |
| RISK-019 | Competitors | MEDIUM | 🟡 Depth + visuals + Somnia-native |

---

## Risk Review Schedule

- **Phase 1 End (Week 1)**: Review RISK-004 (SomniaEventHandler confirmed?)
- **Phase 2 End (Week 2)**: Review RISK-001, RISK-006, RISK-002 (actual agent behavior observed)
- **Phase 3 End (Week 3 mid)**: Review RISK-008, RISK-009, RISK-007 (security testing complete)
- **Phase 4 End (Week 3 end)**: Review RISK-017 (demo mode functional?)
- **Phase 5 End (Week 4)**: Final review of all CRITICAL risks before submission
