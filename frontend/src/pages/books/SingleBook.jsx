import React, { useState } from 'react';
import { HiOutlineHeart, HiOutlineShare } from 'react-icons/hi2';
import { useParams, Navigate } from 'react-router-dom';
import { getImgUrl } from '../../utils/getImgUrl';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { addToFavorites, removeFromFavorites } from '../../redux/features/favorites/favoritesSlice';
import { useFetchBookByIdQuery } from '../../redux/features/books/booksApi';

const SingleBook = () => {
  const { id } = useParams();
  const { data: book, isLoading, isError, error } = useFetchBookByIdQuery(id);

  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviews, setReviews] = useState([]); // State to store reviews

  // Active tab state
  const [activeTab, setActiveTab] = useState('description');

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const handleFavoriteToggle = (book) => {
    const isFavorite = favorites.some(fav => fav.id === book.id);

    if (isFavorite) {
      dispatch(removeFromFavorites(book.id));
    } else {
      dispatch(addToFavorites(book));
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please provide a rating before submitting.");
      return;
    }

    const newReview = {
      rating,
      text: reviewText,
    };

    // Add the new review to the reviews list
    setReviews([...reviews, newReview]);
    
    console.log('Review submitted:', newReview);
    setReviewSubmitted(true); // Mark review as submitted
    setRating(0);
    setReviewText('');
  };

  if (isLoading) return <div>Loading...</div>;
  
  if (isError) {
    console.error('Error fetching book data:', error);
    return <div>Error occurred: {error?.message || 'Unknown error'}</div>;
  }

  if (!book) {
    return <Navigate to="/" />;  // Redirect to homepage if no book is found
  }

  return (
    <div className="max-w-3xl mx-auto p-8 shadow-xl bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="w-64 h-auto overflow-hidden ml-4 relative">
          <img
            src={book.coverImage ? getImgUrl(book.coverImage) : ''}
            alt={book.title}
            className="w-full h-full object-cover transition-all duration-300 hover:scale-105 rounded-lg shadow-lg"
          />

          {/* Favorite Icon */}
          <button
            onClick={() => handleFavoriteToggle(book)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-200 focus:outline-none transition-all duration-300"
          >
            <HiOutlineHeart className={favorites.some(fav => fav.id === book.id) ? 'text-red-600' : 'text-gray-500'} />
          </button>

          {/* Share Icon */}
          <button
            onClick={() => alert("Sharing feature coming soon!")}
            className="absolute top-16 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-200 focus:outline-none transition-all duration-300"
          >
            <HiOutlineShare className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Book Title */}
          <h1 className="text-4xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-300">{book.title}</h1>

          {/* Book Author, Publisher, and Other Information */}
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong className="font-semibold text-gray-800">Author:</strong> {book.author || 'Unknown'}</p>
            <p><strong className="font-semibold text-gray-800">Publisher:</strong> {book.publisher || 'Unknown Publisher'}</p>
            <p><strong className="font-semibold text-gray-800">Language:</strong> {book.language || 'English'}</p>
            <p><strong className="font-semibold text-gray-800">First Edition Year:</strong> {book.editionYear || 'N/A'}</p>
          </div>

          {/* Book Price */}
          <div className="text-3xl font-bold text-black mb-6">
            {book.newPrice ? `$${book.newPrice}` : 'Price not available'}
          </div>

          {/* Add to Cart Button */}
          <div className="flex gap-6 mb-6">
            <button
              onClick={() => handleAddToCart(book)}
              className="text-lg px-8 py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-xl hover:bg-yellow-600 focus:outline-none transition-all duration-200 transform hover:scale-105"
            >
              Add to Cart
            </button>
          </div>
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

        {/* Conditional Rendering Based on Active Tab */}
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
            {/* Review Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-6">
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

            {/* Display Reviews */}
            <div className="mt-8 space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xl ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                    <p className="mt-2 text-gray-700">{review.text}</p>
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
