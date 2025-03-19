import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getImgUrl } from '../../utils/getImgUrl';
import { LuTrash2 } from 'react-icons/lu';

import { 
  fetchCart,
  removeFromCartAsync,
  updateCartItemAsync,
  clearCartAsync
} from '../../redux/features/cart/cartSlice';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext'; // Oturum açan kullanıcıyı almak için

const CartPage = () => {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const { cartItems, loading, error } = useSelector(state => state.cart);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const MAX_QUANTITY = 10;
  const totalPrice = cartItems.reduce((acc, item) => acc + item.newPrice * item.quantity, 0).toFixed(2);

  // Load cart data from backend using trimmed Firebase uid
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      dispatch(fetchCart(currentUser.uid.trim()));
    }
  }, [currentUser, dispatch]);

  // Remove item from cart asynchronously
  const handleRemoveFromCart = (product) => {
    dispatch(removeFromCartAsync({ userId: currentUser.uid.trim(), itemId: product._id }));
  };

  // Clear cart asynchronously
  const handleClearCart = () => {
    dispatch(clearCartAsync(currentUser.uid.trim()));
  };

  // Increase quantity
  const handleIncreaseQuantity = (product) => {
    if (product.quantity < MAX_QUANTITY) {
      dispatch(updateCartItemAsync({ 
        userId: currentUser.uid.trim(), 
        itemId: product._id, 
        quantity: product.quantity + 1 
      }));
    } else {
      setAlertMessage(`You can only add up to ${MAX_QUANTITY} items of this product.`);
      setShowAlert(true);
    }
  };

  // Decrease quantity
  const handleDecreaseQuantity = (product) => {
    if (product.quantity > 1) {
      dispatch(updateCartItemAsync({ 
        userId: currentUser.uid.trim(), 
        itemId: product._id, 
        quantity: product.quantity - 1 
      }));
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center text-red-600">
        Error: {error.message ? error.message : JSON.stringify(error)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Title outside the white block */}
      <h1
        style={{ fontFamily: 'Lobster, cursive' }}
        className="text-4xl font-semibold text-center mb-8"
      >
        Shopping Cart
      </h1>
      
      {/* White Block for Cart Items & Subtotal */}
      <div className="bg-white">
        {/* Alert Message */}
        {showAlert && (
          <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
              <p className="text-lg font-semibold text-red-600">{alertMessage}</p>
              <button 
                className="mt-4 px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition-all duration-150"
                onClick={closeAlert}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="pt-0 pb-3">
          <div className="flow-root">
            {cartItems.length > 0 ? (
              <ul role="list" className="divide-y divide-gray-300">
                {cartItems.map((product) => (
                  <li
                    key={product?._id}
                    className="w-full flex py-5 mb-0 rounded-lg transition-all duration-200"
                    style={{
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 -4px 6px -1px rgba(0,0,0,0.1)"
                    }}
                  >
                    {/* Product Image */}
                    <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                      <img
                        alt="product"
                        src={`${getImgUrl(product?.coverImage)}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="ml-5 flex flex-1 flex-col">
                      <div className="relative w-full">
                        {/* Remove Button with Trash Icon and "Delete" text */}
                        <button
                          onClick={() => handleRemoveFromCart(product)}
                          type="button"
                          className="absolute flex items-center space-x-1 transition-colors text-gray-600 hover:text-gray-800"
                          style={{ top: '-8px', right: '0px' }}
                        >
                          <LuTrash2 size={20} />
                          <span className="text-xs">Delete</span>
                        </button>
                        <div>
                          <div className="flex flex-wrap justify-between text-sm font-semibold text-gray-900">
                            <h2 className="truncate max-w-xs">
                              <Link to="/" className="hover:text-indigo-700">{product?.title}</Link>
                            </h2>
                          </div>
                        </div>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between mt-4 text-sm">
                        {/* Quantity Control */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDecreaseQuantity(product)}
                            className="px-3 py-1 bg-yellow-500 text-black rounded-full hover:bg-yellow-600 transition-colors"
                          >
                            -
                          </button>
                          <p className="text-gray-600 font-medium">{product.quantity}</p>
                          <button
                            onClick={() => handleIncreaseQuantity(product)}
                            className="px-3 py-1 bg-yellow-500 text-black rounded-full hover:bg-yellow-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {/* Adjusted Price */}
                        <p className="text-lg font-semibold text-gray-800">
                          ${(product.newPrice * product.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 text-sm flex items-center justify-center">
                <ShoppingCartIcon className="h-8 w-8 mr-2" />
                <span className="text-lg">Your cart is empty!</span>
              </div>
            )}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="mt-36 border-t border-gray-300 py-4 w-full rounded-b-xl" style={{ backgroundColor: 'rgba(150,150,170,0.2)' }}>
          <div className="flex justify-between text-lg font-semibold mb-5 w-full px-5">
            <p>Subtotal</p>
            <p>${totalPrice ? totalPrice : 0}</p>
          </div>
          <p className="mt-1 text-xs text-gray-600 mb-3 px-5">
            Shipping and taxes calculated at checkout.
          </p>
          {/* Checkout Button */}
          <div className="mt-6 px-5">
            <Link
              to={cartItems.length > 0 ? "/checkout" : "#"}
              className="flex items-center justify-center rounded-lg px-5 py-1 bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition-colors gap-2 w-full"
            >
              Proceed to Checkout
            </Link>
          </div>
          {/* Continue Shopping Button */}
          <div className="mt-5 flex justify-center text-center text-xs text-gray-600">
            <Link to="/">
              <button type="button" className="font-medium">
                Continue Shopping <span aria-hidden="true"> &rarr;</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
