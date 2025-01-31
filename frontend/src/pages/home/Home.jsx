import React from 'react'
import Banner from './Banner'
import TopSellers from './TopSellers'
import Recommened from './Recommened'
import News from './News'

const Home = () => {
  return (
    <div className='max-w-7xl mx-auto px-4'>
        <Banner />
        <TopSellers />
        <Recommened />
        <News />
    </div>
  )
}

export default Home