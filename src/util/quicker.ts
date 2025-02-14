import os from 'os'
import config from '../config/config'
import { parsePhoneNumber } from 'libphonenumber-js'
import { getTimezonesForCountry } from 'countries-and-timezones'
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'
import { randomInt } from 'crypto'
import jwt from 'jsonwebtoken'
import dayjs from 'dayjs'

export default {
    getSystemHealth: () => {
        return {
            cpuUsage: os.loadavg(),
            totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
            freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`
        }
    },
    getApplicationHealth: () => {
        return {
            environment: config.ENV,
            uptime: `${process.uptime().toFixed(2)} Seconds`,
            memoryUsage: {
                heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
            }
        }
    },

    parsePhoneNumber: (phoneNumber: string) => {
        const parsedPhoneNumber = parsePhoneNumber(phoneNumber)
        if (!parsedPhoneNumber) {
            return {
                countryCode: null,
                isoCode: null,
                internationalNumber: null
            }
        }
        return {
            countryCode: parsedPhoneNumber.countryCallingCode,
            isoCode: parsedPhoneNumber.country || null,
            internationalNumber: parsedPhoneNumber.formatInternational()
        }
    },

    countryTimezone: (isoCode: string) => {
        return getTimezonesForCountry(isoCode)
    },

    hashPassword: (password: string) => {
        return bcrypt.hash(password, 10)
    },

    comparePassword: (attemptedPassword: string, hashedPassword: string) => {
        return bcrypt.compare(attemptedPassword, hashedPassword)
    },

    generateRandomId: () => v4(),

    generateOtp: (length: number = 6) => {
        const min = Math.pow(10, length - 1)
        const max = Math.pow(10, length) - 1
        return randomInt(min, max).toString()
    },

    generateToken: (payload: object, secret: string, expiry: number) => {
        return jwt.sign(payload, secret, {
            expiresIn: expiry
        })
    },

    verifyToken: (token: string, secret: string) => {
        return jwt.verify(token, secret)
    },

    getDomainFromUrl: (url: string) => {
        try {
            const parsedUrl = new URL(url)
            return parsedUrl.hostname
        } catch (err) {
            throw err
        }
    },

    generateResetPasswordExpiry: (minute: number) => {
        return dayjs().valueOf() + minute * 60 * 1000
    }
}

