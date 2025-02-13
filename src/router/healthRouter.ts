import { Router } from 'express'
import healthController from '../controller/healthController'

const router = Router()

// /self 
router.get('/', healthController.healthCheck) 

export default router
