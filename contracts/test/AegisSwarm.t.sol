// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ThreatRegistry} from "../src/ThreatRegistry.sol";
import {EmergencyPause} from "../src/EmergencyPause.sol";
import {AegisController} from "../src/AegisController.sol";
import {AgentCoordinator} from "../src/AgentCoordinator.sol";
import {ProtectedVault} from "../src/ProtectedVault.sol";

contract AegisSwarmTest is Test {
    ThreatRegistry public threatRegistry;
    EmergencyPause public emergencyPause;
    AegisController public aegisController;
    AgentCoordinator public agentCoordinator;
    ProtectedVault public vault;

    address public DEPLOYER = address(0x1);
    address public USER = address(0x2);

    function setUp() public {
        vm.startPrank(DEPLOYER);

        threatRegistry = new ThreatRegistry();
        emergencyPause = new EmergencyPause();
        aegisController = new AegisController(address(threatRegistry), address(emergencyPause));
        agentCoordinator = new AgentCoordinator(address(aegisController), address(emergencyPause));
        
        threatRegistry.setAegisController(address(aegisController));
        emergencyPause.setAuthorizedCallers(address(aegisController), address(agentCoordinator));

        vault = new ProtectedVault(address(emergencyPause), address(aegisController));

        vm.stopPrank();

        // Give user ETH
        vm.deal(USER, 1000 ether);
    }

    function test_Registration() public {
        vm.prank(DEPLOYER);
        aegisController.registerProtocol(address(vault), 100 ether);
        assertTrue(aegisController.isRegistered(address(vault)));
    }

    function test_AttackAndDefense() public {
        // 1. Register Vault
        vm.prank(DEPLOYER);
        aegisController.registerProtocol(address(vault), 100 ether);

        // 2. User Deposits
        vm.startPrank(USER);
        vault.deposit{value: 500 ether}();
        assertEq(vault.balances(USER), 500 ether);

        // 3. Simulated Event Interception
        // Let's pretend an event triggered a soft lock via AgentCoordinator
        vm.startPrank(DEPLOYER);
        agentCoordinator._onEvent(address(vault), bytes32(0), "");
        
        // Assert soft lock is active
        assertTrue(emergencyPause.isSoftLocked(address(vault)));

        // 4. User tries to withdraw 100 ETH (20% of balance) during Soft Lock (should fail)
        vm.startPrank(USER);
        vm.expectRevert("ProtectedVault: rate limit active (soft lock)");
        vault.withdraw(100 ether);

        // 5. User tries to withdraw 50 ETH (10% of balance) during Soft Lock (should succeed)
        vault.withdraw(50 ether);
        assertEq(vault.balances(USER), 450 ether);

        // 6. Agent resolves threat as CRITICAL (severity 95)
        vm.startPrank(DEPLOYER);
        // Request ID is 1
        agentCoordinator.onAnalystResult(bytes32(uint256(1)), 95);

        // Assert Hard Pause is active
        assertTrue(emergencyPause.isHardPaused(address(vault)));

        // 7. User tries to withdraw 10 ETH during Hard Pause (should fail)
        vm.startPrank(USER);
        vm.expectRevert("ProtectedVault: withdrawals paused by Aegis");
        vault.withdraw(10 ether);
    }
}
