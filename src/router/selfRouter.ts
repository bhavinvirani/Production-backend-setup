import { Router } from 'express'
import selfController from '../controller/selfController'

const router = Router()

// self with rate limiter
// router.get('/', rateLimiter, selfController.self) 


// /self 
router.get('/', selfController.self) 

export default router
