export interface IncidentContext {
  incidentId: string;
  targetContract?: string;
  eventTopic?: string;
  rawEventData?: string;
  blockNumber?: bigint;
  txHash?: string;
  timestamp?: number;
  
  // Sentinel
  initialThreatDetected?: boolean;
  
  // Investigation
  txTrace?: any;
  attackerHistory?: any;
  knownSignatures?: any[];
  
  // Analysis
  attackVector?: string;
  severity?: number;
  confidence?: number;
  immediateRisk?: boolean;
  
  // Consensus
  consensusReached?: boolean;
  consensusRationale?: string;
  
  // Response
  defenseActionTaken?: string;
  defenseTxHash?: string;
  
  // Recovery
  recoveryProposed?: boolean;
  recoveryAction?: string;
  recoveryRationale?: string;
  isRecovered?: boolean;
}

export class SharedMemory {
  private static instance: SharedMemory;
  private memory: Map<string, IncidentContext>;

  private constructor() {
    this.memory = new Map();
  }

  public static getInstance(): SharedMemory {
    if (!SharedMemory.instance) {
      SharedMemory.instance = new SharedMemory();
    }
    return SharedMemory.instance;
  }

  public initializeIncident(incidentId: string, initialData: Partial<IncidentContext>) {
    this.memory.set(incidentId, { incidentId, ...initialData });
  }

  public updateIncident(incidentId: string, update: Partial<IncidentContext>) {
    const existing = this.memory.get(incidentId) || { incidentId };
    this.memory.set(incidentId, { ...existing, ...update });
  }

  public getIncident(incidentId: string): IncidentContext | undefined {
    return this.memory.get(incidentId);
  }

  public getAllIncidents(): IncidentContext[] {
    return Array.from(this.memory.values());
  }
  
  public clear() {
    this.memory.clear();
  }
}
