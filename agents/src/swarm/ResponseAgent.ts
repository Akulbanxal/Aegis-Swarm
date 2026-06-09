import { BaseAgent } from '../core/BaseAgent.js';
import { EventPayload } from '../core/EventBus.js';
import { ExecuteTxTool } from '../tools/ExecuteTxTool.js';

export class ResponseAgent extends BaseAgent {
  name = 'ResponseAgent';
  responsibilities = 'Executes on-chain defensive maneuvers based on consensus.';

  constructor() {
    super();
    this.tools = [new ExecuteTxTool()];
  }

  public initialize(): void {
    this.eventBus.subscribe('CONSENSUS_REACHED', this.decide.bind(this));
  }

  protected async decide(payload: EventPayload): Promise<void> {
    const { incidentId } = payload;
    const context = this.memory.getIncident(incidentId);
    if (!context) return;

    console.log(`[ResponseAgent] Formulating response for ${incidentId}...`);

    let action = 'NO_ACTION';
    if ((context.severity ?? 0) >= 80) {
      action = 'HARD_PAUSE';
    } else if ((context.severity ?? 0) >= 40) {
      action = 'MAINTAIN_SOFT_LOCK';
    } else {
      action = 'LIFT_SOFT_LOCK';
    }

    console.log(`[ResponseAgent] Chosen action: ${action}. Executing...`);

    const result = await this.executeTool('ExecuteTxTool', {
      incidentId,
      targetContract: context.targetContract,
      defenseActionTaken: action
    });

    this.memory.updateIncident(incidentId, {
      defenseActionTaken: action,
      defenseTxHash: result.txHash
    });

    this.publish('RESPONSE_EXECUTED', { incidentId, timestamp: Date.now() });
  }
}
