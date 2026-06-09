import { BaseAgent } from '../core/BaseAgent.js';
import { EventPayload } from '../core/EventBus.js';

export class SentinelAgent extends BaseAgent {
  name = 'SentinelAgent';
  responsibilities = 'Monitors the blockchain for raw events and initializes incident tracking for anomalous activities.';

  public initialize(): void {
    this.eventBus.subscribe('NEW_ONCHAIN_EVENT', this.decide.bind(this));
  }

  protected async decide(payload: EventPayload): Promise<void> {
    const { incidentId, rawEventData, targetContract } = payload;
    
    console.log(`[SentinelAgent] Analyzing raw event for ${targetContract}`);

    // Heuristics filter: we assume any event containing 'flash-loan' or 'exploit' is suspicious
    const isSuspicious = rawEventData?.includes('flash-loan') || rawEventData?.includes('exploit');

    if (isSuspicious) {
      console.log(`[SentinelAgent] 🚨 Suspicious activity detected. Initializing Incident ${incidentId}.`);
      
      this.memory.initializeIncident(incidentId, {
        targetContract,
        rawEventData,
        initialThreatDetected: true,
        timestamp: payload.timestamp
      });

      this.publish('THREAT_DETECTED', { incidentId, timestamp: Date.now() });
    } else {
      console.log(`[SentinelAgent] Event ${incidentId} looks benign. Discarding.`);
    }
  }
}
