import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getImgUrl } from '../../utils/getImgUrl';

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

  // Backend'den sepet verilerini yükle (Firebase uid kullanarak ve trim uygulanarak)
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      dispatch(fetchCart(currentUser.uid.trim()));
    }
  }, [currentUser, dispatch]);

  // Remove işlemi: Backend'e asenkron istek gönder
  const handleRemoveFromCart = (product) => {
    dispatch(removeFromCartAsync({ userId: currentUser.uid.trim(), itemId: product._id }));
  };

  // Sepeti tamamen temizle (backend)
  const handleClearCart = () => {
    dispatch(clearCartAsync(currentUser.uid.trim()));
  };

  // Miktarı artırma: Yeni miktarı backend'e gönder
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

  // Miktarı azaltma: Yeni miktarı backend'e gönder
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
    <div className="flex mt-6 h-auto flex-col overflow-hidden bg-white shadow-lg max-w-2xl mx-auto rounded-2xl p-8">
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

      {/* Title and Clear Cart Button */}
      <div className="flex items-center justify-between mb-8 px-5 py-3 rounded-t-xl bg-indigo-50 text-indigo-800 shadow-sm">
        <div className="text-4xl font-semibold text-center flex-1">Shopping Cart</div>
        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            className="py-2 px-5 bg-red-600 text-white rounded-full hover:bg-red-500 transition-all duration-150 text-sm shadow-sm"
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="px-5 py-3 mb-12">
        <div className="flow-root">
          {cartItems.length > 0 ? (
            <ul role="list" className="divide-y divide-gray-300">
              {cartItems.map((product) => (
                <li key={product?._id} className="flex py-5 mb-5 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200">
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
                      {/* Remove Button (X) */}
                      <button
                        onClick={() => handleRemoveFromCart(product)}
                        type="button"
                        className="absolute top-0 right-0 text-lg font-bold text-red-600 hover:text-red-500 transition-colors"
                      >
                        &#10005;
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
                          className="px-3 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                        >
                          -
                        </button>
                        <p className="text-gray-600 font-medium">{product.quantity}</p>
                        <button
                          onClick={() => handleIncreaseQuantity(product)}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      {/* Adjusted price */}
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
      <div className="border-t border-gray-300 px-5 py-4 w-full mt-6 rounded-b-xl bg-gradient-to-r from-indigo-700 to-indigo-700 text-white">
        <div className="flex justify-between text-lg font-semibold mb-5 w-full">
          <p>Subtotal</p>
          <p>${totalPrice ? totalPrice : 0}</p>
        </div>
        <p className="mt-1 text-xs text-gray-200 mb-3">
          Shipping and taxes calculated at checkout.
        </p>
        {/* Checkout Button */}
        <div className="mt-6">
          <Link
            to={cartItems.length > 0 ? "/checkout" : "#"}
            className={`flex items-center justify-center rounded-lg px-7 py-3 text-sm font-medium text-white shadow-sm ${
              cartItems.length > 0 ? 'bg-indigo-600 ' : 'bg-indigo-800 cursor-not-allowed'
            }`}
          >
            Proceed to Checkout
          </Link>
        </div>
        {/* Continue Shopping Button */}
        <div className="mt-5 flex justify-center text-center text-xs text-gray-200">
          <Link to="/">
            <button type="button" className="font-medium text-gray-200 ">
              Continue Shopping <span aria-hidden="true"> &rarr;</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
