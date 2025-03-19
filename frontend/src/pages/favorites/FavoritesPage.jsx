import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { addToCartAsync } from '../../redux/features/cart/cartSlice'
import { fetchFavorites, removeFavoriteAsync } from '../../redux/features/favorites/favoritesSlice'
import { LuTrash2 } from "react-icons/lu"

const FavoritesPage = () => {
  const { currentUser } = useAuth()
  const dispatch = useDispatch()
  const favorites = useSelector(state => state.favorites.items)
  const loading = useSelector(state => state.favorites.loading)
  const error = useSelector(state => state.favorites.error)

  // Load favorites from backend
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      dispatch(fetchFavorites(currentUser.uid.trim()))
    }
  }, [currentUser, dispatch])

  const handleRemove = (favoriteRecord) => {
    if (currentUser && currentUser.uid) {
      // Use productId if available, otherwise fallback to favorites document _id
      const itemId = favoriteRecord.productId || favoriteRecord._id;
      dispatch(removeFavoriteAsync({ userId: currentUser.uid.trim(), itemId }))
    }
  }
  
  // Handler to add favorite book to cart
  const handleAddToCart = (fav) => {
    const bookForCart = {
      productId: fav.productId || fav._id,
      title: fav.title,
      coverImage: fav.coverImage,
      newPrice: fav.newPrice,
      quantity: 1,
    }
    dispatch(addToCartAsync({ userId: currentUser.uid, item: bookForCart }))
  }

  const handleStartShopping = () => {
    window.location.href = "http://localhost:5173"
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message ? error.message : JSON.stringify(error)}</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-2 bg-[rgba(240,238,215,0.1)]">
      <h2 
        className="text-4xl font-semibold mb-6 text-center" 
        style={{ fontFamily: "Lobster, cursive" }}
      >
        Your Favorites
      </h2>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map(fav => (
            <div 
              key={fav._id} 
              className="rounded-lg transition-shadow duration-300 w-full max-w-[200px] mx-auto shadow-lg hover:shadow-2xl relative"
            >
              {/* Trash Icon for removal */}
              <button
                onClick={() => handleRemove(fav)}
                className="absolute top-2 right-2 text-lg cursor-pointer z-10"
              >
                <LuTrash2 size={20} />
              </button>

              <div 
                className="flex flex-col items-center gap-3 p-3 border rounded-md" 
                style={{ backgroundColor: 'rgba(164, 164, 180, 0.3)' }}
              >
                {/* Book Image */}
                <div className="h-32 w-32 border rounded-md overflow-hidden">
                  <Link to={`/book/${fav.productId || fav._id.toString()}`}>
                    <img
                      src={`${getImgUrl(fav?.coverImage)}`}
                      alt="Book cover"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </div>

                {/* Book Information */}
                <div className="text-center w-full">
                  <Link to={`/book/${fav.productId || fav._id.toString()}`}>
                    <h3 className="text-sm font-semibold mb-2 truncate">
                      {fav?.title || 'No title available'}
                    </h3>
                  </Link>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(fav)}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1 w-full"
                  >
                    <FiShoppingCart size={14} />
                    <span className="text-xs">Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state container with a max-width for 2 product cards (adjusted to 600px)
        <div className="mx-auto w-full max-w-[600px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl shadow-lg bg-gray-50">
          <FiHeart className="text-6xl text-red-500 mb-4" />
          <p className="text-center text-gray-600 text-lg font-medium">
            There are no products in your favorites list. <br />
            Thousands of products we think you'll love are waiting for you at <span className="font-semibold text-blue-600">Leaf&Chapter</span>
          </p>
          <button 
            onClick={handleStartShopping}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold rounded-full shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage;
