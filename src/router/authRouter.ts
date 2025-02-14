import { Router } from 'express'
import authController from '../controller/authController'
import authentication from '../middleware/authentication'
import rateLimiter from '../middleware/rateLimiter'
// import rateLimiter from '../middleware/rateLimiter'

const router = Router()

router.post('/register', rateLimiter, authController.register)
router.put('/verify/:token', rateLimiter, authController.verifyAccount)
router.post('/login', rateLimiter, authController.login)
router.get('/self-identification', authentication, authController.selfIdentification)
router.put('/logout', authentication, authController.logout)
router.post('/refresh-token', authentication, authController.refreshToken)
router.put('/forgot-password', rateLimiter, authController.forgotPassword)
router.put('/reset-password/:token', rateLimiter, authController.resetPassword)
router.put('/change-password', authentication, authController.changePassword)

export default router
