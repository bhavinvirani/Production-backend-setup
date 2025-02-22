import { NextFunction, Request, Response } from 'express'
import httpResponse from '../util/httpResponse'
import responseMessage from '../constant/responseMessage'
import httpError from '../util/httpError'
import {
    IChangePasswordRequestBody,
    IForgotPasswordRequestBody,
    ILoginUserRequestBody,
    IRegisterRequestBody,
    IResetPasswordRequestBody
} from '../types/authTypes'
import {
    ValidateChangePasswordBody,
    ValidateForgotPasswordBody,
    validateJoiSchema,
    validateLoginBody,
    validateRegisterBody,
    ValidateResetPasswordBody
} from '../service/validationService'
import quicker from '../util/quicker'
import userService from '../service/userService'
import { IDecryptedJwt, IRefreshToken, IUser, IUserWithId } from '../types/userTypes'
import { EUserRoles } from '../constant/userConstants'
import config from '../config/config'
import emailService from '../service/emailService'
import logger from '../util/logger'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { EApplicationEnvironment } from '../constant/application'

dayjs.extend(utc)

interface IRegisterRequest extends Request {
    body: IRegisterRequestBody
}

interface IConfirmRequest extends Request {
    params: {
        token: string
    }
    query: {
        code: string
    }
}

interface ILoginRequest extends Request {
    body: ILoginUserRequestBody
}

interface ISelfIdentificationRequest extends Request {
    authenticatedUser: IUser
}

interface IForgotPasswordRequest extends Request {
    body: IForgotPasswordRequestBody
}

interface IResetPasswordRequest extends Request {
    params: {
        token: string
    }
    body: IResetPasswordRequestBody
}

interface IChangePasswordRequest extends Request {
    authenticatedUser: IUserWithId
    body: IChangePasswordRequestBody
}

