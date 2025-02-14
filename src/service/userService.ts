import refreshTokenModel from '../model/refreshTokenModel'
import userModel from '../model/userModel'
import { IRefreshToken, IUser } from '../types/userTypes'

export default {
    findUserByEmail: async (email: string, select: string = '') => {
        return userModel.findOne({ email }).select(select)
    },

    findUserByVerificationTokenAndCode(token: string, code: string){
        return userModel.findOne({
            'accountVerification.token': token,
            'accountVerification.code': code
        })
    },

    registerUser: async (payload: IUser) => {
        return userModel.create(payload)
    },

    findUserById: (id: string, select: string = '') => {
        return userModel.findById(id).select(select)
    },

    findUserByConfirmationTokenAndCode: (token: string, code: string) => {
        return userModel.findOne({
            'accountVerification.token': token,
            'accountVerification.code': code
        })
    },

    findUserByResetToken: (token: string) => {
        return userModel.findOne({
            'passwordReset.token': token
        })
    },

    // could be in different service
    createRefreshToken: (payload: IRefreshToken) => {
        return refreshTokenModel.create(payload)
    },

    deleteRefreshToken: (token: string) => {
        return refreshTokenModel.deleteOne({ token: token })
    },

    findRefreshToken: (token: string) => {
        return refreshTokenModel.findOne({ token })
    }
}

