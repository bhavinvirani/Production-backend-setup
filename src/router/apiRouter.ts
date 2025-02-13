import { Router } from 'express'
import selfRouter from './selfRouter'

const router = Router()


router.use('/self', selfRouter)

export default router
