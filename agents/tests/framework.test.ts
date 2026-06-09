import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../src/core/EventBus.js';
import { SharedMemory } from '../src/core/SharedMemory.js';

describe('Core Framework', () => {
  beforeEach(() => {
    SharedMemory.getInstance().clear();
  });

  it('EventBus should publish and subscribe correctly', () => {
    const bus = EventBus.getInstance();
    let receivedPayload: any = null;

    bus.subscribe('NEW_ONCHAIN_EVENT', (payload) => {
      receivedPayload = payload;
    });

    bus.publish('NEW_ONCHAIN_EVENT', { incidentId: '123', timestamp: 1000 });

    expect(receivedPayload).toBeDefined();
    expect(receivedPayload.incidentId).toBe('123');
  });

  it('SharedMemory should isolate incident contexts', () => {
    const memory = SharedMemory.getInstance();
    
    memory.initializeIncident('inc-1', { targetContract: '0xA' });
    memory.initializeIncident('inc-2', { targetContract: '0xB' });

    memory.updateIncident('inc-1', { severity: 95 });

    const inc1 = memory.getIncident('inc-1');
    const inc2 = memory.getIncident('inc-2');

    expect(inc1?.targetContract).toBe('0xA');
    expect(inc1?.severity).toBe(95);

    expect(inc2?.targetContract).toBe('0xB');
    expect(inc2?.severity).toBeUndefined();
  });
});
