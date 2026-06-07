// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AegisTreasury} from "../src/AegisTreasury.sol";
import {ThreatRegistry} from "../src/ThreatRegistry.sol";
import {AlertRegistry} from "../src/AlertRegistry.sol";
import {VaultGuard} from "../src/VaultGuard.sol";
import {AegisCore} from "../src/AegisCore.sol";

/**
 * @title Deploy
 * @notice Deployment script for the full Aegis Swarm contract suite.
 *         Run with: forge script script/Deploy.s.sol --rpc-url somnia_testnet --broadcast
 *
 * @dev Deployment order matters — later contracts depend on earlier ones.
 *      TODO: Configure actual agentIds once Somnia Agent Router is live.
 */
contract Deploy is Script {
    // ─── Agent IDs (TODO: Replace with actual Somnia agent IDs) ──────────────

    bytes32 constant SENTINEL_AGENT_ID  = bytes32(uint256(1));
    bytes32 constant ANALYST_AGENT_ID   = bytes32(uint256(2));
    bytes32 constant RESPONDER_AGENT_ID = bytes32(uint256(3));
    bytes32 constant ARCHIVIST_AGENT_ID = bytes32(uint256(4));
    bytes32 constant MESSENGER_AGENT_ID = bytes32(uint256(5));

    // ─── Agent Router (TODO: Replace with actual Somnia Agent Router address) ─
    address constant AGENT_ROUTER = address(0); // Set before deployment!

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying Aegis Swarm contracts...");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        // ── Step 1: Deploy AegisTreasury ─────────────────────────────────────
        // Note: AegisCore address not known yet — pass address(0) and update after
        AegisTreasury treasury = new AegisTreasury(address(0));
        console.log("AegisTreasury deployed at:", address(treasury));

        // ── Step 2: Deploy ThreatRegistry ────────────────────────────────────
        ThreatRegistry threatRegistry = new ThreatRegistry(address(0));
        console.log("ThreatRegistry deployed at:", address(threatRegistry));

        // ── Step 3: Deploy AlertRegistry ─────────────────────────────────────
        AlertRegistry alertRegistry = new AlertRegistry(address(0));
        console.log("AlertRegistry deployed at:", address(alertRegistry));

        // ── Step 4: Deploy VaultGuard ─────────────────────────────────────────
        VaultGuard vaultGuard = new VaultGuard(address(0));
        console.log("VaultGuard deployed at:", address(vaultGuard));

        // ── Step 5: Deploy AegisCore ─────────────────────────────────────────
        AegisCore aegisCore = new AegisCore(
            AGENT_ROUTER,
            address(threatRegistry),
            address(alertRegistry),
            address(vaultGuard),
            address(treasury),
            deployer,       // governance = deployer for now
            SENTINEL_AGENT_ID,
            ANALYST_AGENT_ID,
            RESPONDER_AGENT_ID,
            ARCHIVIST_AGENT_ID,
            MESSENGER_AGENT_ID
        );
        console.log("AegisCore deployed at:", address(aegisCore));

        vm.stopBroadcast();

        // ── Log deployment summary ────────────────────────────────────────────
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network:         Somnia Testnet (chain", block.chainid, ")");
        console.log("AegisTreasury:  ", address(treasury));
        console.log("ThreatRegistry: ", address(threatRegistry));
        console.log("AlertRegistry:  ", address(alertRegistry));
        console.log("VaultGuard:     ", address(vaultGuard));
        console.log("AegisCore:      ", address(aegisCore));
        console.log("===========================\n");
        console.log("Next steps:");
        console.log("1. Update .env with deployed addresses");
        console.log("2. Run scripts/seed-threats.ts to populate ThreatRegistry");
        console.log("3. Run scripts/register-contract.ts to register test contracts");
    }
}
