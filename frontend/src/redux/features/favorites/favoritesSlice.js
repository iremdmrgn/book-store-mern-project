import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Swal from 'sweetalert2';

const initialState = {
  items: [],  // Favori kitaplar burada tutulacak
  cartItems: []  // Sepet kitapları burada tutulacak (opsiyonel)
};

// Favorileri backend'den çekmek için thunk
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
      return response.data.items;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Favorilere ürünü backend'e eklemek için thunk
export const addFavoriteAsync = createAsyncThunk(
  'favorites/addFavoriteAsync',
  async ({ userId, item }, thunkAPI) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/favorites/${userId}`, item);
      return response.data.items;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Favorilerden ürünü backend'den silmek için thunk
export const removeFavoriteAsync = createAsyncThunk(
  'favorites/removeFavoriteAsync',
  async ({ userId, itemId }, thunkAPI) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/favorites/${userId}/item/${itemId}`);
      return response.data.items;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Favorileri backend'de temizlemek için thunk
export const clearFavoritesAsync = createAsyncThunk(
  'favorites/clearFavoritesAsync',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/favorites/${userId}`);
      return response.data.items;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Lokal olarak favorilere ekleme işlemi (opsiyonel, backend asenkron thunk ile çalışırken genellikle kullanılmaz)
    addToFavorites: (state, action) => {
      const exists = state.items.some(item => item._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Added to Favorites",
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        Swal.fire({
          title: "Already Added to Favorites",
          text: "This item is already in your favorites.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "OK!"
        });
      }
    },
    removeFromFavorites: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload._id);
    },
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
    // Eğer favorilerden sepet işlemleri yapılacaksa, addToCart burada da kullanılabilir
    addToCart: (state, action) => {
      const existingCartItem = state.cartItems.find(item => item._id === action.payload._id);
      if (!existingCartItem) {
        state.cartItems.push(action.payload);
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
  },
  extraReducers: (builder) => {
    builder
      // fetchFavorites durumları
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addFavoriteAsync durumları
      .addCase(addFavoriteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFavoriteAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Added to Favorites",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .addCase(addFavoriteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // removeFavoriteAsync durumları
      .addCase(removeFavoriteAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFavoriteAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Removed from Favorites",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .addCase(removeFavoriteAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // clearFavoritesAsync durumları
      .addCase(clearFavoritesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearFavoritesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Favorites Cleared",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .addCase(clearFavoritesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addToFavorites, removeFromFavorites, clearFavorites, addToCart } = favoritesSlice.actions;
export default favoritesSlice.reducer;
