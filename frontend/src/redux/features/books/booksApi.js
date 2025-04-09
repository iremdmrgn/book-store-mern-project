import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/baseURL';

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/books`,
  credentials: 'include',
  prepareHeaders: (Headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      Headers.set('Authorization', `Bearer ${token}`);
    }
    return Headers;
  }
});

const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery,
  tagTypes: ['Books'],
  endpoints: (builder) => ({
    fetchAllBooks: builder.query({
      query: () => "/",
      providesTags: ["Books"]
    }),
    fetchBookById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Books", id }],
    }),
    addBook: builder.mutation({
      query: (newBook) => ({
        url: `/create-book`,
        method: "POST",
        body: newBook
      }),
      invalidatesTags: ["Books"]
    }),
    updateBook: builder.mutation({
      query: ({ id, ...rest }) => {
        // Stock değeri varsa sayı olarak gönderiyoruz
        const updatedData = {
          ...rest,
          stock: rest.stock !== undefined ? Number(rest.stock) : rest.stock
        };
        return {
          url: `/edit/${id}`,
          method: "PUT",
          body: updatedData,
          headers: {
            'Content-Type': 'application/json'
          }
        };
      },
      invalidatesTags: ["Books"]
    }),
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Books"]
    }),
    searchBooks: builder.query({
      query: (query) => ({
        url: `/search?query=${query}`,
        method: "GET",
      }),
      providesTags: ["Books"],
    })
  })
});

export const { 
  useFetchAllBooksQuery, 
  useFetchBookByIdQuery, 
  useAddBookMutation, 
  useUpdateBookMutation, 
  useDeleteBookMutation,
  useSearchBooksQuery 
} = booksApi;

export default booksApi;
