import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import news1 from "../../assets/news/news-1.png";
import news2 from "../../assets/news/news-2.png";
import news3 from "../../assets/news/news-3.png";
import news4 from "../../assets/news/news-4.png";

const news = [
  {
    id: 1,
    title: "Global Climate Summit Calls for Urgent Action",
    description:
      "World leaders gather at the Global Climate Summit to discuss urgent strategies to combat climate change, focusing on reducing carbon emissions and fostering renewable energy solutions.",
    image: news1,
    portalLink: "https://www.bbc.com/news/science-environment-56901261",
  },
  {
    id: 2,
    title: "Breakthrough in AI Technology Announced",
    description:
      "A major breakthrough in artificial intelligence has been announced by researchers, with new advancements promising to revolutionize industries from healthcare to finance.",
    image: news2,
    portalLink: "https://www.wired.com/story/mira-murati-thinking-machines-lab/",
  },
  {
    id: 3,
    title: "AI-Powered Medicine: The Future of Healthcare",
    description:
      "A look at how AI technologies are transforming the healthcare sector, from diagnostics to personalized treatments.",
    image: news3,
    // Örnek: CNN üzerinden sağlık alanındaki genel bir haber sayfası
    portalLink: "https://www.cnn.com/health",
  },
  {
    id: 4,
    title: "Artificial Intelligence and the Future of Work",
    description:
      "Exploring the role AI is playing in shaping the future job market, from automation to new opportunities in tech industries.",
    image: news4,
    // Örnek: CNN üzerinden iş dünyasıyla ilgili genel bir haber sayfası
    portalLink: "https://www.cnn.com/business",
  },
  {
    id: 5,
    title: "The Evolution of Smart Cities: A Tech Revolution",
    description:
      "How the rise of AI, IoT, and automation is reshaping urban life and making cities more efficient, sustainable, and connected.",
    image: news2,
    // Örnek: CNN üzerinden teknoloji alanındaki genel bir haber sayfası
    portalLink: "https://www.cnn.com/tech",
  },
];

const News = () => {
  const swiperRef = useRef(null);

  return (
    <div className="py-16 max-w-[2000px] mx-auto relative">
      {/* Title */}
      <h2 className="text-4xl font-semibold mb-6" style={{ fontFamily: 'Lobster, cursive' }}>
        Latest News
      </h2>

      {/* Left and Right Scroll Buttons */}
      <div className="absolute top-1/2 left-[-50px] transform -translate-y-1/2 z-10">
        <button
          className="bg-[#F9A825] p-2 rounded-full shadow-md hover:bg-[#F9A825]"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <FiChevronLeft size={18} className="text-white" />
        </button>
      </div>

      <div className="absolute top-1/2 right-[-50px] transform -translate-y-1/2 z-10">
        <button
          className="bg-[#F9A825] p-2 rounded-full shadow-md hover:bg-[#F9A825]"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <FiChevronRight size={18} className="text-white" />
        </button>
      </div>

      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        navigation={false}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 40 },
          1024: { slidesPerView: 2, spaceBetween: 50 },
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        {news.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-6 rounded-xl overflow-hidden shadow-lg bg-gray-100 border-2 border-black p-4">
              {/* Content */}
              <div className="py-0 px-4">
                <h3 className="text-base font-medium hover:text-blue-500 mb-2 cursor-pointer">
                  <a href={item.portalLink} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                <div className="w-8 h-[3px] bg-primary mb-3"></div>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
              {/* Image */}
              <div className="flex-shrink-0 w-[150px] h-[150px] rounded-full overflow-hidden shadow-md">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default News;
