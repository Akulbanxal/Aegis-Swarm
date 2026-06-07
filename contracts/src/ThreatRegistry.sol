// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ThreatRegistry
 * @notice On-chain database of known attack signatures and vulnerability patterns.
 *         Updated autonomously by the Archivist Agent from external threat intelligence.
 *         Used by the Sentinel Agent for fast signature matching.
 *
 * @dev TODO: Implement full CRUD logic in Phase 2.
 */
contract ThreatRegistry {
    // ─── Events ──────────────────────────────────────────────────────────────

    event SignatureAdded(bytes32 indexed signatureHash, string attackVector, uint256 severity);
    event SignatureUpdated(bytes32 indexed signatureHash, uint256 newOccurrenceCount);
    event SignatureDeactivated(bytes32 indexed signatureHash);
    event ProactiveScanTriggered(bytes32 indexed signatureHash, address indexed target);

    // ─── Errors ──────────────────────────────────────────────────────────────

    error SignatureAlreadyExists(bytes32 signatureHash);
    error SignatureNotFound(bytes32 signatureHash);
    error Unauthorized();

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct ThreatSignature {
        bytes32 signatureHash;
        string  attackVector;    // e.g., "FLASH_LOAN_REENTRANCY"
        uint256 severity;        // 0-100
        uint256 firstSeenBlock;
        uint256 lastSeenBlock;
        uint256 occurrenceCount;
        string  description;
        bool    active;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    mapping(bytes32 => ThreatSignature) public signatures;
    bytes32[] public signatureIndex;

    address public immutable aegisCore;
    address public owner;

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address _aegisCore) {
        aegisCore = _aegisCore;
        owner = msg.sender;
    }

    // ─── Write Functions (stubbed) ────────────────────────────────────────────

    function addSignature(
        bytes32 signatureHash,
        string calldata attackVector,
        uint256 severity,
        string calldata description
    ) external {
        // TODO: Access control (onlyAegisCore || onlyOwner)
        // TODO: Validate severity range [0, 100]

        signatures[signatureHash] = ThreatSignature({
            signatureHash:   signatureHash,
            attackVector:    attackVector,
            severity:        severity,
            firstSeenBlock:  block.number,
            lastSeenBlock:   block.number,
            occurrenceCount: 1,
            description:     description,
            active:          true
        });

        signatureIndex.push(signatureHash);
        emit SignatureAdded(signatureHash, attackVector, severity);
    }

    function recordOccurrence(bytes32 signatureHash) external {
        // TODO: onlyAegisCore
        ThreatSignature storage sig = signatures[signatureHash];
        if (!sig.active) revert SignatureNotFound(signatureHash);
        sig.occurrenceCount++;
        sig.lastSeenBlock = block.number;
        emit SignatureUpdated(signatureHash, sig.occurrenceCount);
    }

    function deactivateSignature(bytes32 signatureHash) external {
        // TODO: onlyOwner || onlyGovernance
        signatures[signatureHash].active = false;
        emit SignatureDeactivated(signatureHash);
    }

    // ─── Read Functions ───────────────────────────────────────────────────────

    function signatureExists(bytes32 signatureHash) external view returns (bool) {
        return signatures[signatureHash].active;
    }

    function getSignature(bytes32 signatureHash)
        external
        view
        returns (ThreatSignature memory)
    {
        return signatures[signatureHash];
    }

    function getSignatureCount() external view returns (uint256) {
        return signatureIndex.length;
    }

    function getAllActiveSignatures() external view returns (bytes32[] memory) {
        // TODO: Filter to active only for gas efficiency
        return signatureIndex;
    }
}
