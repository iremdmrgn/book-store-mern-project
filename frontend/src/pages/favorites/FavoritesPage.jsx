import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { fetchFavorites, removeFavoriteAsync } from '../../redux/features/favorites/favoritesSlice'

const FavoritesPage = () => {
  const { currentUser } = useAuth()
  const dispatch = useDispatch()
  const favorites = useSelector(state => state.favorites.items)
  const loading = useSelector(state => state.favorites.loading)
  const error = useSelector(state => state.favorites.error)

  // Favoriler backend'den yüklensin
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      dispatch(fetchFavorites(currentUser.uid.trim()))
    }
  }, [currentUser, dispatch])

  // Favoriden kaldırma işlemi için onay
  const handleRemove = (bookId) => {
    if (window.confirm("Are you sure you want to remove this item from favorites?")) {
      if (currentUser && currentUser.uid) {
        dispatch(removeFavoriteAsync({ userId: currentUser.uid.trim(), itemId: bookId }))
      }
    }
  }

  const handleAddToCart = (book) => {
    dispatch(addToCart(book))
  }

  const handleStartShopping = () => {
    window.location.href = "http://localhost:5173"
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message ? error.message : JSON.stringify(error)}</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-6 bg-[rgba(240,238,215,0.1)]">
      <h2 className="text-3xl font-semibold mb-6 text-center">Your Favorites</h2>
      {favorites.length > 0 ? (
        favorites.map(book => (
          <div key={book._id} className="relative mb-6 p-4 border border-gray-300 rounded-xl shadow-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            {/* Remove Button */}
            <button
              onClick={() => handleRemove(book._id)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              {/* Book Image */}
              <Link to={`/books/${book._id}`} className="flex-shrink-0">
                <img
                  src={`${getImgUrl(book?.coverImage)}`}
                  alt="Book cover"
                  className="w-24 h-32 object-cover rounded-lg shadow-md"
                />
              </Link>

              {/* Book Information */}
              <div className="flex-grow">
                <Link to={`/books/${book._id}`}>
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600">{book?.title}</h3>
                </Link>
                <p className="text-sm text-gray-600 mt-2">{book?.description}</p>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(book)}
                  className="mt-4 px-4 py-1 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <FiShoppingCart /> 
                  <span className="truncate">Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl shadow-lg bg-gray-50">
          <FiHeart className="text-6xl text-red-500 mb-4" />
          <p className="text-center text-gray-600 text-lg font-medium">
            There are no products in your favorites list. <br />
            Thousands of products we think you'll love are waiting for you at <span className="font-semibold text-blue-600">Leaf&Chapter</span>
          </p>
          <button 
            onClick={handleStartShopping}
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  )
}

export default FavoritesPage;
