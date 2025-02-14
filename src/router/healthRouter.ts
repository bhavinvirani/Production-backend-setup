import { Router } from 'express'
import healthController from '../controller/healthController'

const router = Router()

//  rate limiter
// router.use(rateLimiter)
// router.get('/', rateLimiter, healthController.healthCheck) 

// Health check
router.get('/', healthController.healthCheck) 

export default router
