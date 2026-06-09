// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ThreatRegistry} from "./ThreatRegistry.sol";
import {EmergencyPause} from "./EmergencyPause.sol";

/**
 * @title AegisController
 * @notice Main registry and configuration hub for the Aegis Swarm defense system.
 */
contract AegisController {
    // ─── Events ──────────────────────────────────────────────────────────────
    event ProtocolRegistered(address indexed protocol, uint256 maxTxLimit);
    event ProtocolDeregistered(address indexed protocol);
    event ThresholdsUpdated(uint256 warningThreshold, uint256 criticalThreshold);

    // ─── State Variables ─────────────────────────────────────────────────────
    address public owner;
    
    ThreatRegistry public threatRegistry;
    EmergencyPause public emergencyPause;

    uint256 public warningThreshold = 40;
    uint256 public criticalThreshold = 80;

    struct ProtocolConfig {
        bool isRegistered;
        uint256 maxTxLimit;
    }

    mapping(address => ProtocolConfig) public registeredProtocols;

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "AegisController: caller is not the owner");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor(address _threatRegistry, address _emergencyPause) {
        owner = msg.sender;
        threatRegistry = ThreatRegistry(_threatRegistry);
        emergencyPause = EmergencyPause(_emergencyPause);
    }

    // ─── Governance ──────────────────────────────────────────────────────────
    function setThresholds(uint256 _warningThreshold, uint256 _criticalThreshold) external onlyOwner {
        require(_warningThreshold < _criticalThreshold, "AegisController: invalid thresholds");
        warningThreshold = _warningThreshold;
        criticalThreshold = _criticalThreshold;
        emit ThresholdsUpdated(warningThreshold, criticalThreshold);
    }

    // ─── Protocol Registration ───────────────────────────────────────────────
    function registerProtocol(address protocol, uint256 maxTxLimit) external {
        // In a real system, the caller would be the protocol owner. 
        // For testing, we allow open registration.
        require(!registeredProtocols[protocol].isRegistered, "AegisController: already registered");
        
        registeredProtocols[protocol] = ProtocolConfig({
            isRegistered: true,
            maxTxLimit: maxTxLimit
        });

        emit ProtocolRegistered(protocol, maxTxLimit);
    }

    function deregisterProtocol(address protocol) external {
        require(registeredProtocols[protocol].isRegistered, "AegisController: not registered");
        delete registeredProtocols[protocol];
        emit ProtocolDeregistered(protocol);
    }

    // ─── View Functions ──────────────────────────────────────────────────────
    function isRegistered(address protocol) external view returns (bool) {
        return registeredProtocols[protocol].isRegistered;
    }
}
