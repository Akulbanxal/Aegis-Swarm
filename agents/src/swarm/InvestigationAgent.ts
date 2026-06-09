import { BaseAgent } from '../core/BaseAgent.js';
import { EventPayload } from '../core/EventBus.js';
import { FetchTxTraceTool } from '../tools/FetchTxTraceTool.js';
import { QueryThreatRegistryTool } from '../tools/QueryThreatRegistryTool.js';

export class InvestigationAgent extends BaseAgent {
  name = 'InvestigationAgent';
  responsibilities = 'Gathers contextual transaction data and queries threat registries.';

  constructor() {
    super();
    this.tools = [new FetchTxTraceTool(), new QueryThreatRegistryTool()];
  }

  public initialize(): void {
    this.eventBus.subscribe('THREAT_DETECTED', this.decide.bind(this));
  }

  protected async decide(payload: EventPayload): Promise<void> {
    const { incidentId } = payload;
    const context = this.memory.getIncident(incidentId);
    
    if (!context) return;

    console.log(`[InvestigationAgent] Gathering context for incident ${incidentId}...`);

    // 1. Fetch TX Trace
    const txTrace = await this.executeTool('FetchTxTraceTool', { ...context });
    
    // 2. Query Threat Registry based on trace data
    const threatData = await this.executeTool('QueryThreatRegistryTool', { ...context, txTrace });

    // Update shared memory
    this.memory.updateIncident(incidentId, {
      txTrace,
      attackerHistory: threatData.reputationScore,
      knownSignatures: threatData.cveMatches
    });

    console.log(`[InvestigationAgent] Context gathered.`);
    this.publish('CONTEXT_GATHERED', { incidentId, timestamp: Date.now() });
  }
}
