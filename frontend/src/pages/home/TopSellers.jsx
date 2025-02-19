import React, { useState, useRef } from 'react';
import BookCard from '../books/BookCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const categories = ["Business", "Fiction", "Horror", "Adventure"];

const TopSellers = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { data: books = [] } = useFetchAllBooksQuery();

  // Filtering books based on selected category
  const filteredBooks = books.filter((book) => {
    if (selectedCategory) {
      return book.category === selectedCategory.toLowerCase();
    }
    return true;
  });

  const swiperRef = useRef(null);

  // Duplike edilmiş kitaplar
  const duplicatedBooks = [...filteredBooks, ...filteredBooks, ...filteredBooks]; // Öğeleri kopyalar

  return (
    <div className="py-10 max-w-[1300px] mx-auto relative">
      {/* Title */}
      <h2 className="text-3xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
        Top Sellers
      </h2>

      {/* Category Selection */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex gap-4">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`px-6 py-3 rounded-full transition-all duration-300 font-semibold text-sm 
                ${selectedCategory === category 
                  ? 'bg-gradient-to-r from-[#F9A825] to-[#FFBC00] text-white' 
                  : 'bg-[#EAEAEA] text-gray-700'} 
                hover:bg-[#F9A825] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#F9A825]`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Left and Right Scroll Buttons */}
      <div className="absolute top-1/2 left-[-40px] transform -translate-y-1/2 z-10">
        <button
          className="bg-[#F9A825] p-2 rounded-full shadow-md hover:bg-[#F9A825] text-sm"
          onClick={() => swiperRef.current?.slidePrev()} // Swiper'ı sola kaydır
        >
          <FiChevronLeft size={20} className="text-white" />
        </button>
      </div>

      <div className="absolute top-1/2 right-[-40px] transform -translate-y-1/2 z-10">
        <button
          className="bg-[#F9A825] p-2 rounded-full shadow-md hover:bg-[#F9A825] text-sm"
          onClick={() => swiperRef.current?.slideNext()} // Swiper'ı sağa kaydır
        >
          <FiChevronRight size={20} className="text-white" />
        </button>
      </div>

      <Swiper
        slidesPerView={4}
        spaceBetween={20}
        navigation={false}
        loop={true}
        loopAdditionalSlides={2} // Ekstra kaydırılabilir öğe ekleyebilirsiniz
        onSwiper={(swiper) => (swiperRef.current = swiper)} 
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 10 },
          768: { slidesPerView: 2, spaceBetween: 15 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
          1180: { slidesPerView: 4, spaceBetween: 25 },
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        {duplicatedBooks.length > 0 &&
          duplicatedBooks.map((book, index) => (
            <SwiperSlide key={index} className="!w-auto flex justify-center p-0 m-0">
              <BookCard book={book} />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};

export default TopSellers;
