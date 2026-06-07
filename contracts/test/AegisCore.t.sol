// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {AegisCore} from "../src/AegisCore.sol";
import {ThreatRegistry} from "../src/ThreatRegistry.sol";
import {AlertRegistry} from "../src/AlertRegistry.sol";
import {VaultGuard} from "../src/VaultGuard.sol";
import {AegisTreasury} from "../src/AegisTreasury.sol";

/**
 * @title AegisCore.t.sol
 * @notice Unit and fuzz tests for AegisCore.
 * @dev Tests are structured to verify:
 *      1. Contract registration / deregistration
 *      2. Event subscription mechanics
 *      3. Soft-lock and hard-pause logic
 *      4. Agent callback validation
 *      5. Threshold routing (CRITICAL / WARNING / INFO)
 *      TODO: Implement full test logic in Phase 2.
 */
contract AegisCoreTest is Test {
    // ─── Contracts ────────────────────────────────────────────────────────────

    AegisCore      public aegisCore;
    ThreatRegistry public threatRegistry;
    AlertRegistry  public alertRegistry;
    VaultGuard     public vaultGuard;
    AegisTreasury  public treasury;

    // ─── Test Accounts ────────────────────────────────────────────────────────

    address constant DEPLOYER    = address(0x1);
    address constant OPERATOR    = address(0x2);
    address constant PROTOCOL    = address(0x3);
    address constant ATTACKER    = address(0x4);
    address constant AGENT_ROUTER = address(0x5);

    // ─── Agent IDs ────────────────────────────────────────────────────────────

    bytes32 constant SENTINEL_ID  = bytes32(uint256(1));
    bytes32 constant ANALYST_ID   = bytes32(uint256(2));
    bytes32 constant RESPONDER_ID = bytes32(uint256(3));
    bytes32 constant ARCHIVIST_ID = bytes32(uint256(4));
    bytes32 constant MESSENGER_ID = bytes32(uint256(5));

    // ─── Setup ────────────────────────────────────────────────────────────────

    function setUp() public {
        vm.startPrank(DEPLOYER);

        treasury       = new AegisTreasury(address(0));
        threatRegistry = new ThreatRegistry(address(0));
        alertRegistry  = new AlertRegistry(address(0));
        vaultGuard     = new VaultGuard(address(0));

        aegisCore = new AegisCore(
            AGENT_ROUTER,
            address(threatRegistry),
            address(alertRegistry),
            address(vaultGuard),
            address(treasury),
            DEPLOYER,
            SENTINEL_ID,
            ANALYST_ID,
            RESPONDER_ID,
            ARCHIVIST_ID,
            MESSENGER_ID
        );

        vm.stopPrank();
    }

    // ─── Registration Tests ───────────────────────────────────────────────────

    function test_RegisterContract() public {
        vm.prank(OPERATOR);

        bytes32[] memory topics = new bytes32[](1);
        topics[0] = keccak256("Transfer(address,address,uint256)");

        AegisCore.RegistrationConfig memory config = AegisCore.RegistrationConfig({
            maxWithdrawalPerBlock: 100 ether,
            maxWithdrawalPerTx:    10 ether,
            flashLoanThreshold:    50 ether,
            subscribedTopics:      topics,
            webhookTarget:         address(0)
        });

        aegisCore.registerContract(PROTOCOL, config);
        assertTrue(aegisCore.isRegistered(PROTOCOL));
    }

    function test_RevertIfAlreadyRegistered() public {
        test_RegisterContract();
        vm.expectRevert(abi.encodeWithSelector(AegisCore.AlreadyRegistered.selector, PROTOCOL));
        vm.prank(OPERATOR);

        bytes32[] memory topics = new bytes32[](0);
        AegisCore.RegistrationConfig memory config = AegisCore.RegistrationConfig({
            maxWithdrawalPerBlock: 100 ether,
            maxWithdrawalPerTx:    10 ether,
            flashLoanThreshold:    50 ether,
            subscribedTopics:      topics,
            webhookTarget:         address(0)
        });

        aegisCore.registerContract(PROTOCOL, config);
    }

    function test_DeregisterContract() public {
        test_RegisterContract();
        aegisCore.deregisterContract(PROTOCOL);
        assertFalse(aegisCore.isRegistered(PROTOCOL));
    }

    // ─── Threshold Tests ──────────────────────────────────────────────────────

    function test_DefaultThresholds() public view {
        assertEq(aegisCore.getCriticalThreshold(), 80);
        assertEq(aegisCore.getWarningThreshold(), 40);
    }

    // ─── Fuzz Tests ───────────────────────────────────────────────────────────

    /// @dev Fuzzes contract address registration
    function testFuzz_RegisterMultipleContracts(address[5] memory targets) public {
        bytes32[] memory topics = new bytes32[](0);
        AegisCore.RegistrationConfig memory config = AegisCore.RegistrationConfig({
            maxWithdrawalPerBlock: 100 ether,
            maxWithdrawalPerTx:    10 ether,
            flashLoanThreshold:    50 ether,
            subscribedTopics:      topics,
            webhookTarget:         address(0)
        });

        for (uint256 i = 0; i < targets.length; i++) {
            if (targets[i] == address(0)) continue;
            if (aegisCore.isRegistered(targets[i])) continue;
            aegisCore.registerContract(targets[i], config);
            assertTrue(aegisCore.isRegistered(targets[i]));
        }
    }

    // TODO: Add tests for:
    // - _onEvent() soft-lock behavior
    // - onSentinelResult() callback routing
    // - onAnalystResult() threshold routing
    // - onResponderResult() coordinated attack detection
    // - Anti-griefing: max pending analyses per contract
    // - Timeout handling for stale analyses
}
