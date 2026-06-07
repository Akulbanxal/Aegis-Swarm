// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AlertRegistry
 * @notice Append-only, immutable on-chain log of all Aegis security events.
 *         Every defensive action is permanently recorded with the full context,
 *         including Somnia agent receipt hashes for independent verification.
 *
 * @dev Data is append-only — no events can be modified or deleted.
 *      This provides a tamper-proof audit trail usable in insurance claims.
 *      TODO: Implement full indexing logic in Phase 2.
 */
contract AlertRegistry {
    // ─── Events ──────────────────────────────────────────────────────────────

    event IncidentLogged(
        uint256 indexed incidentId,
        address indexed targetContract,
        uint8   alertLevel,
        uint256 severity,
        uint256 blockNumber,
        bytes32 agentReceiptHash
    );

    event ContractRegistrationLogged(
        address indexed targetContract,
        address indexed registrar,
        uint256 blockNumber
    );

    // ─── Enums ───────────────────────────────────────────────────────────────

    enum AlertLevel { INFO, WARNING, CRITICAL, CATASTROPHIC }

    enum ActionTaken { NONE, SOFT_LOCK, RATE_LIMIT, PAUSE, HARD_PAUSE }

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct Incident {
        uint256   incidentId;
        address   targetContract;
        bytes32   eventTopic;
        AlertLevel alertLevel;
        uint256   severity;
        string    attackVector;
        ActionTaken actionTaken;
        uint256   blockNumber;
        uint256   timestamp;
        bytes32   sentinelRequestId;
        bytes32   analystRequestId;
        bytes32   responderRequestId;
        bytes32   agentReceiptHash;
    }

    // ─── State ───────────────────────────────────────────────────────────────

    Incident[] public incidents;
    uint256 public incidentCount;

    mapping(address => uint256[]) public contractIncidents;
    mapping(bytes32 => uint256) public requestToIncident;

    address public immutable aegisCore;

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address _aegisCore) {
        aegisCore = _aegisCore;
    }

    // ─── Write Functions ──────────────────────────────────────────────────────

    /**
     * @notice Log a new security incident. Append-only.
     * @dev TODO: onlyAegisCore access control in Phase 2.
     */
    function logIncident(
        address   targetContract,
        bytes32   eventTopic,
        AlertLevel alertLevel,
        uint256   severity,
        string calldata attackVector,
        ActionTaken actionTaken,
        bytes32   sentinelRequestId,
        bytes32   analystRequestId,
        bytes32   responderRequestId,
        bytes32   agentReceiptHash
    ) external returns (uint256 incidentId) {
        incidentId = incidentCount++;

        incidents.push(Incident({
            incidentId:         incidentId,
            targetContract:     targetContract,
            eventTopic:         eventTopic,
            alertLevel:         alertLevel,
            severity:           severity,
            attackVector:       attackVector,
            actionTaken:        actionTaken,
            blockNumber:        block.number,
            timestamp:          block.timestamp,
            sentinelRequestId:  sentinelRequestId,
            analystRequestId:   analystRequestId,
            responderRequestId: responderRequestId,
            agentReceiptHash:   agentReceiptHash
        }));

        contractIncidents[targetContract].push(incidentId);
        requestToIncident[sentinelRequestId] = incidentId;

        emit IncidentLogged(
            incidentId,
            targetContract,
            uint8(alertLevel),
            severity,
            block.number,
            agentReceiptHash
        );
    }

    function logRegistration(address target, address registrar) external {
        // TODO: onlyAegisCore
        emit ContractRegistrationLogged(target, registrar, block.number);
    }

    // ─── Read Functions ───────────────────────────────────────────────────────

    function getIncident(uint256 incidentId) external view returns (Incident memory) {
        require(incidentId < incidentCount, "AlertRegistry: incident not found");
        return incidents[incidentId];
    }

    function getContractIncidents(address target) external view returns (uint256[] memory) {
        return contractIncidents[target];
    }

    function getLatestIncidents(uint256 count) external view returns (Incident[] memory) {
        uint256 total = incidents.length;
        uint256 resultCount = count > total ? total : count;
        Incident[] memory result = new Incident[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = incidents[total - 1 - i];
        }
        return result;
    }
}
