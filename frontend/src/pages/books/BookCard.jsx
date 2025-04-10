import React, { useState } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { IoNotifications } from 'react-icons/io5';
import { getImgUrl } from '../../utils/getImgUrl';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../../redux/features/cart/cartSlice';
import { addFavoriteAsync, removeFavoriteAsync } from '../../redux/features/favorites/favoritesSlice';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const BookCard = ({ book }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const favorites = useSelector((state) => state.favorites.items);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const closeAlert = () => setShowAlert(false);

  const isFavorite = favorites?.some((favorite) => {
    const favId = favorite.productId ? favorite.productId.toString() : favorite._id?.toString();
    return favId === book._id.toString();
  });

  const handleAddToCart = async () => {
    if (!currentUser || !currentUser.uid) {
      setAlertMessage('Please log in to add products to your cart.');
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/books/${book._id}`);
      const updatedBook = response.data;

      if (updatedBook.stock <= 0) {
        setAlertMessage("This product is out of stock.");
        setShowAlert(true);
        return;
      }

      const cartItem = cartItems.find(
        (item) => item.productId === book._id || item._id === book._id
      );
      const currentQtyInCart = cartItem?.quantity || 0;
      const allowedToAdd = updatedBook.stock - currentQtyInCart;

      if (allowedToAdd <= 0) {
        setAlertMessage("You've already added the maximum available stock for this product.");
        setShowAlert(true);
        return;
      }

      const itemPayload = {
        productId: updatedBook._id,
        title: updatedBook.title,
        coverImage: updatedBook.coverImage,
        newPrice: updatedBook.newPrice,
        quantity: 1,
      };

      dispatch(addToCartAsync({ userId: currentUser.uid.trim(), item: itemPayload }));
    } catch (error) {
      console.error("Error checking stock before adding to cart:", error);
      setAlertMessage("There was an error checking the stock. Please try again.");
      setShowAlert(true);
    }
  };

  const handleAddToFavorites = () => {
    if (currentUser && currentUser.uid) {
      if (isFavorite) {
        dispatch(removeFavoriteAsync({ userId: currentUser.uid.trim(), itemId: book._id }));
      } else {
        dispatch(addFavoriteAsync({ userId: currentUser.uid.trim(), item: book }));
      }
    } else {
      setAlertMessage('Please log in to manage favorites.');
      setShowAlert(true);
    }
  };

  const handleNotifyMe = () => {
    setAlertMessage("We'll notify you when this book is back in stock!");
    setShowAlert(true);
  };

  const handleBookClick = () => {
    navigate(`/book/${book._id}`);
  };

  return (
    <div className="relative">
      {/* Modal Alert */}
      {showAlert && (
  <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-800 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
      <p className="text-lg font-semibold text-red-600">{alertMessage}</p>
      <button 
        onClick={closeAlert}
        className="mt-4 px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition-all duration-150"
      >
        Close
      </button>
    </div>
  </div>
)}





      <div className="rounded-lg transition-shadow duration-300 w-full max-w-[200px] mx-auto my-0 shadow-lg hover:shadow-2xl relative">
        <div className="flex flex-col items-center gap-3 p-3 border rounded-md" style={{ backgroundColor: 'rgba(150, 150, 170, 0.3)' }}>
          <div className="h-32 w-32 border rounded-md overflow-hidden m-0">
            <div onClick={handleBookClick}>
              <img
                src={getImgUrl(book?.coverImage)}
                alt="Book cover"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-center w-full">
            <div onClick={handleBookClick}>
              <h3 className="text-sm font-semibold mb-2 truncate">
                {book?.title || 'No title available'}
              </h3>
            </div>

            <p className="text-gray-600 text-xs mb-2">
              {book?.description?.length > 50
                ? `${book.description.slice(0, 50)}...`
                : book?.description || 'No description available'}
            </p>

            <p className="font-medium mb-2 text-xs">
              ${book?.newPrice}
              <span className="line-through font-normal ml-2 text-xs">
                ${book?.oldPrice}
              </span>
            </p>

            {book.stock === 0 ? (
              <div className="flex flex-col items-center">
                <div className="text-red-600 font-bold text-lg">Sold Out</div>
              </div>
            ) : (
              <>
                {book.stock < 3 && (
                  <div className="mt-2 text-red-500 text-xs font-semibold">
                    Hurry up! Only {book.stock} left in stock.
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 whitespace-nowrap"
                  >
                    <FiShoppingCart size={14} />
                    <span className="truncate">Add to Cart</span>
                  </button>
                </div>
              </>
            )}

            <button
              onClick={handleAddToFavorites}
              className="absolute top-2 right-2 text-lg cursor-pointer z-10"
            >
              {isFavorite ? (
                <AiFillHeart className="text-red-500" />
              ) : (
                <AiOutlineHeart className="text-red-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
