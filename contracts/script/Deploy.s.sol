// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ThreatRegistry} from "../src/ThreatRegistry.sol";
import {EmergencyPause} from "../src/EmergencyPause.sol";
import {AegisController} from "../src/AegisController.sol";
import {AgentCoordinator} from "../src/AgentCoordinator.sol";
import {ProtectedVault} from "../src/ProtectedVault.sol";
import {MockAttacker} from "../src/mocks/MockAttacker.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying Aegis Swarm...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. ThreatRegistry
        ThreatRegistry threatRegistry = new ThreatRegistry();
        console.log("ThreatRegistry:", address(threatRegistry));

        // 2. EmergencyPause
        EmergencyPause emergencyPause = new EmergencyPause();
        console.log("EmergencyPause:", address(emergencyPause));

        // 3. AegisController
        AegisController aegisController = new AegisController(address(threatRegistry), address(emergencyPause));
        console.log("AegisController:", address(aegisController));

        // 4. AgentCoordinator
        AgentCoordinator agentCoordinator = new AgentCoordinator(address(aegisController), address(emergencyPause));
        console.log("AgentCoordinator:", address(agentCoordinator));

        // 5. Connect authorizations
        threatRegistry.setAegisController(address(aegisController));
        emergencyPause.setAuthorizedCallers(address(aegisController), address(agentCoordinator));

        // 6. ProtectedVault (Target Contract)
        ProtectedVault vault = new ProtectedVault(address(emergencyPause), address(aegisController));
        console.log("ProtectedVault:", address(vault));

        // 7. Seed Vault with Mock Deposit
        vault.deposit{value: 105 ether}();
        console.log("Seeded Vault with 105 ETH");

        // 8. Deploy Mock Attacker
        MockAttacker attacker = new MockAttacker(address(vault));
        console.log("MockAttacker:", address(attacker));

        vm.stopBroadcast();
    }
}
