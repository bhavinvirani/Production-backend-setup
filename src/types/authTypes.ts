export interface IRegisterRequestBody {
    name: string
    email: string
    phoneNumber: string
    password: string
    consent: boolean
}

export interface ILoginUserRequestBody {
    email: string
    password: string
}

export interface IForgotPasswordRequestBody {
    email: string
}

export interface IResetPasswordRequestBody {
    newPassword: string
}

export interface IChangePasswordRequestBody {
    oldPassword: string
    newPassword: string
    confirmNewPassword: string
}

