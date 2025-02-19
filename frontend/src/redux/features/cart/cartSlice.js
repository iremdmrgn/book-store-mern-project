import { createSlice } from '@reduxjs/toolkit';
import Swal from 'sweetalert2';

const initialState = {
    cartItems: []
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.cartItems.find(item => item._id === action.payload._id);
            const quantityToAdd = action.payload.quantity || 1;  // Default to 1 if no quantity specified

            if (existingItem) {
                // Increase quantity of existing item
                existingItem.quantity += quantityToAdd;
            } else {
                // Add new item with specified quantity
                state.cartItems.push({
                    ...action.payload,
                    quantity: quantityToAdd,
                });
            }

            // Display success message when item is added to cart
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
    }
});

export const { addToCart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = cartSlice.actions;
export default cartSlice.reducer;
