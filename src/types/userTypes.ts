import { EUserRoles } from '../constant/userConstants'

export interface IUser {
    name: string
    email: string
    phoneNumber: {
        isoCode: string
        countryCode: number
        internationalNumber: string
    }
    password: string
    timezone: string
    role: EUserRoles
    accountVerification: {
        status: boolean
        token: string
        code: string
        timestamp: Date | null
    }
    passwordReset: {
        token: string | null
        expiry: number | null
        lastResetAt: Date | null
    }
    lastLoginAt: Date | null
    consent: boolean
}

export interface IUserWithId extends IUser {
    _id: string
}

export interface IRefreshToken {
    token: string
}

export interface IDecryptedJwt {
    userId: string
}
