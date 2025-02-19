import React, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import bannerImg1 from "../../assets/banner.png";
import bannerImg2 from "../../assets/valentines-sale.png";
import bannerImg3 from "../../assets/winter-sale.png";
import valentinesImg2 from "../../assets/valentines-sale2.png"; // New Valentine's image
import winterImg2 from "../../assets/winter-sale2.png"; // New Winter image
import forbanner from "../../assets/forbanner.png"; // Yeni görsel

const Banner = ({ setBackgroundColor }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    draggable: true,
    beforeChange: (current, next) => {
      setCurrentSlide(next);
      setBackgroundColor(banners[next].bgColor);
    }
  };

  const banners = [
    {
      title: "New Releases This Week",
      description: "Discover the hottest new releases and add fresh titles to your reading list this week. From thrilling adventures to heartfelt stories, find your next great read.",
      imgSrc: bannerImg1,
      bgColor: "#001f3d",
      showSubscribe: true
    },
    {
      title: "Valentine's Day Sale",
      description: "Fall in love with our exclusive Valentine's Day discounts. Find the perfect romantic novel or gift for your special someone!",
      imgSrc: bannerImg2,
      bgColor: "#FFB6C1",
      showSubscribe: false
    },
    {
      title: "Winter Book Sale!!",
      description: "Stay warm with great reads at unbeatable prices. Enjoy discounts on cozy novels perfect for winter nights.",
      imgSrc: bannerImg3,
      imgSrcAlt: winterImg2, // New Winter image
      bgColor: "#ADD8E6",
      showSubscribe: false
    },
  ];

  useEffect(() => {
    setBackgroundColor(banners[0].bgColor);
  }, [setBackgroundColor]);

  return (
    <div
      className="relative w-full h-full mx-auto overflow-hidden py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Slider ref={sliderRef} {...settings}>
        {banners.map((banner, index) => (
          <div
            key={index}
            className="flex justify-center items-center flex-col md:flex-row-reverse w-full h-full px-4 relative slick-slide"
            style={{ backgroundColor: banner.bgColor }}
          >
            {/* Special layout for the second slide */}
            {index === 1 ? (
              <div className="flex flex-col md:flex-row items-center justify-center text-center w-full relative z-20">
                {/* Left image */}
                <div className="md:w-1/4 w-full flex items-center justify-center z-20">
                  <img
                    src={valentinesImg2}
                    alt="Valentine's Sale Extra"
                    className="w-full h-[250px] object-contain rounded-3xl"
                  />
                </div>

                {/* Text content */}
                <div className="md:w-1/2 w-full flex flex-col items-center justify-center text-center z-20">
                  <h1
                    className={`md:text-6xl text-3xl font-bold mb-4 leading-tight tracking-wide text-[#C71585]`}
                    style={{
                      fontFamily: "Lobster, sans-serif",
                      maxWidth: "90%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {banner.title}
                    <span className="text-[#FF69B4] text-5xl ml-4 mt-[-30px]">💖</span>
                  </h1>
                  <p
                    className="text-xl mb-6 text-[#8B008B]"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    {banner.description}
                  </p>
                </div>

                {/* Right image */}
                <div className="md:w-1/4 w-full flex items-center justify-center z-20">
                  <img
                    src={banner.imgSrc}
                    alt={banner.title}
                    className="w-full h-[250px] object-contain rounded-3xl"
                  />
                </div>
              </div>
            ) : index === 0 ? (
              // Special layout for the first slide with added image on the left
              <div className="flex flex-col md:flex-row items-center justify-center text-center w-full relative z-20">
                {/* New image on the left side */}
                <div className="md:w-1/4 w-full flex items-center justify-center z-20" style={{ transform: 'translateY(-10px)' }}>
                  <img
                    src={forbanner}
                    alt="For Banner"
                    className="w-full h-[250px] object-contain rounded-3xl"
                  />
                </div>

                {/* Text content */}
                <div className="md:w-1/2 w-full flex flex-col items-center justify-center text-center z-20">
                  <h1
                    className={`md:text-6xl text-3xl font-bold mb-4 leading-tight tracking-wide text-white`}
                    style={{
                      fontFamily: "Lobster, sans-serif",
                      maxWidth: "90%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {banner.title}
                  </h1>
                  <p
                    className="text-xl mb-6 text-[#d1d1d1]"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    {banner.description}
                  </p>
                </div>

                {/* Right image */}
                <div className="md:w-1/4 w-full flex items-center justify-center z-20">
                  <img
                    src={banner.imgSrc}
                    alt={banner.title}
                    className="w-full h-[250px] object-contain rounded-3xl"
                  />
                </div>
              </div>
            ) : (
              // Default layout for other slides
              <div className="flex flex-col md:flex-row items-center justify-center text-center w-full">
                <div className="md:w-1/4 w-full flex items-center justify-center relative z-10">
                  {/* Winter Sale 2 Image on the left */}
                  {index === 2 && (
                    <img
                      src={banner.imgSrcAlt}
                      alt="Winter Sale 2"
                      className="w-full h-[250px] object-contain rounded-3xl" // Adjusted size and removed absolute positioning
                    />
                  )}
                </div>
                <div className="md:w-1/2 w-full flex flex-col items-center justify-center text-center z-10">
                  <h1
                    className={`md:text-6xl text-3xl font-bold mb-4 leading-tight tracking-wide ${
                      index === 0 ? "text-white" : "text-[#1E90FF]"
                    }`}
                    style={{
                      fontFamily: "Lobster, sans-serif",
                      maxWidth: "90%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {banner.title}
                    {index === 2 && <span className="text-white text-5xl ml-[-5px] mt-[-25px]">❄️</span>}
                  </h1>
                  <p
                    className={`text-xl mb-6 ${
                      index === 0 ? "text-[#d1d1d1]" : "text-[#4682B4]"
                    }`}
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    {banner.description}
                  </p>
                </div>
                <div className="md:w-1/4 w-full flex items-center justify-center relative z-10">
                  {/* Winter Sale Image on the right */}
                  <img
                    src={banner.imgSrc}
                    alt={banner.title}
                    className="w-full h-[250px] object-contain rounded-3xl"
                    style={{ backgroundColor: "transparent" }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </Slider>

      {/* Slider Navigation Buttons */}
      <div
        className={`absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-300 text-white p-3 rounded-full opacity-${isHovered ? '100' : '0'} transition-opacity cursor-pointer z-10`}
        style={{ zIndex: 10 }}
        onClick={() => sliderRef.current.slickPrev()}
      >
        <i className="fas fa-chevron-left text-black"></i>
      </div>

      <div
        className={`absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-300 text-white p-3 rounded-full opacity-${isHovered ? '100' : '0'} transition-opacity cursor-pointer z-10`}
        style={{ zIndex: 10 }}
        onClick={() => sliderRef.current.slickNext()}
      >
        <i className="fas fa-chevron-right text-black"></i>
      </div>
    </div>
  );
};

export default Banner;
