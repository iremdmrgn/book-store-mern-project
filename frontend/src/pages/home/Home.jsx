import React, { useState } from 'react';
import Banner from './Banner';
import TopSellers from './TopSellers';
import Recommened from './Recommened';
import News from './News';

const Home = () => {
  const [bannerBgColor, setBannerBgColor] = useState("#ffffff"); // Banner için default beyaz arka plan

  return (
    <div className="w-full">
      {/* Banner kısmı için arka plan rengini ayarlıyoruz */}
      <div className="w-full mt-10 py-0 flex justify-center items-center" style={{ backgroundColor: bannerBgColor,marginTop:"-60px" }}>
        <Banner setBackgroundColor={setBannerBgColor}/>
      </div>

      {/* Diğer bölümler sınırlı genişlik ile merkezde duruyor */}
      <div className="max-w-[1200px] mx-auto px-4">
        <TopSellers />
        <Recommened />
        <News />
      </div>
    </div>
  );
};

export default Home;
