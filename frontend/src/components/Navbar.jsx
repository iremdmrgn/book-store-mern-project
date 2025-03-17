import { Link, useNavigate } from "react-router-dom";
import { HiOutlineHeart, HiOutlineShoppingCart } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";
import { GiBurningBook } from "react-icons/gi";
import { FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { useFetchAllBooksQuery } from "../redux/features/books/booksApi"; // Added hook
import { fetchCart } from "../redux/features/cart/cartSlice"; // Eklendi
import { fetchFavorites } from "../redux/features/favorites/favoritesSlice"; // Yeni: Favoriler için thunk

// Import the function to get image URLs like in BookCard
import { getImgUrl } from '../utils/getImgUrl';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const favorites = useSelector((state) => state.favorites.items);
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: books, isLoading } = useFetchAllBooksQuery(); // Fetch all books

  // Total quantity: tüm ürünlerin quantity değerlerinin toplamı
  const totalCartQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Kullanıcı giriş yaptıktan sonra sepet ve favori verilerini güncelle
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      dispatch(fetchCart(currentUser.uid.trim()));
      dispatch(fetchFavorites(currentUser.uid.trim()));
    }
  }, [currentUser, dispatch]);

  // Search handler to filter books based on search query
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {  // Trigger after typing 1 character
      const results = books.filter((book) =>
        book.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  };

  const handleSearchClick = (bookId) => {
    navigate(`/book/${bookId}`); // Navigate to SingleBook page
    setSearchQuery(""); 
    setFilteredResults([]);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{ backgroundColor: "rgb(250, 248, 230)" }}
      className={`w-full fixed top-0 left-0 z-50 shadow-md transition-all duration-300 ${isVisible ? "opacity-100" : "opacity-0"} ${isVisible ? "transform-none" : "transform -translate-y-full"} shadow-lg`}
    >
      <nav className="flex justify-between items-center py-4 px-6 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex flex-col items-center gap-1">
            <GiBurningBook size={55} />
            <span className="text-xl font-serif font-semibold text-black">Leaf & Chapter</span>
          </Link>

          {/* Search Bar */}
          <div className="relative w-80 mt-12">
            <IoSearchOutline className="absolute left-3 inset-y-2" />
            <input
              type="text"
              placeholder="Search here"
              className="bg-[#EAEAEA] w-full py-1 md:px-8 px-2 rounded-md border border-black focus:outline-none"
              value={searchQuery}
              onChange={handleSearch}
            />
            {!isLoading && filteredResults.length > 0 && (
              <div className="absolute left-0 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto">
                {filteredResults.map((book, index) => (
                  <Link
                    key={index}
                    to={`/book/${book._id}`}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => handleSearchClick(book._id)}
                  >
                    <img
                      src={getImgUrl(book.coverImage) || 'path-to-default-image.png'}
                      alt={book.title}
                      className="w-12 h-16 object-cover"
                    />
                    <span>{book.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Icons on the right */}
        <div className="flex items-center gap-2 ml-auto mt-12">
          {/* Favorites Icon */}
          <Link to="/favorites" className="relative flex items-center">
            <HiOutlineHeart className="text-2xl text-gray-700 hover:text-gray-900 transition duration-300" />
            {favorites.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="relative flex items-center bg-primary p-1 sm:px-4 px-3 rounded-sm hover:bg-[#F9A825] transition duration-300">
            <HiOutlineShoppingCart className="text-2xl text-gray-700 hover:text-white transition duration-300" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
              {totalCartQuantity}
            </span>
          </Link>

          {/* Profile Icon */}
          <div className="flex items-center">
            {currentUser ? (
              <Link to="/profile" className="text-gray-700 hover:text-gray-900 transition duration-300">
                <FaUser className="text-2xl" />
              </Link>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-gray-900 transition duration-300">
                <HiOutlineUser className="text-2xl" />
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
