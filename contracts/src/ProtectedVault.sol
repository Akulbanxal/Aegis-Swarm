// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EmergencyPause} from "./EmergencyPause.sol";
import {AegisController} from "./AegisController.sol";

/**
 * @title ProtectedVault
 * @notice Example target contract demonstrating integration with Aegis Swarm.
 */
contract ProtectedVault {
    EmergencyPause public emergencyPause;
    AegisController public aegisController;

    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event ThreatTriggered(address indexed user, uint256 amount); // Topic to trigger agent

    constructor(address _emergencyPause, address _aegisController) {
        emergencyPause = EmergencyPause(_emergencyPause);
        aegisController = AegisController(_aegisController);
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        // 3. Emit event that Somnia will pick up if it matches a signature
        // For demo, if amount is >= 100 ether, we emit ThreatTriggered BEFORE checking balances
        // to ensure the agents trigger even if the attack would fail locally
        if (amount >= 100 ether) {
            emit ThreatTriggered(msg.sender, amount);
        }

        require(balances[msg.sender] >= amount, "ProtectedVault: insufficient balance");
        
        // --- Aegis Swarm Integration ---
        // 1. Check for Hard Pause
        require(!emergencyPause.isHardPaused(address(this)), "ProtectedVault: withdrawals paused by Aegis");

        // 2. Check for Soft Lock (Rate Limiting)
        if (emergencyPause.isSoftLocked(address(this))) {
            // Max 10% withdrawal during soft lock
            uint256 maxAllowed = balances[msg.sender] / 10;
            require(amount <= maxAllowed, "ProtectedVault: rate limit active (soft lock)");
        }

        balances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ProtectedVault: transfer failed");

        emit Withdrawn(msg.sender, amount);
    }
}
