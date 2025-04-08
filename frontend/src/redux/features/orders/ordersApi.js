import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";
import booksApi from "../books/booksApi";

const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/orders`,
    credentials: 'include',
  }),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: "/",
        method: "POST",
        body: newOrder,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(booksApi.util.invalidateTags(["Books"]));
        } catch (error) {}
      },
    }),
    getOrderByEmail: builder.query({
      query: (email) => ({
        url: `/email/${email}`,
      }),
      providesTags: ['Orders'],
    }),
    getOrderCount: builder.query({
      query: () => ({
        url: "/count",
      }),
      providesTags: ['Orders'],
    }),
    getRecentOrders: builder.query({
      query: () => ({
        url: "/recent",
      }),
      providesTags: ['Orders'],
    }),
    getAllOrders: builder.query({
      query: () => ({
        url: "/",
      }),
      providesTags: ['Orders'],
    }),
    // Yeni: Shipping Status Güncellemesi için Mutation
    updateOrderShippingStatus: builder.mutation({
      query: ({ orderId, shippingStatus }) => ({
        url: `/${orderId}`,
        method: "PUT",
        body: { shippingStatus },
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { 
  useCreateOrderMutation, 
  useGetOrderByEmailQuery, 
  useGetOrderCountQuery, 
  useGetRecentOrdersQuery, 
  useGetAllOrdersQuery,
  useUpdateOrderShippingStatusMutation
} = ordersApi;
export default ordersApi;
