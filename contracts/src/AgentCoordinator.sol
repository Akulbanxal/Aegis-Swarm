// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AegisController} from "./AegisController.sol";
import {EmergencyPause} from "./EmergencyPause.sol";

/**
 * @title AgentCoordinator
 * @notice Intercepts on-chain events and coordinates the Somnia AI Agent responses.
 */
contract AgentCoordinator {
    // ─── Events ──────────────────────────────────────────────────────────────
    event EventIntercepted(address indexed source, bytes32 indexed topic, uint256 blockNumber);
    event AgentDispatched(address indexed target, bytes32 agentId, bytes32 requestId);
    event AgentResultReceived(bytes32 indexed requestId, uint256 severity, string action);

    // ─── State Variables ─────────────────────────────────────────────────────
    address public owner;
    
    AegisController public aegisController;
    EmergencyPause public emergencyPause;

    // Agent IDs
    bytes32 public constant SENTINEL_AGENT = bytes32(uint256(1));
    bytes32 public constant ANALYST_AGENT = bytes32(uint256(2));

    uint256 private _nextRequestId = 1;
    
    struct PendingAnalysis {
        address targetProtocol;
        uint256 blockNumber;
        bool isActive;
    }

    mapping(bytes32 => PendingAnalysis) public pendingRequests;

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "AgentCoordinator: caller is not the owner");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor(address _aegisController, address _emergencyPause) {
        owner = msg.sender;
        aegisController = AegisController(_aegisController);
        emergencyPause = EmergencyPause(_emergencyPause);
    }

    // ─── Event Interception ──────────────────────────────────────────────────
    /**
     * @notice Simulates Somnia's native reactive `_onEvent` hook.
     * @dev In a real Somnia reactive contract, this is called by the protocol.
     */
    function _onEvent(address source, bytes32 topic, bytes calldata /* data */) external {
        if (!aegisController.isRegistered(source)) return;

        emit EventIntercepted(source, topic, block.number);

        // Immediate soft-lock as a precautionary measure
        emergencyPause.applySoftLock(source, "Precautionary soft-lock pending analysis");

        // Dispatch to Sentinel Agent
        bytes32 requestId = bytes32(_nextRequestId++);
        pendingRequests[requestId] = PendingAnalysis({
            targetProtocol: source,
            blockNumber: block.number,
            isActive: true
        });

        emit AgentDispatched(source, SENTINEL_AGENT, requestId);
    }

    // ─── Agent Callbacks ─────────────────────────────────────────────────────
    /**
     * @notice Callback for the Analyst agent to report the threat severity.
     */
    function onAnalystResult(bytes32 requestId, uint256 severity) external {
        PendingAnalysis memory request = pendingRequests[requestId];
        require(request.isActive, "AgentCoordinator: invalid request ID");

        string memory actionTaken = "NO_ACTION";

        // Route to EmergencyPause based on severity thresholds
        if (severity >= aegisController.criticalThreshold()) {
            emergencyPause.applyHardPause(request.targetProtocol, "Critical threat detected");
            actionTaken = "HARD_PAUSE";
        } else if (severity >= aegisController.warningThreshold()) {
            // Keep the soft lock, do not hard pause
            actionTaken = "MAINTAIN_SOFT_LOCK";
        } else {
            // Safe, lift the lock
            emergencyPause.liftSoftLock(request.targetProtocol);
            actionTaken = "LIFT_SOFT_LOCK";
        }

        // Clean up
        delete pendingRequests[requestId];

        emit AgentResultReceived(requestId, severity, actionTaken);
    }
}
