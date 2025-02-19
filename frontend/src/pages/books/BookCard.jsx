import React from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { getImgUrl } from '../../utils/getImgUrl';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { addToFavorites, removeFromFavorites } from '../../redux/features/favorites/favoritesSlice';

const BookCard = ({ book }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  
  // Select the favorite books from the Redux store
  const favorites = useSelector((state) => state.favorites.items);

  // Check if the current book is in the favorites list
  const isFavorite = favorites?.some((favorite) => favorite._id === book._id);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const handleAddToFavorites = (product) => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product)); // If it's already a favorite, remove it
    } else {
      dispatch(addToFavorites(product)); // Otherwise, add it to favorites
    }
  };

  const handleBookClick = () => {
    navigate(`/book/${book._id}`); // Navigate to the SingleBook page
  };

  return (
    <div className="rounded-lg transition-shadow duration-300 w-full max-w-[200px] mx-auto my-0 shadow-lg hover:shadow-2xl relative">
      <div className="flex flex-col items-center gap-3 p-3 border rounded-md" 
           style={{ backgroundColor: 'rgba(150, 150, 170, 0.3)' }}> {/* Soft gray-blue background */}
        <div className="h-32 w-32 border rounded-md overflow-hidden m-0">
          <div onClick={handleBookClick}> {/* Trigger navigation on image click */}
            <img
              src={getImgUrl(book?.coverImage) || '/default-image.jpg'} 
              alt="Book cover"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-center w-full">
          <div onClick={handleBookClick}> {/* Trigger navigation on title click */}
            <h3 className="text-sm font-semibold hover:text-blue-600 mb-2 truncate">
              {book?.title || 'No title available'}
            </h3>
          </div>
          <p className="text-gray-600 text-xs mb-2">
            {book?.description?.length > 50
              ? `${book.description.slice(0, 50)}...`
              : book?.description || 'No description available'}
          </p>
          <p className="font-medium mb-2 text-xs">
            ${book?.newPrice}{" "}
            <span className="line-through font-normal ml-2 text-xs">
              ${book?.oldPrice}
            </span>
          </p>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAddToCart(book)}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 whitespace-nowrap"
            >
              <FiShoppingCart size={14} />
              <span className="truncate">Add to Cart</span>
            </button>
          </div>

          {/* Heart icon positioned at top-right corner */}
          <button
            onClick={() => handleAddToFavorites(book)}
            className="absolute top-2 right-2 text-lg"
          >
            {isFavorite ? (
              <FiHeart className="text-red-500 fill-current" />
            ) : (
              <FiHeart className="text-red-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
