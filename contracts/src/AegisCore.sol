// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SomniaEventHandler} from "../base/SomniaEventHandler.sol";
import {IAgentRouter} from "../interfaces/IAgentRouter.sol";
import {IAegisCore} from "../interfaces/IAegisCore.sol";

/**
 * @title AegisCore
 * @notice Central orchestrator for the Aegis Swarm defense system.
 *         Inherits SomniaEventHandler to receive reactive on-chain events.
 *         Dispatches the 5-agent swarm in response to threat events.
 *
 * @dev Architecture:
 *      1. _onEvent() fires in same block as triggering transaction (Somnia reactivity)
 *      2. Immediate soft-lock applied (rate limits)
 *      3. Sentinel Agent invoked (external threat intel)
 *      4. Analyst Agent invoked (LLM threat classification)
 *      5. Responder Agent invoked (strategic action directive)
 *      6. Messenger Agent invoked (external alerts, non-blocking)
 *
 *      NOTE: Business logic is stubbed. Implementation follows in Phase 2.
 */
contract AegisCore is SomniaEventHandler, IAegisCore {
    // ─── Constants ────────────────────────────────────────────────────────────

    /// @notice Maximum concurrent pending analyses per registered contract
    uint256 public constant MAX_PENDING_PER_CONTRACT = 5;

    /// @notice Blocks before a pending analysis is considered timed out
    uint256 public constant ANALYSIS_TIMEOUT_BLOCKS = 50;

    // ─── Immutables ──────────────────────────────────────────────────────────

    IAgentRouter public immutable agentRouter;
    address public immutable threatRegistry;
    address public immutable alertRegistry;
    address public immutable vaultGuard;
    address public immutable treasury;
    address public immutable governance;

    // ─── Agent IDs ───────────────────────────────────────────────────────────

    bytes32 public immutable SENTINEL_AGENT_ID;
    bytes32 public immutable ANALYST_AGENT_ID;
    bytes32 public immutable RESPONDER_AGENT_ID;
    bytes32 public immutable ARCHIVIST_AGENT_ID;
    bytes32 public immutable MESSENGER_AGENT_ID;

    // ─── Governance Parameters ────────────────────────────────────────────────

    uint256 public criticalThreshold = 80;
    uint256 public warningThreshold = 40;
    uint256 public infoThreshold = 10;

    // ─── State ───────────────────────────────────────────────────────────────

    mapping(address => bool) public registeredContracts;
    mapping(address => bool) public softLockActive;
    mapping(address => bool) public hardPauseActive;

    // Analysis pipeline state
    struct PendingAnalysis {
        address targetContract;
        bytes32 eventTopic;
        bytes   rawEventData;
        uint256 blockNumber;
        bytes32 sentinelRequestId;
        bytes32 analystRequestId;
        bytes32 responderRequestId;
        AnalysisPhase currentPhase;
    }

    mapping(bytes32 => PendingAnalysis) public pendingAnalyses;

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(
        address _agentRouter,
        address _threatRegistry,
        address _alertRegistry,
        address _vaultGuard,
        address _treasury,
        address _governance,
        bytes32 _sentinelAgentId,
        bytes32 _analystAgentId,
        bytes32 _responderAgentId,
        bytes32 _archivistAgentId,
        bytes32 _messengerAgentId
    ) {
        agentRouter     = IAgentRouter(_agentRouter);
        threatRegistry  = _threatRegistry;
        alertRegistry   = _alertRegistry;
        vaultGuard      = _vaultGuard;
        treasury        = _treasury;
        governance      = _governance;
        SENTINEL_AGENT_ID  = _sentinelAgentId;
        ANALYST_AGENT_ID   = _analystAgentId;
        RESPONDER_AGENT_ID = _responderAgentId;
        ARCHIVIST_AGENT_ID = _archivistAgentId;
        MESSENGER_AGENT_ID = _messengerAgentId;
    }

    // ─── SomniaEventHandler Implementation ────────────────────────────────────

    /**
     * @inheritdoc SomniaEventHandler
     * @dev Called by Somnia protocol in the same block as the triggering transaction.
     *      TODO: Implement full business logic in Phase 2.
     */
    function _onEvent(
        address source,
        bytes32 topic0,
        bytes calldata eventData
    ) internal override {
        if (!registeredContracts[source]) return;

        // Phase 0: Immediate same-block soft protection
        _applySoftLock(source);

        // Phase 1: Dispatch Sentinel Agent
        // TODO: Implement _dispatchSentinel in Phase 2
        bytes32 requestId = keccak256(abi.encode(source, topic0, block.number, eventData));

        pendingAnalyses[requestId] = PendingAnalysis({
            targetContract:    source,
            eventTopic:        topic0,
            rawEventData:      eventData,
            blockNumber:       block.number,
            sentinelRequestId: requestId,
            analystRequestId:  bytes32(0),
            responderRequestId: bytes32(0),
            currentPhase:      AnalysisPhase.SENTINEL
        });

        emit ThreatDetected(source, topic0, requestId, block.number);
    }

    // ─── Registration ────────────────────────────────────────────────────────

    /**
     * @notice Register a contract for Aegis protection.
     *         Subscribes to the contract's events via Somnia reactivity.
     * @dev TODO: Implement full registration logic in Phase 2.
     */
    function registerContract(
        address target,
        RegistrationConfig calldata config
    ) external payable override {
        if (registeredContracts[target]) revert AlreadyRegistered(target);

        registeredContracts[target] = true;

        // Subscribe to all configured event topics
        for (uint256 i = 0; i < config.subscribedTopics.length; i++) {
            _subscribe(target, config.subscribedTopics[i]);
        }

        emit ContractRegistered(target, msg.sender, block.number);
    }

    /**
     * @notice Deregister a contract from Aegis protection.
     */
    function deregisterContract(address target) external override {
        if (!registeredContracts[target]) revert NotRegistered(target);
        registeredContracts[target] = false;
        emit ContractDeregistered(target);
    }

    // ─── Agent Callbacks (stubbed) ────────────────────────────────────────────

    /**
     * @notice Callback for Sentinel Agent results.
     * @dev TODO: Full implementation in Phase 2.
     */
    function onSentinelResult(bytes32 requestId, bytes calldata result) external {
        // TODO: onlyAgentRouter modifier
        // TODO: onlyRegisteredCallback(requestId) modifier
        // TODO: Decode result, dispatch Analyst or fast-path
        emit SentinelComplete(requestId, bytes32(0), 0);
    }

    /**
     * @notice Callback for Analyst Agent results.
     * @dev TODO: Full implementation in Phase 2.
     */
    function onAnalystResult(bytes32 requestId, bytes calldata result) external {
        // TODO: onlyAgentRouter modifier
        // TODO: Decode severity, route to appropriate action
        emit AnalystComplete(requestId, 0, "UNKNOWN");
    }

    /**
     * @notice Callback for Responder Agent results.
     * @dev TODO: Full implementation in Phase 2.
     */
    function onResponderResult(bytes32 requestId, bytes calldata result) external {
        // TODO: onlyAgentRouter modifier
        // TODO: Validate action, handle coordinated attacks, escalate
        emit ResponderComplete(requestId, "PENDING");
    }

    /**
     * @notice Callback for Archivist Agent results (scheduled scan).
     * @dev TODO: Full implementation in Phase 2.
     */
    function onArchivistResult(bytes32 requestId, bytes calldata result) external {
        // TODO: Update ThreatRegistry with new vulnerability signatures
    }

    // ─── Internal Defense Actions (stubbed) ───────────────────────────────────

    function _applySoftLock(address target) internal {
        if (!softLockActive[target]) {
            softLockActive[target] = true;
            emit SoftLockActivated(target, block.number);
        }
    }

    function _liftSoftLock(address target) internal {
        if (softLockActive[target]) {
            softLockActive[target] = false;
            emit SoftLockLifted(target, block.number);
        }
    }

    function _executeHardPause(address target, bytes32 requestId) internal {
        hardPauseActive[target] = true;
        emit HardPauseActivated(target, requestId, block.number);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function isRegistered(address target) external view override returns (bool) {
        return registeredContracts[target];
    }

    function getCriticalThreshold() external view override returns (uint256) {
        return criticalThreshold;
    }

    function getWarningThreshold() external view override returns (uint256) {
        return warningThreshold;
    }
}
