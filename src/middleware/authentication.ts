import { NextFunction, Request, Response } from 'express'
import { IUser } from '../types/userTypes'
import quicker from '../util/quicker'
import config from '../config/config'
import { IDecryptedJwt } from '../types/userTypes'
import httpError from '../util/httpError'
import responseMessage from '../constant/responseMessage'
import userService from '../service/userService'

interface IAuthenticatedRequest extends Request {
    authenticatedUser: IUser
}

export default async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const { cookies } = req as IAuthenticatedRequest

        const { accessToken } = cookies as {
            accessToken: string | undefined
        }

        if (accessToken) {
            // Verify Token
            const { userId } = quicker.verifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

            // Find User by id
            const user = await userService.findUserById(userId)
            if (user) {
                (req as IAuthenticatedRequest).authenticatedUser = user
                return next()
            }
        }

        httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
    } catch (err) {
        httpError(next, err, req, 500)
    }
}

