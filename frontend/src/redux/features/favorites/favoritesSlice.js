import { createSlice } from '@reduxjs/toolkit';
import Swal from 'sweetalert2';

const initialState = {
  items: [],  // Favori kitaplar burada tutulacak
  cartItems: []  // Sepet kitapları burada tutulacak
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Kitapları favorilere ekler
    addToFavorites: (state, action) => {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      if (!existingItem) {
        state.items.push(action.payload); // Favorilere kitap ekleme
        // Swal.fire() silindi, artık burada hiçbir bildirim yok
      } else {
        Swal.fire({
          title: "Already Added to Favorites",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "OK!"
        });
      }
    },
    // Kitapları favorilerden siler
    removeFromFavorites: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload._id);  // Kitap silme
      // Swal.fire() silindi, artık burada hiçbir bildirim yok
    },
    // Tüm favori kitapları siler
    clearFavorites: (state) => {
      state.items = [];
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "All Favorites Cleared",
        showConfirmButton: false,
        timer: 1500
      });
    },
    // Kitapları sepete ekler
    addToCart: (state, action) => {
      const existingCartItem = state.cartItems.find(item => item._id === action.payload._id);
      if (!existingCartItem) {
        state.cartItems.push(action.payload);  // Sepete kitap ekleme
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Product Added to Cart",
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        Swal.fire({
          title: "Already In Cart",
          text: "This item is already in your cart.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "OK!"
        });
      }
    },
  }
});

export const { addToFavorites, removeFromFavorites, clearFavorites, addToCart } = favoritesSlice.actions;
export default favoritesSlice.reducer;
