import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const SearchPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();  // URL'yi değiştirmek için kullanacağız
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      const query = new URLSearchParams(search).get("query");
      if (query) {
        setLoading(true);
        setError(null); // Yeni arama yapıldığında hata durumunu sıfırlıyoruz
        try {
          const response = await axios.get(`http://localhost:5000/api/books/search`, {
            params: { query },
          });
          setResults(response.data);
        } catch (error) {
          console.error("Search error:", error);
          setError("An error occurred while fetching search results.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSearchResults();
  }, [search]); // search parametre değiştiğinde arama işlemini tekrar yap

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Formun sayfayı yenilemesini engeller
    const query = e.target.query.value;
    if (query) {
      navigate(`/search?query=${query}`); // Yeni arama için URL'yi değiştiriyoruz
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Search Results</h2>

      {/* Arama Formu */}
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          name="query"
          placeholder="Search for books"
          defaultValue={new URLSearchParams(search).get("query") || ""}
          className="border p-2 rounded-md"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          Search
        </button>
      </form>

      {/* Arama Sonuçları */}
      {results.length > 0 ? (
        <ul>
          {results.map((book) => (
            <li key={book._id}>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchPage;