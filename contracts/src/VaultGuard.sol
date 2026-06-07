// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VaultGuard
 * @notice Protective layer for registered contracts implementing withdrawal
 *         velocity checks, rate limits, and circuit breakers.
 *         Activated by AegisCore in response to threat analysis.
 *
 * @dev Two-stage circuit breaker:
 *      Stage 1 (Soft Lock):  Rate limits only. Applied immediately in _onEvent().
 *      Stage 2 (Hard Pause): Full withdrawal halt. Applied after agent confirmation.
 *      TODO: Implement full guard logic in Phase 2.
 */
contract VaultGuard {
    // ─── Events ──────────────────────────────────────────────────────────────

    event ConfigInitialized(address indexed target);
    event SoftLockApplied(address indexed target, uint256 blockNumber);
    event SoftLockLifted(address indexed target, uint256 blockNumber);
    event HardPauseApplied(address indexed target, address indexed triggeredBy, uint256 blockNumber);
    event HardPauseLifted(address indexed target, address indexed liftedBy, uint256 blockNumber);
    event WithdrawalLimitAdjusted(address indexed target, uint256 newLimit);

    // ─── Errors ──────────────────────────────────────────────────────────────

    error ContractPaused(address target);
    error SoftLocked(address target);
    error ExceedsSingleTxLimit(uint256 amount, uint256 limit);
    error ExceedsBlockLimit(uint256 amount, uint256 remaining);
    error FlashLoanManipulationDetected(address target);
    error Unauthorized();
    error ConfigNotFound(address target);

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct WithdrawalConfig {
        uint256 maxPerBlock;
        uint256 maxPerTransaction;
        uint256 cooldownBlocks;
        uint256 flashLoanThreshold;
        bool    softLocked;
        bool    hardPaused;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    mapping(address => WithdrawalConfig) public configs;
    mapping(address => uint256)          public lastWithdrawalBlock;
    mapping(address => uint256)          public blockWithdrawalTotal;

    address public immutable aegisCore;

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyAegisCore() {
        if (msg.sender != aegisCore) revert Unauthorized();
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address _aegisCore) {
        aegisCore = _aegisCore;
    }

    // ─── Configuration ────────────────────────────────────────────────────────

    function initConfig(
        address target,
        uint256 maxPerBlock,
        uint256 maxPerTransaction,
        uint256 flashLoanThreshold
    ) external onlyAegisCore {
        configs[target] = WithdrawalConfig({
            maxPerBlock:        maxPerBlock,
            maxPerTransaction:  maxPerTransaction,
            cooldownBlocks:     0,
            flashLoanThreshold: flashLoanThreshold,
            softLocked:         false,
            hardPaused:         false
        });
        emit ConfigInitialized(target);
    }

    // ─── Circuit Breaker Controls ──────────────────────────────────────────────

    function applySoftLock(address target) external onlyAegisCore {
        if (configs[target].maxPerBlock == 0) revert ConfigNotFound(target);
        configs[target].softLocked = true;
        emit SoftLockApplied(target, block.number);
    }

    function liftSoftLock(address target) external onlyAegisCore {
        configs[target].softLocked = false;
        emit SoftLockLifted(target, block.number);
    }

    function hardPause(address target) external {
        // TODO: onlyAegisCore || onlyOperator
        configs[target].hardPaused = true;
        emit HardPauseApplied(target, msg.sender, block.number);
    }

    function liftHardPause(address target) external {
        // TODO: onlyOperator || governance timelock
        configs[target].hardPaused = false;
        emit HardPauseLifted(target, msg.sender, block.number);
    }

    // ─── Withdrawal Guard ────────────────────────────────────────────────────

    /**
     * @notice Check if a withdrawal is permitted under current guard settings.
     *         Called by protected contracts via modifier pattern.
     * @dev TODO: Full implementation in Phase 2.
     */
    function checkWithdrawal(address target, uint256 amount) external view returns (bool) {
        WithdrawalConfig memory cfg = configs[target];
        if (cfg.hardPaused) return false;
        if (cfg.softLocked && amount > cfg.maxPerTransaction / 10) return false;
        return true;
    }

    // ─── Read Functions ───────────────────────────────────────────────────────

    function isPaused(address target) external view returns (bool) {
        return configs[target].hardPaused;
    }

    function isSoftLocked(address target) external view returns (bool) {
        return configs[target].softLocked;
    }

    function getConfig(address target) external view returns (WithdrawalConfig memory) {
        return configs[target];
    }
}
