import {BaseQueryApi, BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError} from '@reduxjs/toolkit/query/react'
import { API_URL } from '../utils'
import { userClosed } from '../redux/slices/userSlice'

const baseQuery: any = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token")

      if (token) {
          headers.set("Authorization", `Bearer ${token}`)
      }
  
      return headers
  },
  credentials: "include"
})

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError> 
    = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        const refreshResult = await baseQuery({url: "/auth/refresh", method: 'POST'}, api, extraOptions); 

        if (refreshResult.data) {
            localStorage.setItem("access_token", refreshResult.data.accessToken)
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(baseApi.util.resetApiState())
            api.dispatch(userClosed())
            localStorage.removeItem("access_token")
        }
    }

    return result
}

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Orders'],
    endpoints: () => ({}),
})