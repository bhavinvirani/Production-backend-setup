import { NextFunction, Request, Response, Router } from 'express'
import healthRouter from './healthRouter'
import authRouter from './authRouter'
import config from '../config/config'
import { EApplicationEnvironment } from '../constant/application'
import httpResponse from '../util/httpResponse'
import responseMessage from '../constant/responseMessage'
import httpError from '../util/httpError'
const router = Router()

const defaultRoutes = [
    {
        path: '/health',
        router: healthRouter
    },
    {
        path: '/auth',
        router: authRouter
    }
]

defaultRoutes.forEach((route) => {
    router.use(route.path, route.router)
})

// Test server
if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
    router.get('/test-server', (req: Request, res: Response, next: NextFunction) => {
        try {
            httpResponse(req, res, 200, responseMessage.TEST)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    })
}
export default router

