import { Router } from 'express'
import selfController from '../controller/selfController'
// import rateLimiter from '../middleware/rateLimiter'

const router = Router()

// self with rate limiter
// router.use(rateLimiter)
// router.get('/', rateLimiter, selfController.self) 


// /self 
router.get('/', selfController.self) 

export default router
