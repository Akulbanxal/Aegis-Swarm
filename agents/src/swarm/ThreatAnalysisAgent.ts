import { BaseAgent } from '../core/BaseAgent.js';
import { EventPayload } from '../core/EventBus.js';

export class ThreatAnalysisAgent extends BaseAgent {
  name = 'ThreatAnalysisAgent';
  responsibilities = 'Determines attack vector and severity from gathered context.';

  public initialize(): void {
    this.eventBus.subscribe('CONTEXT_GATHERED', this.decide.bind(this));
  }

  protected async decide(payload: EventPayload): Promise<void> {
    const { incidentId } = payload;
    const context = this.memory.getIncident(incidentId);
    if (!context) return;

    console.log(`[ThreatAnalysisAgent] Analyzing context for incident ${incidentId}...`);

    let severity = 10;
    let attackVector = 'UNKNOWN';
    let confidence = 0.5;

    // Simulated deterministic logic
    if (context.txTrace?.anomaliesDetected) {
      severity += 40;
      attackVector = 'FLASH_LOAN_ATTACK';
      confidence += 0.2;
    }

    if (context.knownSignatures && context.knownSignatures.length > 0) {
      severity += 45;
      confidence = 0.95;
    }

    // Cap at 100
    severity = Math.min(severity, 100);

    this.memory.updateIncident(incidentId, {
      severity,
      attackVector,
      confidence,
      immediateRisk: severity >= 80
    });

    console.log(`[ThreatAnalysisAgent] Analysis complete. Severity: ${severity}, Vector: ${attackVector}`);
    this.publish('ANALYSIS_COMPLETE', { incidentId, timestamp: Date.now() });
  }
}
