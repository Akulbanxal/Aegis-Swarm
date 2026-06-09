import { Router } from 'express'

export const apiRouter = Router()

apiRouter.get('/', (req, res) => {
  res.json({ message: 'Aegis Swarm REST API is active.' })
})
