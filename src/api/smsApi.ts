import { baseApi } from "."

export const smsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        sendCode: builder.mutation<{message: string}, {phone: string}>({
            query: (body) => ({
                url: '/sms/send',
                method: 'POST',
                body
            }),
        }),
        verifyCode: builder.mutation<{ phone: string, token: string }, { code: string, phone: string }>({
            query: (body) => ({
                url: '/sms/verify',
                method: 'POST',
                body
            })
        }),
    })
})

export const { useSendCodeMutation, useVerifyCodeMutation } = smsApi