import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../src/core/EventBus.js';
import { SharedMemory } from '../src/core/SharedMemory.js';
import { initializeSwarm } from '../src/index.js';

describe('Full Swarm Pipeline', () => {
  beforeEach(() => {
    SharedMemory.getInstance().clear();
    // Re-initialize swarm to ensure fresh listeners if needed
    // (In reality, EventBus listeners persist, so we just clear memory)
  });

  it('should successfully route a malicious flash-loan event to a HARD_PAUSE', async () => {
    initializeSwarm();

    const bus = EventBus.getInstance();
    const incidentId = `test-incident-${Date.now()}`;

    // We will listen for the final event to know the chain is complete
    const defensePromise = new Promise<void>((resolve) => {
      bus.subscribe('DEFENSE_EXECUTED', (payload) => {
        if (payload.incidentId === incidentId) resolve();
      });
    });

    // Fire the initial trigger
    bus.publish('NEW_ONCHAIN_EVENT', {
      incidentId,
      timestamp: Date.now(),
      targetContract: '0xTestVictim',
      rawEventData: 'mock-flash-loan exploit attempt'
    });

    // Wait for the full async agent chain to execute
    await defensePromise;

    // Verify final state in Shared Memory
    const context = SharedMemory.getInstance().getIncident(incidentId);

    expect(context).toBeDefined();
    expect(context?.initialThreatDetected).toBe(true);
    expect(context?.attackVector).toBe('FLASH_LOAN_ATTACK');
    expect(context?.severity).toBeGreaterThanOrEqual(80); // Should be a critical threat
    expect(context?.consensusReached).toBe(true);
    expect(context?.defenseActionTaken).toBe('HARD_PAUSE');
    expect(context?.defenseTxHash).toContain('0x_mock_defense_tx_');
  });

  it('should filter out non-malicious events early', async () => {
    const bus = EventBus.getInstance();
    const incidentId = `safe-incident-${Date.now()}`;

    let threatDetectedFired = false;
    bus.subscribe('THREAT_DETECTED', (payload) => {
      if (payload.incidentId === incidentId) threatDetectedFired = true;
    });

    // Fire a safe trigger
    bus.publish('NEW_ONCHAIN_EVENT', {
      incidentId,
      timestamp: Date.now(),
      targetContract: '0xTestSafe',
      rawEventData: 'normal transfer'
    });

    // Wait briefly to ensure no sync processing occurred
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(threatDetectedFired).toBe(false);
    expect(SharedMemory.getInstance().getIncident(incidentId)).toBeUndefined();
  });
});
