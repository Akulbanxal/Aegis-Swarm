// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAegisCore
 * @notice Interface for the AegisCore orchestrator contract.
 */
interface IAegisCore {
    // ─── Events ──────────────────────────────────────────────────────────────

    event ContractRegistered(address indexed target, address indexed registrar, uint256 blockNumber);
    event ContractDeregistered(address indexed target);
    event ThreatDetected(address indexed target, bytes32 eventTopic, bytes32 requestId, uint256 blockNumber);
    event SoftLockActivated(address indexed target, uint256 blockNumber);
    event SoftLockLifted(address indexed target, uint256 blockNumber);
    event HardPauseActivated(address indexed target, bytes32 requestId, uint256 blockNumber);
    event SentinelComplete(bytes32 indexed requestId, bytes32 analystRequestId, uint256 repScore);
    event AnalystComplete(bytes32 indexed requestId, uint256 severity, string attackVector);
    event ResponderComplete(bytes32 indexed requestId, string finalAction);
    event FastPathDefenseActivated(address indexed target, bytes32 requestId);
    event CoordinatedAttackWarning(address indexed target, bytes32 requestId);
    event MessengerFailed(address indexed target, uint256 blockNumber);

    // ─── Errors ──────────────────────────────────────────────────────────────

    error AlreadyRegistered(address target);
    error NotRegistered(address target);
    error UnauthorizedCallback(address caller);
    error InvalidRequestId(bytes32 requestId);
    error WrongPhase(bytes32 requestId, uint8 expected, uint8 actual);
    error InsufficientTreasuryBalance();
    error MaxPendingAnalysesReached(address target);

    // ─── Enums ───────────────────────────────────────────────────────────────

    enum AnalysisPhase { SENTINEL, ANALYST, RESPONDER, COMPLETE, TIMED_OUT }
    enum ActionTaken { NONE, SOFT_LOCK, RATE_LIMIT, PAUSE, HARD_PAUSE }

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct RegistrationConfig {
        uint256 maxWithdrawalPerBlock;
        uint256 maxWithdrawalPerTx;
        uint256 flashLoanThreshold;
        bytes32[] subscribedTopics;
        address webhookTarget;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    function registerContract(address target, RegistrationConfig calldata config) external payable;
    function deregisterContract(address target) external;
    function isRegistered(address target) external view returns (bool);
    function getCriticalThreshold() external view returns (uint256);
    function getWarningThreshold() external view returns (uint256);
}
