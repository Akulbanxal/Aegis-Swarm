import { SentinelAgent } from './swarm/SentinelAgent.js';
import { InvestigationAgent } from './swarm/InvestigationAgent.js';
import { ThreatAnalysisAgent } from './swarm/ThreatAnalysisAgent.js';
import { ConsensusAgent } from './swarm/ConsensusAgent.js';
import { ResponseAgent } from './swarm/ResponseAgent.js';
import { ReportingAgent } from './swarm/ReportingAgent.js';
import { RecoveryAgent } from './swarm/RecoveryAgent.js';

export function initializeSwarm() {
  const sentinel = new SentinelAgent();
  const investigator = new InvestigationAgent();
  const analyst = new ThreatAnalysisAgent();
  const consensus = new ConsensusAgent();
  const responder = new ResponseAgent();
  const reporter = new ReportingAgent();
  const recovery = new RecoveryAgent();

  sentinel.initialize();
  investigator.initialize();
  analyst.initialize();
  consensus.initialize();
  responder.initialize();
  reporter.initialize();
  recovery.initialize();

  console.log('[Swarm] All 7 agents initialized and listening to EventBus.');
}

export * from './core/EventBus.js';
export * from './core/SharedMemory.js';
