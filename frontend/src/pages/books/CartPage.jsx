import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl'
import { LuTrash2 } from 'react-icons/lu'
import axios from 'axios'

import { 
  fetchCart,
  removeFromCartAsync,
  updateCartItemAsync,
  clearCartAsync
} from '../../redux/features/cart/cartSlice'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'

const CartPage = () => {
  const { currentUser } = useAuth()
  const dispatch = useDispatch()
  const { cartItems, loading, error } = useSelector(state => state.cart)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const MAX_QUANTITY = 10
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.newPrice * item.quantity, 0)
    .toFixed(2)

  // Kullanıcının sepet verisini backend'den yükleme
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      dispatch(fetchCart(currentUser.uid.trim()))
    }
  }, [currentUser, dispatch])

  // Sepetten ürün silme
  const handleRemoveFromCart = (product) => {
    dispatch(
      removeFromCartAsync({ userId: currentUser.uid.trim(), itemId: product._id })
    )
  }

  // Sepeti temizleme
  const handleClearCart = () => {
    dispatch(clearCartAsync(currentUser.uid.trim()))
  }

  const handleIncreaseQuantity = async (product) => {
    try {
      // Ürünün güncel halini backend'den al
      const response = await axios.get(`http://localhost:5000/api/books/${product.productId || product._id}`);
      const updatedProduct = response.data;
      const availableStock = Number(updatedProduct.stock);
      const allowedLimit = Math.min(availableStock, MAX_QUANTITY);
  
      // Eğer stok yoksa veya kullanıcı zaten en fazla adedi eklediyse
      if (availableStock <= 0) {
        setAlertMessage("This product is out of stock.");
        setShowAlert(true);
        return;
      }
  
      if (product.quantity >= allowedLimit) {
        setAlertMessage(
          `You can only add up to ${allowedLimit} item${allowedLimit > 1 ? 's' : ''}. Only ${availableStock} in stock.`
        );
        setShowAlert(true);
        return;
      }
  
      // Güncelleme işlemi
      await dispatch(
        updateCartItemAsync({
          userId: currentUser.uid.trim(),
          itemId: product._id,
          quantity: product.quantity + 1,
        })
      );
  
      // Güncel sepet verisini tekrar çek
      dispatch(fetchCart(currentUser.uid.trim()));
    } catch (err) {
      console.error("Error checking stock:", err);
      setAlertMessage("Failed to check stock. Please try again.");
      setShowAlert(true);
    }
  };
  

  // Miktar azaltma
  const handleDecreaseQuantity = (product) => {
    if (product.quantity > 1) {
      dispatch(
        updateCartItemAsync({
          userId: currentUser.uid.trim(),
          itemId: product._id,
          quantity: product.quantity - 1,
        })
      )
    }
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error: {error.message ? error.message : JSON.stringify(error)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sayfa Başlığı */}
      <h1 style={{ fontFamily: 'Lobster, cursive' }} className="text-4xl font-semibold text-center mb-8">
        Shopping Cart
      </h1>

      {/* Sepet İçeriği */}
      <div className="bg-white rounded-xl shadow-lg p-4">
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

        {/* Sepet Ürünleri */}
        <div className="pt-0 pb-3">
          <div className="flow-root">
            {cartItems.length > 0 ? (
              <ul role="list" className="divide-y divide-gray-200">
                {cartItems.map((product) => (
                  <li
                    key={product?._id}
                    className="relative flex py-5 mb-0 rounded-lg transition-shadow duration-200 hover:shadow-lg"
                  >
                    {/* Ürün Resmi */}
                    <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                      <img
                        alt="product"
                        src={`${getImgUrl(product?.coverImage)}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    {/* Ürün Detayları */}
                    <div className="ml-5 flex flex-1 flex-col">
                      <div className="mb-4">
                        <h2 className="text-sm font-semibold text-gray-900 truncate">
                          <Link to={`/book/${product?.productId || product?._id.toString()}`} className="hover:text-indigo-700">
                            {product?.title}
                          </Link>
                        </h2>
                      </div>
                      <div className="flex items-center">
                        {/* Sabit genişlikte miktar kontrolü */}
                        <div className="flex items-center space-x-2 w-48">
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
                        {/* Miktar kontrolünden sonra fiyat */}
                        <p className="text-lg font-semibold text-gray-800 ml-60">
                          ${(product.newPrice * product.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {/* Ürünü Kaldır Butonu */}
                    <button
                      onClick={() => handleRemoveFromCart(product)}
                      type="button"
                      className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <LuTrash2 size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-1">
                  <ShoppingCartIcon className="h-10 w-10 text-gray-500" />
                  <span className="text-xl mt-2 font-semibold">Your cart is empty!</span>
                  <p className="text-sm text-gray-600 mt-2">
                    Looks like you haven't added any items to your cart yet.
                  </p>
                  <Link
                    to="/"
                    className="mt-4 px-6 py-2 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-600 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sepet Özeti */}
        <div className="mt-8 border-t border-gray-300 py-4 rounded-b-xl" style={{ backgroundColor: 'rgba(165, 165, 179, 0.2)' }}>
          <div className="flex justify-between text-lg font-semibold mb-5 px-5">
            <p>Subtotal</p>
            <p>${totalPrice ? totalPrice : 0}</p>
          </div>
          <p className="mt-1 text-xs text-gray-600 mb-3 px-5">
            Shipping and taxes calculated at checkout.
          </p>
          <div className="mt-6 px-5">
            <Link
              to={cartItems.length > 0 ? "/checkout" : "#"}
              className="flex items-center justify-center rounded-lg px-5 py-1 bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition-colors gap-2 w-full"
            >
              Proceed to Checkout
            </Link>
          </div>
          <div className="mt-5 flex justify-center text-center text-xs text-gray-900">
            <Link to="/">
              <button type="button" className="font-medium">
                Continue Shopping <span aria-hidden="true"> &rarr;</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
