import { createPublicClient, http, parseAbiItem } from 'viem';
import { localhost } from 'viem/chains';
import { agentManager } from '../server.js';

export class IndexerService {
  private publicClient = createPublicClient({
    chain: localhost,
    transport: http('http://127.0.0.1:8545')
  });

  public async startWatching() {
    console.log('[Indexer] Connected to Anvil. Watching for ThreatTriggered events...');
    
    this.publicClient.watchEvent({
      event: parseAbiItem('event ThreatTriggered(address indexed user, uint256 amount)'),
      onLogs: logs => {
        for (const log of logs) {
          const targetContract = log.address;
          console.log(`[Indexer] 🚨 Anomaly detected on ${targetContract} in tx ${log.transactionHash}`);
          
          // Trigger the agent swarm!
          agentManager.triggerSimulatedEvent(targetContract, `ThreatTriggered Event Emitted. User: ${log.args.user}, Amount: ${log.args.amount}, Hash: ${log.transactionHash}`);
        }
      }
    });
  }
}
