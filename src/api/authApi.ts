import { baseApi } from ".";
import { LoginDto } from "../models/dto/LoginDto";
import { RegisterDto } from "../models/dto/RegisterDto";
import User from "../models/User";


export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<{accessToken: string, user: User}, LoginDto>({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body: body
            }),
        }),
        register: builder.mutation<{accessToken: string, user: User}, RegisterDto>({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body: body
            })
        }),
        checkPhone: builder.mutation<{exists: boolean}, {phone: string}>({
            query: (body) => ({
                url: '/auth/check-phone',
                method: 'POST',
                body: body
            })
        }),
        resetPassword: builder.mutation<{message: string}, { phone: string, newPassword: string, token: string }>({
            query: (body) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body
            })
        })
    })
})

export const { useLoginMutation, useRegisterMutation, useCheckPhoneMutation, useResetPasswordMutation } = authApi