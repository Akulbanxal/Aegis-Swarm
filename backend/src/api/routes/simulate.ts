import { Router } from 'express';
import { agentManager } from '../../server.js';

export const simulateRoutes = Router();

simulateRoutes.post('/attack', (req, res) => {
  const { targetContract, payload } = req.body;
  
  if (!targetContract) {
    return res.status(400).json({ error: 'targetContract is required' });
  }

  const simulatedPayload = payload || 'mock-flash-loan exploit attempt from 0xAttacker';
  
  const incidentId = agentManager.triggerSimulatedEvent(targetContract, simulatedPayload);

  res.json({ 
    message: 'Simulated attack injected into EventBus', 
    incidentId 
  });
});
