import { EventEmitter } from 'events'

export type SwarmEvent = 
  | 'NEW_ONCHAIN_EVENT'
  | 'THREAT_DETECTED'
  | 'CONTEXT_GATHERED'
  | 'ANALYSIS_COMPLETE'
  | 'CONSENSUS_REACHED'
  | 'CONSENSUS_REJECTED'
  | 'RESPONSE_EXECUTED'
  | 'RECOVERY_PROPOSED';

export interface EventPayload {
  incidentId: string;
  timestamp: number;
  [key: string]: any;
}

export class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public publish(event: SwarmEvent, payload: EventPayload) {
    this.emit(event, payload);
  }

  public subscribe(event: SwarmEvent, listener: (payload: EventPayload) => void) {
    this.on(event, listener);
  }
}
