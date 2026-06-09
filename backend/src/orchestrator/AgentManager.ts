import { EventBus, SharedMemory, initializeSwarm, SwarmEvent, EventPayload } from '@aegis-swarm/agents';
import { WebSocketServer } from '../ws/WebSocketServer.js';
import { PrismaClient } from '@prisma/client';

export class AgentManager {
  private eventBus = EventBus.getInstance();
  private memory = SharedMemory.getInstance();
  private prisma = new PrismaClient();
  private ws: WebSocketServer;

  constructor(ws: WebSocketServer) {
    this.ws = ws;
  }

  public initialize() {
    console.log('[Orchestrator] Initializing Aegis Swarm Agents...');
    initializeSwarm();

    // Hook WebSockets and Database to EventBus
    this.setupListeners();
  }

  private setupListeners() {
    // 1. Broadcast all events to the frontend via WebSockets
    const events: SwarmEvent[] = [
      'NEW_ONCHAIN_EVENT',
      'THREAT_DETECTED',
      'CONTEXT_GATHERED',
      'ANALYSIS_COMPLETE',
      'CONSENSUS_REACHED',
      'CONSENSUS_REJECTED',
      'RESPONSE_EXECUTED',
      'RECOVERY_PROPOSED'
    ];

    events.forEach(event => {
      this.eventBus.subscribe(event, (payload: EventPayload) => {
        // Forward to WebSocket
        this.ws.broadcast('SWARM_EVENT', { event, payload });
      });
    });

    // 2. Persist threat data when Sentinel detects it
    this.eventBus.subscribe('THREAT_DETECTED', async (payload: EventPayload) => {
      const context = this.memory.getIncident(payload.incidentId);
      if (!context) return;

      // Upsert Protocol
      const protocol = await this.prisma.protocol.upsert({
        where: { address: context.targetContract || 'Unknown' },
        update: {},
        create: { address: context.targetContract || 'Unknown', name: 'Unknown Protocol' }
      });

      // Create Incident
      await this.prisma.incident.create({
        data: {
          id: payload.incidentId,
          protocolId: protocol.id,
          targetContract: context.targetContract || 'Unknown',
          timestamp: new Date(payload.timestamp)
        }
      });
      
      this.ws.broadcast('ALERT', { message: `Threat detected on ${context.targetContract}`, severity: 50 });
    });

    // 3. Update DB when Response Executed
    this.eventBus.subscribe('RESPONSE_EXECUTED', async (payload: EventPayload) => {
      const context = this.memory.getIncident(payload.incidentId);
      if (!context) return;

      await this.prisma.incident.update({
        where: { id: payload.incidentId },
        data: {
          severity: context.severity ?? 0,
          attackVector: context.attackVector ?? 'UNKNOWN',
          defenseActionTaken: context.defenseActionTaken ?? 'NO_ACTION',
          defenseTxHash: context.defenseTxHash || null,
          status: 'RESOLVED'
        }
      });

      this.ws.broadcast('ALERT', { message: `Defense executed: ${context.defenseActionTaken}`, severity: context.severity ?? 0 });
    });
  }

  /**
   * Simulate an incoming on-chain event (Used by the `/simulate` API)
   */
  public triggerSimulatedEvent(targetContract: string, rawEventData: string) {
    const incidentId = `sim-${Date.now()}`;
    this.eventBus.publish('NEW_ONCHAIN_EVENT', {
      incidentId,
      timestamp: Date.now(),
      targetContract,
      rawEventData
    });
    return incidentId;
  }

  public getIncidentState(incidentId: string) {
    return this.memory.getIncident(incidentId);
  }

  public async approveRecovery(incidentId: string) {
    const context = this.memory.getIncident(incidentId);
    if (!context) throw new Error('Incident not found in memory');
    if (!context.recoveryProposed) throw new Error('Recovery not proposed for this incident');

    // In a real system, this would broadcast the UNPAUSE transaction to Anvil via viem
    console.log(`[Orchestrator] Admin approved recovery for ${incidentId}. Executing ${context.recoveryAction}...`);
    
    this.memory.updateIncident(incidentId, {
      isRecovered: true
    });

    await this.prisma.incident.update({
      where: { id: incidentId },
      data: { status: 'RECOVERED' }
    });

    this.ws.broadcast('ALERT', { message: `Protocol ${context.targetContract} recovered by Admin via Multi-Sig.`, severity: 10 });
    
    return this.memory.getIncident(incidentId);
  }
}
