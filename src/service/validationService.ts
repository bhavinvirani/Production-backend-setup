import joi from 'joi'
import {
    IChangePasswordRequestBody,
    IForgotPasswordRequestBody,
    ILoginUserRequestBody,
    IRegisterRequestBody,
    IResetPasswordRequestBody
} from '../types/authTypes'

export const validateJoiSchema = <T>(schema: joi.Schema, value: unknown) => {
    const result = schema.validate(value)
    return {
        value: result.value as T,
        error: result.error ? result.error : undefined
    }
}

export const validateRegisterBody = joi.object<IRegisterRequestBody>({
    name: joi.string().min(2).max(72).trim().required(),
    email: joi.string().email().trim().required(),
    phoneNumber: joi.string().required().trim().required(),
    password: joi.string().min(6).max(24).trim().required(),
    consent: joi.boolean().valid(true).required()
})

export const validateLoginBody = joi.object<ILoginUserRequestBody>({
    email: joi.string().email().trim().required(),
    password: joi.string().min(6).max(24).trim().required()
})

export const ValidateForgotPasswordBody = joi.object<IForgotPasswordRequestBody>({
    email: joi.string().email().trim().required()
})

export const ValidateResetPasswordBody = joi.object<IResetPasswordRequestBody>({
    newPassword: joi.string().min(6).max(24).trim().required()
})

export const ValidateChangePasswordBody = joi.object<IChangePasswordRequestBody>({
    oldPassword: joi.string().min(6).max(24).trim().required(),
    newPassword: joi.string().min(6).max(24).trim().required(),
    confirmNewPassword: joi.string().min(6).max(24).trim().valid(joi.ref('newPassword')).required()
})

