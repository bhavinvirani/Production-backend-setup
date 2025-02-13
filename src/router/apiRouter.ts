import { Router } from 'express'
import selfRouter from './selfRouter'
import healthRouter from './healthRouter'
const router = Router()


router.use('/self', selfRouter)
router.use('/health', healthRouter)



export default router
