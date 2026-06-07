// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAgentRouter
 * @notice Interface for invoking Somnia Agents from smart contracts.
 *         Agents are decentralized, sandboxed compute containers that can
 *         fetch external data, call APIs, and perform LLM inference.
 * @dev    Based on docs.somnia.network/agents
 *         EVM-native: inputs and outputs are ABI-encoded.
 */
interface IAgentRouter {
    // ─── Events ──────────────────────────────────────────────────────────────

    event AgentInvoked(
        bytes32 indexed requestId,
        bytes32 indexed agentId,
        address indexed requester,
        address callbackTarget
    );

    event AgentResultDelivered(
        bytes32 indexed requestId,
        bytes32 indexed agentId,
        bool success
    );

    // ─── Errors ──────────────────────────────────────────────────────────────

    error InsufficientDeposit(uint256 required, uint256 provided);
    error InvalidAgentId(bytes32 agentId);
    error InvalidCallbackTarget();

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Invoke a Somnia Agent.
     * @param agentId        The unique identifier of the agent to invoke.
     * @param payload        ABI-encoded input data for the agent.
     * @param callbackTarget Contract to call when the agent result is ready.
     *                       Use address(0) for fire-and-forget (no callback).
     * @param callbackSig    4-byte function selector for the callback.
     * @return requestId     Unique identifier for this invocation.
     *                       Used to match callbacks to requests.
     */
    function invoke(
        bytes32 agentId,
        bytes calldata payload,
        address callbackTarget,
        bytes4 callbackSig
    ) external payable returns (bytes32 requestId);

    /**
     * @notice Get the minimum required deposit for an agent invocation.
     * @param agentId The agent to query.
     */
    function getMinDeposit(bytes32 agentId) external view returns (uint256);

    /**
     * @notice Get the status of a pending agent invocation.
     */
    function getStatus(bytes32 requestId) external view returns (InvocationStatus);

    // ─── Enums ───────────────────────────────────────────────────────────────

    enum InvocationStatus {
        PENDING,
        EXECUTING,
        COMPLETED,
        FAILED,
        TIMEOUT
    }
}
