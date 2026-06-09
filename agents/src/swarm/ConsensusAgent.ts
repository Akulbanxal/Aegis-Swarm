import { BaseAgent } from '../core/BaseAgent.js';
import { EventPayload } from '../core/EventBus.js';

export class ConsensusAgent extends BaseAgent {
  name = 'ConsensusAgent';
  responsibilities = 'Verifies threat analysis confidence against governance baselines.';

  public initialize(): void {
    this.eventBus.subscribe('ANALYSIS_COMPLETE', this.decide.bind(this));
  }

  protected async decide(payload: EventPayload): Promise<void> {
    const { incidentId } = payload;
    const context = this.memory.getIncident(incidentId);
    if (!context) return;

    console.log(`[ConsensusAgent] Validating analysis for ${incidentId}...`);

    // Logic: Requires high confidence for severe actions
    const isSevere = (context.severity ?? 0) >= 80;
    const highConfidence = (context.confidence ?? 0) >= 0.90;

    if (isSevere && !highConfidence) {
      console.log(`[ConsensusAgent] ❌ Rejected. Severe action requested without high confidence.`);
      this.memory.updateIncident(incidentId, {
        consensusReached: false,
        consensusRationale: 'High severity requires >90% confidence.'
      });
      this.publish('CONSENSUS_REJECTED', { incidentId, timestamp: Date.now() });
      return;
    }

    console.log(`[ConsensusAgent] ✅ Approved.`);
    this.memory.updateIncident(incidentId, {
      consensusReached: true,
      consensusRationale: 'Confidence thresholds met.'
    });
    this.publish('CONSENSUS_REACHED', { incidentId, timestamp: Date.now() });
  }
}
