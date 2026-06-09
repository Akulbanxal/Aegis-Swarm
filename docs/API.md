# API Reference — Aegis Swarm Backend

> **Base URL:** `http://localhost:3001`
> **WebSocket:** `ws://localhost:3001/ws`

---

## REST Endpoints

### Health

```
GET /health
```
Returns service status.

---

### Incidents

```
GET /api/v1/incidents
  ?limit=50
  ?offset=0
  ?severity=critical|warning|info
  ?contract=0x...
  ?from=<timestamp>
  ?to=<timestamp>

GET /api/v1/incidents/:id
```
Returns paginated list of security incidents. Sorted by block number descending.

---

### Contracts

```
GET /api/v1/contracts
  ?status=active|paused|deregistered

GET /api/v1/contracts/:address
GET /api/v1/contracts/:address/incidents
GET /api/v1/contracts/:address/status
```

---

### Swarm Status

```
GET /api/v1/swarm/status
```
Returns current swarm health: all 5 agents, invocation counts, success rates.

---

### Metrics

```
GET /api/v1/metrics/overview
GET /api/v1/metrics/agents
GET /api/v1/metrics/treasury
```

---

## WebSocket Events

Connect to `ws://localhost:3001/ws`

### Server → Client Events

```typescript
// Connection established
{ type: 'CONNECTED', payload: { timestamp: number } }

// New threat detected on-chain
{ type: 'THREAT_DETECTED', payload: {
    targetContract: string,
    severity: number,
    attackVector: string,
    blockNumber: number,
    requestId: string
}}

// Incident logged (agent chain complete)
{ type: 'INCIDENT_LOGGED', payload: SecurityIncident }

// Circuit breaker state change
{ type: 'CIRCUIT_BREAKER', payload: {
    targetContract: string,
    action: 'SOFT_LOCK' | 'HARD_PAUSE' | 'RELEASE',
    blockNumber: number
}}

// Agent invocation status
{ type: 'AGENT_STATUS', payload: {
    agentType: string,
    status: 'INVOKED' | 'COMPLETE' | 'FAILED',
    requestId: string
}}
```

### Client → Server Events

```typescript
// Subscribe to specific contract events only
{ type: 'SUBSCRIBE', payload: { contracts: string[] } }

// Unsubscribe
{ type: 'UNSUBSCRIBE', payload: { contracts: string[] } }
```

---

## Error Responses

All errors follow this format:

```typescript
{
  error: string,       // Machine-readable error code
  message: string,     // Human-readable description
  statusCode: number
}
```

| Code | Error | Description |
|---|---|---|
| 400 | `INVALID_ADDRESS` | Invalid Ethereum address |
| 404 | `CONTRACT_NOT_FOUND` | Contract not registered |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
