import { Router } from 'express';
import { prisma } from '../../server.js';

export const protocolRoutes = Router();

protocolRoutes.get('/', async (req, res) => {
  try {
    const protocols = await prisma.protocol.findMany({
      include: {
        incidents: {
          select: { id: true, severity: true, timestamp: true }
        }
      }
    });
    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch protocols' });
  }
});
