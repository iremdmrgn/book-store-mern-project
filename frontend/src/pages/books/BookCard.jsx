import React from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { getImgUrl } from '../../utils/getImgUrl';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../../redux/features/cart/cartSlice';
import { addFavoriteAsync, removeFavoriteAsync } from '../../redux/features/favorites/favoritesSlice';
import { useAuth } from '../../context/AuthContext';

const BookCard = ({ book }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const favorites = useSelector((state) => state.favorites.items);

  // Favoriler arasında kontrol yaparken, hem favorite.productId hem de book._id tanımlı mı diye kontrol ediyoruz.
  const isFavorite = favorites?.some((favorite) => {
    if (!favorite.productId || !book._id) return false;
    return favorite.productId.toString() === book._id.toString();
  });

  // Ürünü sepete eklemek için gerekli payload'ı oluşturun
  const handleAddToCart = () => {
    if (currentUser && currentUser.uid) {
      const itemPayload = {
        productId: book._id, // Backend'in beklediği alan
        title: book.title,
        coverImage: book.coverImage,
        newPrice: book.newPrice,
        quantity: 1,
      };
      dispatch(addToCartAsync({ userId: currentUser.uid.trim(), item: itemPayload }));
    } else {
      alert('Please log in to add products to your cart.');
    }
  };

  // Favorilere ekleme/kaldırma işlemi asenkron thunk ile yapılır.
  const handleAddToFavorites = () => {
    console.log("Favorite button clicked for:", book);
    if (currentUser && currentUser.uid) {
      if (isFavorite) {
        dispatch(removeFavoriteAsync({ userId: currentUser.uid.trim(), itemId: book._id }));
      } else {
        dispatch(addFavoriteAsync({ userId: currentUser.uid.trim(), item: book }));
      }
    } else {
      alert('Please log in to manage favorites.');
    }
  };

  const handleBookClick = () => {
    navigate(`/book/${book._id}`);
  };

  return (
    <div className="rounded-lg transition-shadow duration-300 w-full max-w-[200px] mx-auto my-0 shadow-lg hover:shadow-2xl relative">
      <div className="flex flex-col items-center gap-3 p-3 border rounded-md" style={{ backgroundColor: 'rgba(150, 150, 170, 0.3)' }}>
        <div className="h-32 w-32 border rounded-md overflow-hidden m-0">
          <div onClick={handleBookClick}>
            <img
              src={getImgUrl(book?.coverImage) || '/default-image.jpg'}
              alt="Book cover"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-center w-full">
          <div onClick={handleBookClick}>
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
              onClick={handleAddToCart}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 whitespace-nowrap"
            >
              <FiShoppingCart size={14} />
              <span className="truncate">Add to Cart</span>
            </button>
          </div>

          <button
            onClick={handleAddToFavorites}
            className="absolute top-2 right-2 text-lg cursor-pointer z-10"
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
