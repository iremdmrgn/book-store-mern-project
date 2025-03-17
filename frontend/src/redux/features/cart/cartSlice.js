import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Swal from 'sweetalert2';

const initialState = {
  cartItems: [],
  loading: false,
  error: null,
};

// Kullanıcının sepetini backend'den çekmek için thunk
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      // API, sepetin items'ını döndürecek şekilde yapılandırıldı
      return response.data.items;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Sepete ürünü backend'e eklemek için thunk
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async ({ userId, item }, thunkAPI) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/cart/${userId}`, item);
      // API güncellenmiş sepeti döndürüyor
      return response.data.items;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Sepeti backend'de temizlemek için thunk
export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/cart/${userId}`);
      // Backend, güncellenmiş sepetin items'ını döndürmelidir (muhtemelen boş bir dizi)
      return response.data.items;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Sepetten ürünü backend'de silmek için thunk
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async ({ userId, itemId }, thunkAPI) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/cart/${userId}/item/${itemId}`);
      // Backend, güncellenmiş sepetin items'ını döndürmelidir.
      return response.data.items;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Sepetteki bir ürünün miktarını güncellemek için thunk
export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItemAsync',
  async ({ userId, itemId, quantity }, thunkAPI) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/cart/${userId}/item/${itemId}`, { quantity });
      // Backend güncellenmiş sepetin items'ını döndürmelidir.
      return response.data.items;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.cartItems.find(item => item._id === action.payload._id);
      const quantityToAdd = action.payload.quantity || 1; // Varsayılan olarak 1 ekle
      if (existingItem) {
        existingItem.quantity += quantityToAdd;
      } else {
        state.cartItems.push({
          ...action.payload,
          quantity: quantityToAdd,
        });
      }
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Product Added to the Cart",
        showConfirmButton: false,
        timer: 1500
      });
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(item => item._id !== action.payload._id);
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
    increaseQuantity: (state, action) => {
      const item = state.cartItems.find(item => item._id === action.payload._id);
      if (item) {
        item.quantity += 1;
      }
    },
    decreaseQuantity: (state, action) => {
      const item = state.cartItems.find(item => item._id === action.payload._id);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchCart durumları
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addToCartAsync durumları
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Product Added to the Cart",
          showConfirmButton: false,
          timer: 1500
        });
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // clearCartAsync durumları
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
        // "Cart Cleared" popup'ını kaldırdık.
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // removeFromCartAsync durumları
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
       
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateCartItemAsync durumları (Cart Item Updated alert kaldırıldı)
      .addCase(updateCartItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addToCart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = cartSlice.actions;
export default cartSlice.reducer;
