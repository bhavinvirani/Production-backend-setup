import mongoose from 'mongoose'
import { IUser } from '../types/userTypes'
import { EUserRoles } from '../constant/userConstants'

const userSchema = new mongoose.Schema<IUser>({
    name : {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 72
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        _id: false,
        isoCode: {
            type: String,
            required: true
        },
        countryCode: {
            type: Number,
            required: true
        },
        internationalNumber: {
            type: String,
            required: true
        }
    },
    timezone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        default: EUserRoles.USER,
        enum: EUserRoles,
        required: true,
    },
    accountVerification: {
        _id: false,
        status: {
            type: Boolean,
            default: false,
            required: true
        },
        token: {
            type: String,
            default: null
        },
        code: {
            type: String,
            default: null
        },
        timestamp: {
            type: Date,
            default: null
        }
    },
    passwordReset: {
        _id: false,
        token: {
            type: String,
            default: null
        },
        expiry: {
            type: Number,
            default: null
        },
        lastResetAt: {
            type: Date,
            default: null
        }
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    consent: {
        type: Boolean,
        required: true
    }

}, { timestamps: true })

export default mongoose.model<IUser>('User', userSchema)
 