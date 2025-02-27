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
        addPayment: builder.mutation<any, string>({
            query: (orderId) => ({
                url: 'orders/add-payment',
                method: 'POST',
                body: { orderId },
            }),
        }),
        validatePaymentLink: builder.query<Link, string>({
            query: (uuid) => `/links/${uuid}`,
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
    useValidatePaymentLinkQuery,
    useCancelOrderMutation,
    useAddPaymentMutation
} = orderApi;

export default orderApi;