import { Request, Response, Router } from 'express'
import selfRouter from './selfRouter'
import healthRouter from './healthRouter'
import config from '../config/config'
import { EApplicationEnvironment } from '../constant/application'
import httpResponse from '../util/httpResponse'
const router = Router()

const defaultRoutes = [
    {
        path: '/self',
        router: selfRouter
    },
    {
        path: '/health',
        router: healthRouter
    }
]

defaultRoutes.forEach((route) => {
    router.use(route.path, route.router)
})

// Test server
if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
    router.get('/test-server', (_: Request, res: Response) => {
        httpResponse(_, res, 200, 'API is working')
    })
}
export default router

