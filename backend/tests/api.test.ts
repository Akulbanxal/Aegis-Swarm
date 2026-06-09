import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, prisma, startServer } from '../src/server.js';
import { EventBus } from '@aegis-swarm/agents';

describe('Backend API & Orchestration', () => {
  beforeAll(async () => {
    // Clear DB for tests
    await prisma.incident.deleteMany();
    await prisma.protocol.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/simulate injects threat and populates DB', async () => {
    // Initialize agents
    import('../src/server.js').then(m => m.agentManager.initialize());

    const res = await request(app)
      .post('/api/simulate/attack')
      .send({
        targetContract: '0xTestBackendSim',
        payload: 'mock-flash-loan exploit attempt'
      });

    expect(res.status).toBe(200);
    expect(res.body.incidentId).toBeDefined();

    const incidentId = res.body.incidentId;

    // Wait for the asynchronous agent chain to execute and write to DB
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify DB
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: { protocol: true }
    });

    expect(incident).toBeDefined();
    expect(incident?.protocol.address).toBe('0xTestBackendSim');
    expect(incident?.severity).toBeGreaterThanOrEqual(80);
    expect(incident?.defenseActionTaken).toBe('HARD_PAUSE');
  });

  it('GET /api/incidents returns list of incidents', async () => {
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].targetContract).toBe('0xTestBackendSim');
  });

  it('GET /api/protocols returns registered protocols', async () => {
    const res = await request(app).get('/api/protocols');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].address).toBe('0xTestBackendSim');
  });
});
