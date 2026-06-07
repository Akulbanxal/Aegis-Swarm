// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AegisTreasury
 * @notice Manages STT/SOMI deposits for funding Somnia Agent invocations.
 *         Registered protocols deposit funds here to cover agent fees.
 *         Handles rebates when agents return unused deposit portions.
 *
 * @dev TODO: Implement full fund-flow logic in Phase 2.
 */
contract AegisTreasury {
    // ─── Events ──────────────────────────────────────────────────────────────

    event FundsDeposited(address indexed protocol, uint256 amount, uint256 newBalance);
    event FundsWithdrawn(address indexed protocol, uint256 amount);
    event AgentFeePaid(address indexed protocol, bytes32 requestId, uint256 amount);
    event RebateReceived(bytes32 requestId, uint256 amount);
    event LowBalanceWarning(address indexed protocol, uint256 balance, uint256 threshold);

    // ─── Errors ──────────────────────────────────────────────────────────────

    error InsufficientBalance(address protocol, uint256 required, uint256 available);
    error NotRegistered(address protocol);
    error Unauthorized();

    // ─── Constants ───────────────────────────────────────────────────────────

    /// @notice Warn when balance drops below 30-day runway estimate
    uint256 public constant LOW_BALANCE_THRESHOLD = 10 ether;

    // ─── State ───────────────────────────────────────────────────────────────

    mapping(address => uint256) public protocolBalances;
    mapping(address => bool)    public registeredProtocols;

    address public immutable aegisCore;
    address public owner;

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address _aegisCore) {
        aegisCore = _aegisCore;
        owner = msg.sender;
    }

    // ─── Deposit / Withdraw ───────────────────────────────────────────────────

    function deposit(address protocol) external payable {
        // TODO: onlyRegisteredProtocol
        protocolBalances[protocol] += msg.value;
        emit FundsDeposited(protocol, msg.value, protocolBalances[protocol]);

        if (protocolBalances[protocol] < LOW_BALANCE_THRESHOLD) {
            emit LowBalanceWarning(protocol, protocolBalances[protocol], LOW_BALANCE_THRESHOLD);
        }
    }

    function withdraw(address protocol, uint256 amount) external {
        // TODO: onlyProtocolOwner
        if (protocolBalances[protocol] < amount) {
            revert InsufficientBalance(protocol, amount, protocolBalances[protocol]);
        }
        protocolBalances[protocol] -= amount;
        payable(msg.sender).transfer(amount);
        emit FundsWithdrawn(protocol, amount);
    }

    // ─── Agent Fee Management ─────────────────────────────────────────────────

    function payAgentFee(
        address protocol,
        bytes32 requestId,
        uint256 amount
    ) external {
        // TODO: onlyAegisCore
        if (protocolBalances[protocol] < amount) {
            revert InsufficientBalance(protocol, amount, protocolBalances[protocol]);
        }
        protocolBalances[protocol] -= amount;
        emit AgentFeePaid(protocol, requestId, amount);
    }

    function receiveRebate(bytes32 requestId) external payable {
        // Agent rebates flow back to treasury
        // TODO: Credit back to originating protocol
        emit RebateReceived(requestId, msg.value);
    }

    // ─── Read Functions ───────────────────────────────────────────────────────

    function getBalance(address protocol) external view returns (uint256) {
        return protocolBalances[protocol];
    }

    function hasEnoughForAgent(address protocol, uint256 agentCost)
        external
        view
        returns (bool)
    {
        return protocolBalances[protocol] >= agentCost;
    }

    receive() external payable {}
}
