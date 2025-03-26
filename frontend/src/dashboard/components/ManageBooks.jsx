import React from 'react';
import { useFetchAllBooksQuery, useDeleteBookMutation, useUpdateBookMutation } from '../../redux/features/books/booksApi';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { getImgUrl } from '../../utils/getImgUrl';

Modal.setAppElement('#root');

const ManageBooks = () => {
  // Use RTK Query hook to fetch books
  const { data: books = [], isLoading } = useFetchAllBooksQuery();
  const [deleteBook] = useDeleteBookMutation();
  const [updateBook] = useUpdateBookMutation();

  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('default');

  // Modal and editing book state
  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [editingBookId, setEditingBookId] = React.useState(null);
  const [editingData, setEditingData] = React.useState({
    title: '',
    category: '',
    oldPrice: '',
    newPrice: '',
    stock: '',
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
  const [selectedImage, setSelectedImage] = React.useState(null);

  const openModal = (book) => {
    setEditingBookId(book._id);
    setEditingData({
      title: book.title,
      category: book.category,
      oldPrice: book.oldPrice,
      newPrice: book.newPrice,
      stock: book.stock,
      description: book.description,
      author: book.author,
      publisher: book.publisher,
      language: book.language,
      editionYear: book.editionYear,
      pageCount: book.pageCount,
      dimensions: book.dimensions,
      editionNumber: book.editionNumber,
      paperType: book.paperType,
      coverImage: book.coverImage
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
      stock: '',
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
      let response;
      if (selectedImage) {
        const formData = new FormData();
        for (let key in editingData) {
          formData.append(key, editingData[key]);
        }
        formData.append('coverImageFile', selectedImage);
        response = await updateBook({ id: editingBookId, ...editingData, coverImageFile: selectedImage }).unwrap();
      } else {
        response = await updateBook({ id: editingBookId, ...editingData }).unwrap();
      }
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
      await deleteBook(id).unwrap();
      toast.success("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    }
  };

  // Place order function (using axios as before)
  const handlePlaceOrder = async (book) => {
    const orderQuantity = parseInt(prompt("Enter order quantity:"), 10);
    if (isNaN(orderQuantity) || orderQuantity <= 0) {
      toast.error("Invalid order quantity");
      return;
    }
    if (orderQuantity > book.stock) {
      toast.error("Not enough stock available");
      return;
    }
    
    const orderData = {
      name: "Test Customer",
      email: "test@example.com",
      address: { 
        city: "Test City", 
        country: "Test Country", 
        state: "Test State", 
        zipcode: "00000" 
      },
      phone: "1234567890",
      items: [
        {
          productId: book._id,
          title: book.title,
          coverImage: book.coverImage,
          price: book.newPrice,
          quantity: orderQuantity,
        }
      ],
      totalPrice: book.newPrice * orderQuantity,
    };
    
    try {
      await axios.post("http://localhost:5000/api/orders", orderData, {
        headers: { "Content-Type": "application/json" }
      });
      toast.success("Order placed successfully!");
      // With RTK Query and tag invalidation, the Books cache will refetch automatically.
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    }
  };

  if (isLoading) return <Loading />;

  // Filter and sort the books
  const categories = [...new Set(books.map((book) => book.category))];
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory ? book.category === selectedCategory : true)
  );
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortOrder === 'asc') return a.newPrice - b.newPrice;
    if (sortOrder === 'desc') return b.newPrice - a.newPrice;
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Manage Books</h2>
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
            <option key={cat} value={cat}>{cat}</option>
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
          {sortedBooks.map((book) => (
            <tr key={book._id}>
              <td className="px-6 py-4">
                <img src={getImgUrl(book.coverImage)} alt={book.title} className="w-32 h-32 object-cover rounded-lg shadow-lg" />
              </td>
              <td className="px-6 py-4">{book.title}</td>
              <td className="px-6 py-4">{book.category}</td>
              <td className="px-6 py-4">
                ${book.newPrice} <span className="line-through font-normal ml-2 text-xs">${book.oldPrice}</span>
              </td>
              <td className="px-6 py-4">{book.stock}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => openModal(book)} className="text-blue-500">Edit</button>
                  <button onClick={() => handleDelete(book._id)} className="text-red-500">Delete</button>
                  <button onClick={() => handlePlaceOrder(book)} className="text-purple-500">Order</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Book"
        style={{
          content: { width: '80%', maxWidth: '1000px', margin: 'auto', padding: '1.5rem', borderRadius: '0.5rem' },
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }}
      >
        <h3 className="text-3xl font-bold mb-4">Edit Book Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input type="text" name="title" value={editingData.title} onChange={handleInputChange} className="w-full p-1 border rounded" />
          </div>
          {/* Other fields are similar... */}
          <div className="mb-4">
            <label className="block text-gray-700">Stock</label>
            <input type="number" name="stock" value={editingData.stock} onChange={handleInputChange} className="w-full p-1 border rounded" />
          </div>
          <div className="mb-4 col-span-2">
            <label className="block text-gray-700">Cover Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-1 border rounded" />
            {selectedImage ? (
              <div className="mt-2 w-32 h-32">
                <img src={URL.createObjectURL(selectedImage)} alt="New Cover Preview" className="w-full h-full object-cover rounded-lg shadow-lg transition-all duration-300 hover:scale-105" />
              </div>
            ) : editingData.coverImage ? (
              <div className="mt-2 w-32 h-32">
                <img src={getImgUrl(editingData.coverImage)} alt="Current Cover" className="w-full h-full object-cover rounded-lg shadow-lg transition-all duration-300 hover:scale-105" />
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No cover image available</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={handleSave} className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition-all duration-200">Save</button>
          <button onClick={closeModal} className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600 transition-all duration-200">Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageBooks;
