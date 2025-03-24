// src/dashboard/components/AddBook.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    trending: false,
    oldPrice: '',
    newPrice: '',
    author: '',
    publisher: '',
    language: '',
    editionYear: '',
    pageCount: '',
    dimensions: '',
    editionNumber: '',
    paperType: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      // Metin verilerini ekle
      for (let key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      // Dosya varsa ekle
      if (imageFile) {
        formDataToSend.append('coverImageFile', imageFile);
      }

      await axios.post('http://localhost:5000/api/books/create-book', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      Swal.fire("Book added successfully!", "", "success");
      // Formu sıfırla
      setFormData({
        title: '',
        description: '',
        category: '',
        trending: false,
        oldPrice: '',
        newPrice: '',
        author: '',
        publisher: '',
        language: '',
        editionYear: '',
        pageCount: '',
        dimensions: '',
        editionNumber: '',
        paperType: ''
      });
      setImageFile(null);
    } catch (error) {
      console.error(error);
      Swal.fire("Failed to add book.", "", "error");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Add New Book</h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter book title"
          />
        </div>
        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter book description"
          />
        </div>
        {/* Category */}
        <div className="mb-4">
          <label className="block text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter category"
          />
        </div>
        {/* Trending Checkbox */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="trending"
              checked={formData.trending}
              onChange={handleChange}
              className="rounded text-blue-600"
            />
            <span className="ml-2 text-sm font-semibold text-gray-700">Trending</span>
          </label>
        </div>
        {/* Old Price */}
        <div className="mb-6">
          <label className="block text-gray-700">Old Price</label>
          <input
            type="number"
            name="oldPrice"
            value={formData.oldPrice}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter old price"
          />
        </div>
        {/* New Price */}
        <div className="mb-4">
          <label className="block text-gray-700">New Price</label>
          <input
            type="number"
            name="newPrice"
            value={formData.newPrice}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter new price"
          />
        </div>
        {/* Author */}
        <div className="mb-4">
          <label className="block text-gray-700">Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter author"
          />
        </div>
        {/* Publisher */}
        <div className="mb-4">
          <label className="block text-gray-700">Publisher</label>
          <input
            type="text"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter publisher"
          />
        </div>
        {/* Language */}
        <div className="mb-4">
          <label className="block text-gray-700">Language</label>
          <input
            type="text"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter language"
          />
        </div>
        {/* Edition Year */}
        <div className="mb-4">
          <label className="block text-gray-700">Edition Year</label>
          <input
            type="text"
            name="editionYear"
            value={formData.editionYear}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter edition year"
          />
        </div>
        {/* Page Count */}
        <div className="mb-4">
          <label className="block text-gray-700">Page Count</label>
          <input
            type="number"
            name="pageCount"
            value={formData.pageCount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter page count"
          />
        </div>
        {/* Dimensions */}
        <div className="mb-4">
          <label className="block text-gray-700">Dimensions</label>
          <input
            type="text"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter dimensions"
          />
        </div>
        {/* Edition Number */}
        <div className="mb-4">
          <label className="block text-gray-700">Edition Number</label>
          <input
            type="text"
            name="editionNumber"
            value={formData.editionNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter edition number"
          />
        </div>
        {/* Paper Type */}
        <div className="mb-4">
          <label className="block text-gray-700">Paper Type</label>
          <input
            type="text"
            name="paperType"
            value={formData.paperType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter paper type"
          />
        </div>
        {/* Cover Image Upload */}
        <div className="mb-4">
          <label className="block text-gray-700">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          {imageFile && (
            <div className="mt-2 w-32 aspect-square">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Cover Preview"
                className="w-full h-full object-cover rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
              />
            </div>
          )}
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Add Book
        </button>
      </form>
    </div>
  );
};

export default AddBook;
