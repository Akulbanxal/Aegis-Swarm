// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ThreatRegistry
 * @notice Centralized on-chain registry for threat signatures and incident tracking.
 * @dev Emits extensive events for external indexing. Access controlled to AegisController.
 */
contract ThreatRegistry {
    // ─── Events ──────────────────────────────────────────────────────────────
    event ThreatSignatureAdded(uint256 indexed signatureId, string attackVector, uint256 severity);
    event IncidentLogged(uint256 indexed incidentId, address indexed protocol, uint256 severity, string actionTaken, uint256 blockNumber);

    // ─── Structs ─────────────────────────────────────────────────────────────
    struct ThreatSignature {
        uint256 id;
        string attackVector;
        uint256 severity;
        bool isActive;
    }

    struct Incident {
        uint256 id;
        address protocol;
        uint256 severity;
        string actionTaken;
        uint256 timestamp;
        uint256 blockNumber;
    }

    // ─── State Variables ─────────────────────────────────────────────────────
    address public owner;
    address public aegisController;

    uint256 public nextSignatureId = 1;
    uint256 public nextIncidentId = 1;

    mapping(uint256 => ThreatSignature) public signatures;
    mapping(uint256 => Incident) public incidents;
    mapping(address => uint256[]) public protocolIncidents;

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "ThreatRegistry: caller is not the owner");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == aegisController, "ThreatRegistry: unauthorized");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ─── Administration ──────────────────────────────────────────────────────
    function setAegisController(address _aegisController) external onlyOwner {
        require(_aegisController != address(0), "ThreatRegistry: invalid address");
        aegisController = _aegisController;
    }

    // ─── Operations ──────────────────────────────────────────────────────────
    /**
     * @notice Adds a known threat signature.
     */
    function addThreatSignature(string calldata attackVector, uint256 severity) external onlyAuthorized returns (uint256) {
        uint256 id = nextSignatureId++;
        signatures[id] = ThreatSignature({
            id: id,
            attackVector: attackVector,
            severity: severity,
            isActive: true
        });

        emit ThreatSignatureAdded(id, attackVector, severity);
        return id;
    }

    /**
     * @notice Logs a new security incident.
     */
    function logIncident(address protocol, uint256 severity, string calldata actionTaken) external onlyAuthorized returns (uint256) {
        uint256 id = nextIncidentId++;
        incidents[id] = Incident({
            id: id,
            protocol: protocol,
            severity: severity,
            actionTaken: actionTaken,
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        protocolIncidents[protocol].push(id);

        emit IncidentLogged(id, protocol, severity, actionTaken, block.number);
        return id;
    }

    // ─── View Functions ──────────────────────────────────────────────────────
    function getIncidentCount(address protocol) external view returns (uint256) {
        return protocolIncidents[protocol].length;
    }
}
