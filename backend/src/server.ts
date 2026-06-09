import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from './ws/WebSocketServer.js';
import { AgentManager } from './orchestrator/AgentManager.js';
import { IndexerService } from './blockchain/IndexerService.js';
import { PrismaClient } from '@prisma/client';

export const app = express();
export const prisma = new PrismaClient();
const server = createServer(app);

// Init WS and Orchestrator
export const wsServer = new WebSocketServer(server);
export const agentManager = new AgentManager(wsServer);

app.use(cors());
app.use(express.json());

// Routes
import { incidentRoutes } from './api/routes/incidents.js';
import { protocolRoutes } from './api/routes/protocols.js';
import { simulateRoutes } from './api/routes/simulate.js';

app.use('/api/incidents', incidentRoutes);
app.use('/api/protocols', protocolRoutes);
app.use('/api/simulate', simulateRoutes);

app.post('/api/incidents/:id/recover', async (req, res) => {
  const incidentId = req.params.id;
  try {
    const updated = await agentManager.approveRecovery(incidentId);
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Aegis Swarm Backend' });
});

export function startServer(port: number) {
  agentManager.initialize();
  const indexer = new IndexerService();
  indexer.startWatching();
  
  server.listen(port, '0.0.0.0', () => {
    console.log(`[Server] Aegis Swarm Backend running on port ${port}`);
  });
}

// Automatically start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  startServer(port);
}
