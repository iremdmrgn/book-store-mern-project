import React from 'react';
import bannerImg from "../../assets/banner.png";

const Banner = () => {
  return (
    <div className='flex flex-col md:flex-row-reverse py-8 md:py-12 justify-between items-center gap-8'>
         <div className='md:w-1/2 w-full flex items-center md:justify-end'>
            <img src={bannerImg} alt="Banner" className="max-w-full h-auto" />
        </div>
        
        <div className='md:w-1/2 w-full'>
            <h1 className='md:text-5xl text-3xl font-medium mb-5'>New Releases This Week</h1>
            <p className='mb-8'>It's time to update your reading list with some of the latest and greatest releases in the literary world. From heart-pumping thrillers to captivating memoirs, this week's new releases offer something for everyone</p>

            <button className='btn-primary'>Subscribe</button>
        </div>
    </div>
  );
}

export default Banner;