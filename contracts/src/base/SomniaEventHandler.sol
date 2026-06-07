// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ISomniaEventHandler
 * @notice Interface for Somnia's native on-chain reactivity system.
 *         Contracts inheriting this can subscribe to events from other contracts
 *         and react to them within the same block — no external keeper required.
 * @dev    Based on docs.somnia.network/developer/reactivity
 *         This is a stub — replace with the actual Somnia SDK contract when available.
 */
abstract contract SomniaEventHandler {
    // ─── Events ──────────────────────────────────────────────────────────────

    event EventSubscribed(address indexed source, bytes32 indexed topic0);
    event EventUnsubscribed(address indexed source, bytes32 indexed topic0);

    // ─── Errors ──────────────────────────────────────────────────────────────

    error NotReactiveNetwork();
    error AlreadySubscribed(address source, bytes32 topic0);
    error NotSubscribed(address source, bytes32 topic0);

    // ─── Storage ─────────────────────────────────────────────────────────────

    /// @dev The Somnia reactive network address — set by protocol
    address internal constant SOMNIA_REACTIVE_NETWORK = address(0); // TODO: set after deployment

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyReactiveNetwork() {
        if (msg.sender != SOMNIA_REACTIVE_NETWORK) revert NotReactiveNetwork();
        _;
    }

    // ─── Abstract Functions ───────────────────────────────────────────────────

    /**
     * @notice Called by the Somnia protocol when a subscribed event fires.
     *         Executes in the same block as the triggering transaction.
     * @param source    The contract address that emitted the event
     * @param topic0    The event signature hash (keccak256 of event sig)
     * @param eventData ABI-encoded event data
     */
    function _onEvent(
        address source,
        bytes32 topic0,
        bytes calldata eventData
    ) internal virtual;

    // ─── Internal Helpers ────────────────────────────────────────────────────

    /**
     * @notice Subscribe to events emitted by `source` matching `topic0`.
     *         Subscriptions are stored in Somnia chain state.
     */
    function _subscribe(address source, bytes32 topic0) internal {
        // TODO: Replace with actual Somnia subscription call
        emit EventSubscribed(source, topic0);
    }

    function _unsubscribe(address source, bytes32 topic0) internal {
        // TODO: Replace with actual Somnia unsubscription call
        emit EventUnsubscribed(source, topic0);
    }
}
