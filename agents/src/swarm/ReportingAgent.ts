import { BaseAgent } from '../core/BaseAgent.js';
import { EventPayload } from '../core/EventBus.js';
import { DiscordWebhookTool } from '../tools/DiscordWebhookTool.js';

export class ReportingAgent extends BaseAgent {
  name = 'ReportingAgent';
  responsibilities = 'Dispatches incident summaries to external stakeholders (Discord/DB).';

  constructor() {
    super();
    this.tools = [new DiscordWebhookTool()];
  }

  public initialize(): void {
    this.eventBus.subscribe('RESPONSE_EXECUTED', this.decide.bind(this));
    this.eventBus.subscribe('CONSENSUS_REJECTED', this.decide.bind(this));
  }

  protected async decide(payload: EventPayload): Promise<void> {
    const { incidentId } = payload;
    const context = this.memory.getIncident(incidentId);
    if (!context) return;

    console.log(`[ReportingAgent] Generating report for ${incidentId}...`);

    await this.executeTool('DiscordWebhookTool', { ...context });

    console.log(`[ReportingAgent] Incident ${incidentId} resolved and reported.`);
  }
}
