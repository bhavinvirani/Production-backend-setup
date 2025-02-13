import { Router } from 'express'
import selfController from '../controller/selfController'

const router = Router()

// /self 
router.get('/', selfController.self) 

export default router
