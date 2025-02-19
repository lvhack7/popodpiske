import { baseApi } from '.';
import { CreateOrderDto } from '../models/dto/CreateOrderDto';
import { Link } from '../models/Link';
import { Order } from '../models/Order';

const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<any, CreateOrderDto>({
            query: (newOrder) => ({
                url: 'orders',
                method: 'POST',
                body: newOrder,
            }),
        }),
        getOrders: builder.query<Order[], void>({
            query: () => 'orders',
            providesTags: ['Orders']
        }),
        successOrder: builder.mutation<any, {linkId: string}>({
            query: (body) => ({
                url: `orders/success`,
                method: 'POST',
                body: body,
            }),
        }),
        validatePaymentLink: builder.query<Link, string>({
            query: (uuid) => `/links/${uuid}`,
        }),
        markPaymentLinkAsUsed: builder.mutation({
            query: (uuid) => ({
              url: `/orders/${uuid}/mark-used`,
              method: 'POST',
            }),
        }),
        cancelOrder: builder.mutation<void, number>({
            query: (orderId) => ({
                url: `/orders`,
                method: 'DELETE',
                body: {orderId}
            }),
            invalidatesTags: ['Orders']
        })
    }),
});

export const {
    useCreateOrderMutation,
    useGetOrdersQuery,
    useSuccessOrderMutation,
    useValidatePaymentLinkQuery,
    useMarkPaymentLinkAsUsedMutation,
    useCancelOrderMutation
} = orderApi;

export default orderApi;