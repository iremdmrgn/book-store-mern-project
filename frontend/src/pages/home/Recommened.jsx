import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import BookCard from '../books/BookCard';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Recommened = () => {
  const { data: books = [] } = useFetchAllBooksQuery();
  const swiperRef = useRef(null);

  // Duplike edilmiş kitaplar
  const duplicatedBooks = [...books.slice(8, 18), ...books.slice(8, 18), ...books.slice(8, 18)];

  return (
    <div className="py-16 max-w-[1300px] mx-auto relative">
      {/* Title */}
      <h2 className="text-3xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
        Recommended for you
      </h2>

      {/* Left and Right Scroll Buttons */}
      <div className="absolute top-1/2 left-[-50px] transform -translate-y-1/2 z-10">
        <button
          className="bg-[#F9A825] p-2 rounded-full shadow-md hover:bg-[#F9A825]"
          onClick={() => swiperRef.current?.slidePrev()} // Swiper'ı sola kaydır
        >
          <FiChevronLeft size={24} className="text-white" />
        </button>
      </div>

      <div className="absolute top-1/2 right-[-50px] transform -translate-y-1/2 z-10">
        <button
          className="bg-[#F9A825] p-2 rounded-full shadow-md hover:bg-[#F9A825]"
          onClick={() => swiperRef.current?.slideNext()} // Swiper'ı sağa kaydır
        >
          <FiChevronRight size={24} className="text-white" />
        </button>
      </div>

      <Swiper
        slidesPerView={1}
        spaceBetween={20}
        navigation={false}
        loop={true} // Loop özelliği aktif
        loopAdditionalSlides={2} // Ekstra kaydırılabilir öğe
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
          1180: { slidesPerView: 4, spaceBetween: 30 },
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        {
          duplicatedBooks.length > 0 && duplicatedBooks.map((book, index) => (
            <SwiperSlide key={index} className="!w-auto flex justify-center p-0 m-0">
              <BookCard book={book} />
            </SwiperSlide>
          ))
        }
      </Swiper>
    </div>
  );
};

export default Recommened;
