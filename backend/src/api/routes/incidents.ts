import { Router } from 'express';
import { prisma, agentManager } from '../../server.js';

export const incidentRoutes = Router();

incidentRoutes.get('/', async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { timestamp: 'desc' },
      include: { protocol: true }
    });
    
    // Merge SQLite incidents with in-memory agent states if available
    const mergedIncidents = incidents.map(inc => {
      const memoryState = agentManager.getIncidentState(inc.id);
      return { ...inc, ...memoryState };
    });

    res.json(mergedIncidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

incidentRoutes.get('/:id', async (req, res) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: { protocol: true }
    });
    if (!incident) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Merge database record with in-memory agent context state
    const memoryState = agentManager.getIncidentState(req.params.id);
    res.json({ ...incident, ...memoryState });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});
