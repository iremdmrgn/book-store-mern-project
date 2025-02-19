import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL"; // baseURL fonksiyonunuza ulaşım

const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/orders`, // Base URL dinamik şekilde alınıyor
    credentials: 'include', // Çerezlerin her istekle gönderilmesini sağlar
  }),
  tagTypes: ['Orders'], // API'den gelen veriyi etiketlemek için kullanılır
  endpoints: (builder) => ({
    // Sipariş oluşturma endpoint'i
    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: "/", // POST istek yolu
        method: "POST", // HTTP methodu
        body: newOrder, // Yeni sipariş verisi
        credentials: 'include', // Çerezlerin istekle birlikte gönderilmesi
      }),
    }),

    // Kullanıcıya ait siparişleri email ile getirme endpoint'i
    getOrderByEmail: builder.query({
      query: (email) => ({
        url: `/email/${email}`, // Kullanıcı email'ine göre siparişleri getiren URL
      }),
      providesTags: ['Orders'], // Bu sorgu ile elde edilen veriler "Orders" etiketi ile etiketlenir
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrderByEmailQuery } = ordersApi; // Mutasyon ve query hook'larını dışa aktarma

export default ordersApi;