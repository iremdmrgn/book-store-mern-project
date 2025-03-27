// src/dashboard/components/ManageBooks.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { getImgUrl } from '../../utils/getImgUrl';

// Set the app element for accessibility
Modal.setAppElement('#root');

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for search, category filter, and sorting order
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'asc' or 'desc'

  // Modal and editing book state (added "stock" field)
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [editingData, setEditingData] = useState({
    title: '',
    category: '',
    oldPrice: '',
    newPrice: '',
    stock: '', // new stock field
    description: '',
    author: '',
    publisher: '',
    language: '',
    editionYear: '',
    pageCount: '',
    dimensions: '',
    editionNumber: '',
    paperType: '',
    coverImage: '' // current cover image path
  });

  // For new image selection
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Error fetching books");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (book) => {
    setEditingBookId(book._id);
    setEditingData({
      title: book.title,
      category: book.category,
      oldPrice: book.oldPrice,
      newPrice: book.newPrice,
      stock: book.stock, // set the stock value
      description: book.description,
      author: book.author,
      publisher: book.publisher,
      language: book.language,
      editionYear: book.editionYear,
      pageCount: book.pageCount,
      dimensions: book.dimensions,
      editionNumber: book.editionNumber,
      paperType: book.paperType,
      coverImage: book.coverImage // current image
    });
    setSelectedImage(null);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingBookId(null);
    setEditingData({
      title: '',
      category: '',
      oldPrice: '',
      newPrice: '',
      stock: '', // reset stock
      description: '',
      author: '',
      publisher: '',
      language: '',
      editionYear: '',
      pageCount: '',
      dimensions: '',
      editionNumber: '',
      paperType: '',
      coverImage: ''
    });
    setSelectedImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      let response;
      if (selectedImage) {
        const formData = new FormData();
        for (let key in editingData) {
          formData.append(key, editingData[key]);
        }
        formData.append('coverImageFile', selectedImage);
        response = await axios.put(
          `http://localhost:5000/api/books/edit/${editingBookId}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              // Content-Type header will be set automatically
            }
          }
        );
      } else {
        response = await axios.put(
          `http://localhost:5000/api/books/edit/${editingBookId}`,
          editingData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book._id === editingBookId ? response.data.book : book
        )
      );
      toast.success("Book updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update book");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/books/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setBooks((prevBooks) => prevBooks.filter((book) => book._id !== id));
      toast.success("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    }
  };

  // Order fonksiyonu dashboard'da artık kullanılmıyor, siparişler satış sayfasından alınıyor.
  // Bu yüzden ilgili buton ve fonksiyon kaldırıldı.

  if (loading) return <Loading />;

  // Get unique categories from the books
  const categories = [...new Set(books.map((book) => book.category))];

  // Filter by search query (title) and category
  let filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (selectedCategory) {
    filteredBooks = filteredBooks.filter((book) => book.category === selectedCategory);
  }

  // Sort by price if required
  if (sortOrder === 'asc') {
    filteredBooks = filteredBooks.slice().sort((a, b) => a.newPrice - b.newPrice);
  } else if (sortOrder === 'desc') {
    filteredBooks = filteredBooks.slice().sort((a, b) => b.newPrice - a.newPrice);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Manage Books</h2>

      {/* Search, Category Filter, and Price Sort */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4">
        <input
          type="text"
          placeholder="Search by book title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded"
        >
          <option value="default">Price Sorting</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left">Cover</th>
            <th className="px-6 py-3 text-left">Title</th>
            <th className="px-6 py-3 text-left">Category</th>
            <th className="px-6 py-3 text-left">Price</th>
            <th className="px-6 py-3 text-left">Stock</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredBooks.map((book) => (
            <tr key={book._id}>
              <td className="px-6 py-4">
                <img
                  src={getImgUrl(book.coverImage)}
                  alt={book.title}
                  className="w-32 h-32 object-cover rounded-lg shadow-lg"
                />
              </td>
              <td className="px-6 py-4">{book.title}</td>
              <td className="px-6 py-4">{book.category}</td>
              <td className="px-6 py-4">
                ${book.newPrice}{" "}
                <span className="line-through font-normal ml-2 text-xs">
                  ${book.oldPrice}
                </span>
              </td>
              <td className="px-6 py-4">{book.stock}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => openModal(book)}
                    className="text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                  {/* "Order" butonu kaldırıldı; sipariş işlemleri satış sayfasında gerçekleştiriliyor */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Editing Book Details */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Book"
        style={{
          content: {
            width: '80%',
            maxWidth: '1000px',
            margin: 'auto',
            padding: '1.5rem',
            borderRadius: '0.5rem'
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
      >
        <h3 className="text-3xl font-bold mb-4">Edit Book Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={editingData.title}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              value={editingData.category}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">New Price</label>
            <input
              type="number"
              name="newPrice"
              value={editingData.newPrice}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Old Price</label>
            <input
              type="number"
              name="oldPrice"
              value={editingData.oldPrice}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
            />
          </div>
          {/* New Stock Field */}
          <div className="mb-4">
            <label className="block text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              value={editingData.stock}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
            />
          </div>
          <div className="mb-4 col-span-2">
            <label className="block text-gray-700">Description</label>
            <textarea
              name="description"
              value={editingData.description}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
              placeholder="Enter description"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Author</label>
            <input
              type="text"
              name="author"
              value={editingData.author}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
              placeholder="Enter author"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Publisher</label>
            <input
              type="text"
              name="publisher"
              value={editingData.publisher}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
              placeholder="Enter publisher"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Language</label>
            <input
              type="text"
              name="language"
              value={editingData.language}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
              placeholder="Enter language"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Edition Year</label>
            <input
              type="text"
              name="editionYear"
              value={editingData.editionYear}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
              placeholder="Enter edition year"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Page Count</label>
            <input
              type="number"
              name="pageCount"
              value={editingData.pageCount}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
              placeholder="Enter page count"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Dimensions</label>
            <input
              type="text"
              name="dimensions"
              value={editingData.dimensions}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
              placeholder="Enter dimensions"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Edition Number</label>
            <input
              type="text"
              name="editionNumber"
              value={editingData.editionNumber}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
              placeholder="Enter edition number"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Paper Type</label>
            <input
              type="text"
              name="paperType"
              value={editingData.paperType}
              onChange={handleInputChange}
              className="w-full p-1 border rounded"
              placeholder="Enter paper type"
            />
          </div>
          {/* Cover Image Update */}
          <div className="mb-4 col-span-2">
            <label className="block text-gray-700">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-1 border rounded"
            />
            {selectedImage ? (
              <div className="mt-2 w-32 h-32">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="New Cover Preview"
                  className="w-full h-full object-cover rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                />
              </div>
            ) : editingData.coverImage ? (
              <div className="mt-2 w-32 h-32">
                <img
                  src={getImgUrl(editingData.coverImage)}
                  alt="Current Cover"
                  className="w-full h-full object-cover rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                />
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No cover image available</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition-all duration-200"
          >
            Save
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageBooks;
