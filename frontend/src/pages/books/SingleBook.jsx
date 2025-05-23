import React, { useState, useEffect } from 'react';
import { HiOutlineHeart, HiHeart, HiOutlineShare } from 'react-icons/hi2';
import { useParams, Navigate } from 'react-router-dom';
import { getImgUrl } from '../../utils/getImgUrl';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../../redux/features/cart/cartSlice';
import { addFavoriteAsync, removeFavoriteAsync } from '../../redux/features/favorites/favoritesSlice';
import { useFetchBookByIdQuery } from '../../redux/features/books/booksApi';
import { useAuth } from '../../context/AuthContext';
import { IoNotifications } from 'react-icons/io5';
import axios from 'axios';

const SingleBook = () => {
  const { id } = useParams();
  const { data: book, isLoading, isError, error } = useFetchBookByIdQuery(id);
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);
  const { currentUser } = useAuth();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Favori kontrolü
  const isFavorite = favorites.some(
    (fav) => (fav.productId || fav._id).toString() === book?._id.toString()
  );

  // Review gönderme fonksiyonu
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please provide a rating before submitting.");
      return;
    }
    const newReview = {
      bookId: book._id,
      userId: currentUser.uid,
      reviewer: currentUser.displayName || currentUser.email || "Anonymous",
      rating,
      text: reviewText,
    };
    try {
      const response = await axios.post('http://localhost:5000/api/reviews', newReview);
      setReviews([response.data, ...reviews]);
      setReviewSubmitted(true);
      setRating(0);
      setReviewText('');
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    }
  };

  // Kitap için review'ları çekme
  const fetchReviewsForBook = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/book/${book._id}`);
      setReviews(response.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    if (book) {
      fetchReviewsForBook();
    }
  }, [book]);

  // Sepete ekleme fonksiyonu
  const handleAddToCart = (product) => {
    const productData = {
      productId: product._id,
      title: product.title,
      coverImage: product.coverImage,
      newPrice: product.newPrice,
      quantity: 1,
    };
    dispatch(addToCartAsync({ userId: currentUser.uid, item: productData }));
  };

  // Favori toggle fonksiyonu
  const handleFavoriteToggle = () => {
    if (currentUser && currentUser.uid) {
      if (isFavorite) {
        dispatch(removeFavoriteAsync({ userId: currentUser.uid.trim(), itemId: book._id.toString() }));
      } else {
        const favoriteData = {
          productId: book._id.toString(),
          title: book.title,
          coverImage: book.coverImage,
          newPrice: book.newPrice,
        };
        dispatch(addFavoriteAsync({ userId: currentUser.uid.trim(), item: favoriteData }));
      }
    } else {
      alert('Please log in to manage favorites.');
    }
  };

  // "Notify Me" butonuna basıldığında (örnek olarak alert)
  const handleNotifyMe = () => {
    // Gerçek uygulamada kullanıcı e-postası ve kitap bilgilerini API aracılığıyla kaydedebilirsiniz.
    alert("We'll notify you when this book is back in stock!");
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    console.error('Error fetching book data:', error);
    return <div>Error occurred: {error?.message || 'Unknown error'}</div>;
  }
  if (!book) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 shadow-xl bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Image and Icon Section */}
        <div className="flex items-start gap-4 ml-4">
          <div className="w-64 h-auto overflow-hidden">
            <img
              src={book.coverImage ? getImgUrl(book.coverImage) : '/default-image.jpg'}
              alt={book.title}
              className="w-full h-full object-cover transition-all duration-300 hover:scale-105 rounded-lg shadow-lg"
            />
          </div>
          <div className="flex flex-col gap-4 justify-start">
            <button
              onClick={handleFavoriteToggle}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-200 focus:outline-none transition-all duration-300"
            >
              {isFavorite ? (
                <HiHeart className="text-red-600" />
              ) : (
                <HiOutlineHeart className="text-gray-500" />
              )}
            </button>
            <button
              onClick={() => alert("Sharing feature coming soon!")}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-200 focus:outline-none transition-all duration-300"
            >
              <HiOutlineShare className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {/* Book Title */}
          <h1 className="text-4xl font-semibold text-gray-900 ">{book.title}</h1>
          {/* Book Details */}
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong className="font-semibold text-gray-800">Author:</strong> {book.author || 'Unknown'}</p>
            <p><strong className="font-semibold text-gray-800">Publisher:</strong> {book.publisher || 'Unknown Publisher'}</p>
            <p><strong className="font-semibold text-gray-800">Language:</strong> {book.language || 'English'}</p>
            <p><strong className="font-semibold text-gray-800">First Edition Year:</strong> {book.editionYear || 'N/A'}</p>
          </div>
          {/* Book Price */}
          <div className="text-3xl font-bold text-black mb-2">
            {book.newPrice ? `$${book.newPrice}` : 'Price not available'}
          </div>
          {/* Stock & Purchase Info */}
          {book.stock === 0 ? (
            <div className="mt-2">
              <div className="text-red-500 font-bold">Sold Out</div>
              <button
                           onClick={handleNotifyMe}
                           className="mt-2 flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition-all duration-200"
                         >
                          
                           <span>Notify me when back in stock</span>
                           <IoNotifications size={20} />
                         </button>
            </div>
          ) : (
            <>
              {book.stock < 5 && (
                <div className="mt-2 text-red-500 text-sm font-semibold">
                  Hurry up! Only {book.stock} left in stock.
                </div>
              )}
              <div className="flex gap-6 mb-6">
                <button
                  onClick={() => handleAddToCart(book)}
                  className="text-lg px-8 py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-xl hover:bg-yellow-600 focus:outline-none transition-all duration-200 transform hover:scale-105"
                >
                  Add to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Tabs for Description, Featured Details, and Reviews */}
      <div className="mt-12">
        <div className="flex justify-start space-x-12 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-xl font-semibold transition-all duration-300 ${activeTab === 'description' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('featuredDetails')}
            className={`pb-4 text-xl font-semibold transition-all duration-300 ${activeTab === 'featuredDetails' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
          >
            Featured Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-xl font-semibold transition-all duration-300 ${activeTab === 'reviews' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
          >
            Reviews
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800">Description</h2>
            <p className="text-gray-700 leading-relaxed">{book.description || 'No description available.'}</p>
          </div>
        )}

        {activeTab === 'featuredDetails' && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800">Featured Details</h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li><strong>Paper Type:</strong> {book.paperType || 'Standard'}</li>
              <li><strong>Page Count:</strong> {book.pageCount || 'N/A'}</li>
              <li><strong>Dimensions:</strong> {book.dimensions || 'N/A'}</li>
              <li><strong>First Edition Year:</strong> {book.editionYear || 'N/A'}</li>
              <li><strong>Edition Number:</strong> {book.editionNumber || 'N/A'}</li>
              <li><strong>Language:</strong> {book.language || 'English'}</li>
            </ul>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800">Reviews</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-6 mt-4">
              <div>
                <label htmlFor="rating" className="text-xl font-semibold text-gray-700">Rating</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-2xl ${rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="reviewText" className="text-xl font-semibold text-gray-700">Review</label>
                <textarea
                  id="reviewText"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows="4"
                  placeholder="Write your review..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none transition-all duration-200"
              >
                Submit Review
              </button>
            </form>

            <div className="mt-8 space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm relative">
                    <div className="flex items-center gap-2 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xl ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                    <p className="mt-2 text-gray-700"><strong>{review.reviewer}:</strong> {review.text}</p>
                    {currentUser && review.userId === currentUser.uid && (
                      <button
                        onClick={async () => {
                          try {
                            await axios.delete(`http://localhost:5000/api/reviews/${review._id}`);
                            setReviews(reviews.filter(r => r._id !== review._id));
                          } catch (err) {
                            console.error("Error deleting review:", err);
                            alert("Failed to delete review. Please try again.");
                          }
                        }}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        x
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to review this book!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleBook;
