import { EventBus, SwarmEvent, EventPayload } from './EventBus.js';
import { SharedMemory } from './SharedMemory.js';
import { Tool } from './Tool.js';

export abstract class BaseAgent {
  abstract name: string;
  abstract responsibilities: string;
  protected tools: Tool[] = [];
  protected eventBus = EventBus.getInstance();
  protected memory = SharedMemory.getInstance();

  /**
   * Initialize subscriptions for the events this agent cares about.
   */
  public abstract initialize(): void;

  /**
   * The core decision logic triggered by an event.
   */
  protected abstract decide(payload: EventPayload): Promise<void>;

  /**
   * Helper to publish events after a decision.
   */
  protected publish(event: SwarmEvent, payload: EventPayload) {
    this.eventBus.publish(event, payload);
  }

  /**
   * Execute a specific tool by name.
   */
  protected async executeTool(toolName: string, context: any): Promise<any> {
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found on agent ${this.name}`);
    }
    return tool.execute(context);
  }
}