export default {
    register: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { body } = req as IRegisterRequest
            const { error, value } = validateJoiSchema<IRegisterRequestBody>(validateRegisterBody, body)
            if (error) {
                return httpError(next, error, req, 422)
            }

            // Phone number parsing
            const { phoneNumber, email, password, name, consent } = value
            const { countryCode, isoCode, internationalNumber } = quicker.parsePhoneNumber('+' + phoneNumber)
            if (!countryCode || !isoCode || !internationalNumber) {
                return httpError(next, new Error(responseMessage.INVALID_PHONE_NUMBER), req, 422)
            }

            // Timezone
            const timezone = quicker.countryTimezone(isoCode)
            if (!timezone || timezone.length === 0) {
                return httpError(next, new Error(responseMessage.INVALID_PHONE_NUMBER), req, 422)
            }

            // User check
            const user = await userService.findUserByEmail(email)
            if (user) {
                return httpError(next, new Error(responseMessage.ALREADY_EXISTS('user', email)), req, 409)
            }

            // Password hashing
            const hashedPassword = await quicker.hashPassword(password)

            // Account verification (object)
            const token = quicker.generateRandomId()
            const code = quicker.generateOtp(6)

            // User creation
            const payload: IUser = {
                name,
                email,
                phoneNumber: {
                    isoCode,
                    countryCode: Number(countryCode),
                    internationalNumber
                },
                accountVerification: {
                    status: false,
                    token,
                    code,
                    timestamp: null
                },
                passwordReset: {
                    token: null,
                    expiry: null,
                    lastResetAt: null
                },
                lastLoginAt: null,
                role: EUserRoles.USER,
                timezone: timezone[0].name,
                password: hashedPassword,
                consent
            }
            const newUser = await userService.registerUser(payload)

            // Email sending
            const confirmationUrl = `${config.FRONTEND_URL}/verify/${token}?code=${code}`
            const to = [email]
            const subject = 'Confirm Your Account'
            const text = `Hey ${name}, Please confirm your account by clicking on the link given below.\n\n${confirmationUrl}`

            await emailService.sendEmail(to, subject, text).catch((err) => {
                logger.error('EMAIL_SERVICE', {
                     
                    meta: err as Error
                })
            })
            // Response
            httpResponse(req, res, 201, responseMessage.SUCCESS, {
                _id: newUser._id
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    verifyAccount: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // TODO:
            // fetch user by token and code
            const { params, query } = req as IConfirmRequest
            const { token } = params
            const { code } = query

            const user = await userService.findUserByVerificationTokenAndCode(token, code)
            if (!user) {
                return httpError(next, new Error(responseMessage.INVALID_ACCOUNT_VERIFICATION_TOKEN_CODE), req, 422)
            }
            // check if account already verified
            if (user.accountVerification.status) {
                return httpError(next, new Error(responseMessage.ACCOUNT_ALREADY_VERIFIED), req, 422)
            }

            user.accountVerification.status = true
            user.accountVerification.timestamp = dayjs().utc().toDate()
            await user.save()

            //**** could send email ****

            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    login: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { body } = req as ILoginRequest

            // * Validate & parse body
            const { error, value } = validateJoiSchema<ILoginUserRequestBody>(validateLoginBody, body)
            if (error) {
                return httpError(next, error, req, 422)
            }

            const { email, password } = value

            // * Find User
            const user = await userService.findUserByEmail(email, `+password`)
            if (!user) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('user')), req, 404)
            }

            // * Check if user account is confirmed
            if (!user.accountVerification.status) {
                return httpError(next, new Error(responseMessage.ACCOUNT_VERIFICATION_REQUIRED), req, 400)
            }

            // * Validate Password
            const isValidPassword = await quicker.comparePassword(password, user.password)
            if (!isValidPassword) {
                return httpError(next, new Error(responseMessage.INVALID_EMAIL_OR_PASSWORD), req, 400)
            }

            // * Access Token & Refresh Token
            const accessToken = quicker.generateToken(
                {
                    userId: user._id
                },
                config.ACCESS_TOKEN.SECRET as string,
                config.ACCESS_TOKEN.EXPIRY
            )

            const refreshToken = quicker.generateToken(
                {
                    userId: user._id
                },
                config.REFRESH_TOKEN.SECRET as string,
                config.REFRESH_TOKEN.EXPIRY
            )

            // * Last login detail
            user.lastLoginAt = dayjs().utc().toDate()
            await user.save()

            // * Refresh Token Store
            const refreshTokenPayload: IRefreshToken = {
                token: refreshToken
            }
            await userService.createRefreshToken(refreshTokenPayload)

            // * Cookie send
            const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL as string)

            res.cookie('accessToken', accessToken, {
                path: '/api/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
                httpOnly: true,
                secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
            }).cookie('refreshToken', refreshToken, {
                path: '/api/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
                httpOnly: true,
                secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
            })

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                accessToken,
                refreshToken
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    selfIdentification: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { authenticatedUser } = req as ISelfIdentificationRequest
            httpResponse(req, res, 200, responseMessage.SUCCESS, authenticatedUser)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    logout: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { cookies } = req
            const { refreshToken } = cookies as {
                refreshToken: string | undefined
            }
            if (refreshToken) {
                // * delete refreshToken from DB
                await userService.deleteRefreshToken(refreshToken)
            }

            // * clear cookies
            const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL as string)
            res.clearCookie('accessToken', {
                path: '/api/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
                httpOnly: true,
                secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
            })

            res.clearCookie('refreshToken', {
                path: '/api/v1',
                domain: DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
                httpOnly: true,
                secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
            })
            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    refreshToken: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { cookies } = req

            const { refreshToken, accessToken } = cookies as {
                refreshToken: string | undefined
                accessToken: string | undefined
            }

            if (accessToken) {
                return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                    accessToken
                })
            }

            if (refreshToken) {
                // * get refreshToken from DB
                const rft = await userService.findRefreshToken(refreshToken)
                if (rft) {
                    const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL as string)
                    let userId: null | string = null

                    const decryptedJwt = quicker.verifyToken(refreshToken, config.REFRESH_TOKEN.SECRET as string) as IDecryptedJwt
                    if (decryptedJwt) {
                        userId = decryptedJwt.userId
                    }

                    if (userId) {
                        // * Access Token
                        const accessToken = quicker.generateToken(
                            {
                                userId
                            },
                            config.ACCESS_TOKEN.SECRET as string,
                            config.ACCESS_TOKEN.EXPIRY
                        )

                        // Generate new Access Token
                        res.cookie('accessToken', accessToken, {
                            path: '/api/v1',
                            domain: DOMAIN,
                            sameSite: 'strict',
                            maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
                            httpOnly: true,
                            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
                        })

                        return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                            accessToken
                        })
                    }
                }
            }

            httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Todo:
            // 1. Parsing Body
            const { body } = req as IForgotPasswordRequest

            // 2. Validate Body
            const { error, value } = validateJoiSchema<IForgotPasswordRequestBody>(ValidateForgotPasswordBody, body)
            if (error) {
                return httpError(next, error, req, 422)
            }

            const { email } = value

            // 3. Find User by Email Address
            const user = await userService.findUserByEmail(email)
            if (!user) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 404)
            }

            // 4. Check if user account is verified
            if (!user.accountVerification.status) {
                return httpError(next, new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED), req, 400)
            }

            // 5. Password Reset token & expiry
            const token = quicker.generateRandomId()
            const expiry = quicker.generateResetPasswordExpiry(15)

            // 6. Update User
            user.passwordReset.token = token
            user.passwordReset.expiry = expiry

            await user.save()

            // 7. Send Email
            const resetUrl = `${config.FRONTEND_URL}/auth/reset-password/${token}`
            const to = [email]
            const subject = 'Account Password Reset Requested'
            const text = `Hey ${user.name}, Please reset your account password by clicking on the link below.\n\nLink will expire within 15 Minutes.\n\n${resetUrl}`

            emailService.sendEmail(to, subject, text).catch((err) => {
                logger.error(`EMAIL_SERVICE`, {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    meta: err
                })
            })
            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    resetPassword: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // * Body Parsing & Validation
            const { body, params } = req as IResetPasswordRequest

            const { token } = params
            const { error, value } = validateJoiSchema<IResetPasswordRequestBody>(ValidateResetPasswordBody, body)
            if (error) {
                return httpError(next, error, req, 422)
            }

            const { newPassword } = value

            // * Fetch user by token
            const user = await userService.findUserByResetToken(token)
            if (!user) {
                return httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 404)
            }

            // * Check if user account is confirmed
            if (!user.accountVerification.status) {
                return httpError(next, new Error(responseMessage.ACCOUNT_CONFIRMATION_REQUIRED), req, 400)
            }

            // * Check expiry of the url
            const storedExpiry = user.passwordReset.expiry
            const currentTimestamp = dayjs().valueOf()

            if (!storedExpiry) {
                return httpError(next, new Error(responseMessage.INVALID_REQUEST), req, 400)
            }

            if (currentTimestamp > storedExpiry) {
                return httpError(next, new Error(responseMessage.EXPIRED_URL), req, 400)
            }

            // * Hash new password
            const hashedPassword = await quicker.hashPassword(newPassword)

            // * User update
            user.password = hashedPassword

            user.passwordReset.token = null
            user.passwordReset.expiry = null
            user.passwordReset.lastResetAt = dayjs().utc().toDate()
            await user.save()

            // * Email send
            const to = [user.email]
            const subject = 'Account Password Reset'
            const text = `Hey ${user.name}, You account password has been reset successfully.`

            emailService.sendEmail(to, subject, text).catch((err) => {
                logger.error(`EMAIL_SERVICE`, {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    meta: err
                })
            })

            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    changePassword: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // * Body parsing and validation
            const { body, authenticatedUser } = req as IChangePasswordRequest
            const { error, value } = validateJoiSchema<IChangePasswordRequestBody>(ValidateChangePasswordBody, body)
            if (error) {
                return httpError(next, error, req, 422)
            }

            // * find user by id
            const user = await userService.findUserById(authenticatedUser._id, '+password')
            if(!user){
                return httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 404)
            }

            // * check if old password match with current user password
            const { newPassword, oldPassword } = value
            const isPasswordMatching = await quicker.comparePassword(oldPassword, user.password)
            if (!isPasswordMatching) {
                return httpError(next, new Error(responseMessage.INVALID_OLD_PASSWORD), req, 400)
            }
            if (newPassword === oldPassword) {
                return httpError(next, new Error(responseMessage.PASSWORD_MATCHING_WITH_OLD_PASSWORD), req, 400)
            }

            // * password hash for new password
            const hashedPassword = await quicker.hashPassword(newPassword)

            // * user update
            user.password = hashedPassword
            await user.save()

            // * Email send
            const to = [user.email]
            const subject = 'Password Changed'
            const text = `Hey ${user.name}, You account password has been changed successfully.`

            emailService.sendEmail(to, subject, text).catch((err) => {
                logger.error(`EMAIL_SERVICE`, {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    meta: err
                })
            })

            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}

