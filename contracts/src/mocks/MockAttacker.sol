// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProtectedVault {
    function withdraw(uint256 amount) external;
    function deposit() external payable;
}

/**
 * @title MockAttacker
 * @dev Simulates a reentrancy attack against the ProtectedVault.
 * In a real demo, Aegis Swarm will intercept this transaction in the mempool 
 * or immediately after the first event emit, pausing the protocol before funds are lost.
 */
contract MockAttacker {
    IProtectedVault public targetVault;

    constructor(address _vault) {
        targetVault = IProtectedVault(_vault);
    }

    // Function to initiate the attack
    function launchAttack() external {
        // For the demo simulation, we call the vault with a malicious amount.
        // Even if we don't have the balance, the Vault will emit the ThreatTriggered 
        // event BEFORE the balance check to ensure the agents trigger.
        try targetVault.withdraw(100 ether) {} catch {}
    }

    // Fallback function to simulate reentrancy
    receive() external payable {
        if (address(targetVault).balance >= 100 ether) {
            targetVault.withdraw(100 ether);
        }
    }
}
