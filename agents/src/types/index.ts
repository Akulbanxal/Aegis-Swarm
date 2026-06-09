/**
 * Aegis Swarm — Shared Type Definitions
 * Used across agents, backend, and frontend packages.
 */

// ─── Agent Invocation ─────────────────────────────────────────────────────────

export interface AgentInvocationParams {
  agentId: `0x${string}`
  payload: `0x${string}`
  callbackTarget: `0x${string}`
  callbackSelector: `0x${string}`
  depositAmount: bigint
}

export interface AgentInvocationResult {
  requestId: `0x${string}`
  txHash: `0x${string}`
  blockNumber: bigint
}

// ─── Sentinel Agent ───────────────────────────────────────────────────────────

export interface SentinelInput {
  targetContract: `0x${string}`
  eventTopic: `0x${string}`
  rawEventData: `0x${string}`
  chainId: number
}

export interface SentinelResult {
  knownAttacker: boolean
  cveMatches: string[]
  attackerRepScore: number    // 0-100
  similarExploits: string[]   // URLs
  mevBotDetected: boolean
  flashLoanOrigin: boolean
  threatContext: string       // max 500 chars
}

// ─── Analyst Agent ────────────────────────────────────────────────────────────

export type AttackVector =
  | 'REENTRANCY'
  | 'FLASH_LOAN'
  | 'ORACLE_MANIPULATION'
  | 'FRONT_RUNNING'
  | 'ACCESS_CONTROL'
  | 'INTEGER_OVERFLOW'
  | 'SANDWICH_ATTACK'
  | 'GOVERNANCE_ATTACK'
  | 'UNKNOWN'

export type RecommendedAction =
  | 'NO_ACTION'
  | 'SOFT_LOCK'
  | 'RATE_LIMIT'
  | 'PAUSE'
  | 'HARD_PAUSE'

export interface AnalystInput {
  sentinelResult: SentinelResult
  targetContract: `0x${string}`
  eventTopic: `0x${string}`
  rawEventData: `0x${string}`
  blockNumber: bigint
}

export interface AnalystResult {
  severity: number              // 0-100
  confidence: number            // 0.00-1.00
  attackVector: AttackVector
  immediateRisk: boolean
  rationale: string             // max 200 chars
  recommendedAction: RecommendedAction
}

// ─── Responder Agent ──────────────────────────────────────────────────────────

export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL' | 'CATASTROPHIC'

export interface ResponderInput {
  analystResult: AnalystResult
  currentCircuitBreakerState: string
  recentIncidents: number       // count in last 10 blocks
  tvlAtRisk: bigint
}

export interface ResponderResult {
  finalAction: RecommendedAction
  escalateToGovernance: boolean
  coordinatedAttack: boolean
  alertLevel: AlertLevel
  humanResponseRequired: boolean
  additionalContracts: `0x${string}`[]
  rationale: string             // max 300 chars
}

// ─── Archivist Agent ──────────────────────────────────────────────────────────

export interface ExploitReport {
  protocolName: string
  attackVector: AttackVector
  amountStolen: string          // USD string
  vulnerabilityType: string
  contractAddresses: `0x${string}`[]
  sourceUrl: string
  severity: number              // 0-100 estimated
  description: string
}

// ─── Alert / Incident ─────────────────────────────────────────────────────────

export interface SecurityIncident {
  incidentId: number
  targetContract: `0x${string}`
  alertLevel: AlertLevel
  severity: number
  attackVector: AttackVector
  actionTaken: string
  blockNumber: bigint
  timestamp: number
  txHash: `0x${string}`
  agentReceiptHash: `0x${string}`
}

// ─── Swarm Status ─────────────────────────────────────────────────────────────

export interface SwarmAgentStatus {
  agentType: 'SENTINEL' | 'ANALYST' | 'RESPONDER' | 'ARCHIVIST' | 'MESSENGER'
  isActive: boolean
  lastInvocation: number        // timestamp
  totalInvocations: number
  successRate: number           // 0-1
  estimatedCostToday: number    // STT
}

export interface SwarmStatus {
  agents: SwarmAgentStatus[]
  totalProtectedContracts: number
  incidentsToday: number
  incidentsThisWeek: number
  lastArchivistScan: number
  treasuryBalance: bigint
}
