// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title EmergencyPause
 * @notice Maintains circuit breaker states (soft lock, hard pause) for protocols.
 * @dev Target contracts integrate with this via view functions.
 */
contract EmergencyPause {
    // ─── Events ──────────────────────────────────────────────────────────────
    event SoftLockActivated(address indexed protocol, uint256 blockNumber, string reason);
    event HardPauseActivated(address indexed protocol, uint256 blockNumber, string reason);
    event LockLifted(address indexed protocol, uint256 blockNumber);
    event PauseLifted(address indexed protocol, uint256 blockNumber);

    // ─── State Variables ─────────────────────────────────────────────────────
    address public owner;
    address public aegisController;
    address public agentCoordinator;

    // Rate limits (Soft lock limits max withdrawal per transaction to a fraction)
    mapping(address => bool) public isSoftLocked;
    mapping(address => bool) public isHardPaused;
    mapping(address => uint256) public softLockTimestamps;

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "EmergencyPause: caller is not the owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || 
            msg.sender == aegisController || 
            msg.sender == agentCoordinator,
            "EmergencyPause: unauthorized"
        );
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ─── Configuration ───────────────────────────────────────────────────────
    function setAuthorizedCallers(address _aegisController, address _agentCoordinator) external onlyOwner {
        aegisController = _aegisController;
        agentCoordinator = _agentCoordinator;
    }

    // ─── Actions ─────────────────────────────────────────────────────────────
    /**
     * @notice Applies a soft lock to a protocol.
     */
    function applySoftLock(address protocol, string calldata reason) external onlyAuthorized {
        if (!isSoftLocked[protocol]) {
            isSoftLocked[protocol] = true;
            softLockTimestamps[protocol] = block.timestamp;
            emit SoftLockActivated(protocol, block.number, reason);
        }
    }

    /**
     * @notice Applies a hard pause to a protocol.
     */
    function applyHardPause(address protocol, string calldata reason) external onlyAuthorized {
        if (!isHardPaused[protocol]) {
            isHardPaused[protocol] = true;
            emit HardPauseActivated(protocol, block.number, reason);
        }
    }

    /**
     * @notice Lifts a soft lock.
     */
    function liftSoftLock(address protocol) external onlyAuthorized {
        if (isSoftLocked[protocol]) {
            isSoftLocked[protocol] = false;
            emit LockLifted(protocol, block.number);
        }
    }

    /**
     * @notice Lifts a hard pause.
     */
    function liftHardPause(address protocol) external onlyAuthorized {
        if (isHardPaused[protocol]) {
            isHardPaused[protocol] = false;
            emit PauseLifted(protocol, block.number);
        }
    }
}
