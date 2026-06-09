# Backend Architecture

The Aegis Swarm backend is an event-driven Node.js/Express application that bridges the Somnia blockchain, the autonomous agents, and the frontend dashboard.

## Components

### 1. Database Layer
- **Prisma + SQLite**: Ensures high-speed, local reliability.
- **Models**:
  - `Protocol`: Represents a target smart contract registered for protection.
  - `Incident`: Represents a tracked threat, mapping the entire agent pipeline's decision (Severity, Attack Vector, Action Taken).
  - `Alert`: System-wide notifications for the dashboard.

### 2. Orchestration (`AgentManager.ts`)
- Initializes the `@aegis-swarm/agents` library.
- Maps internal agent bus events (`NEW_ONCHAIN_EVENT`, `THREAT_DETECTED`, `DEFENSE_EXECUTED`) to real-time `WebSocketServer` broadcasts.
- Performs persistent database upserts matching the memory context of the autonomous agents.

### 3. API Services
- **REST**:
  - `/api/incidents`: Historical incident feeds.
  - `/api/protocols`: Enrolled contract states.
  - `/api/simulate`: Test endpoints to trigger the agent swarm without waiting for live blockchain events.
- **WebSockets**:
  - Pushes real-time `SWARM_EVENT` and `ALERT` payloads directly to the frontend clients.
