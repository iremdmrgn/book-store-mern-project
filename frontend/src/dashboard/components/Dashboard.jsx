import React, { useState, useEffect } from 'react';
import { getDashboardData } from '/src/redux/features/dashboard/dashboardApi';
import RevenueChart from './RevenueChart';
import BestSellingBooksChart from './BestSellingBooksChart';
import Loading from '../../components/Loading';
import NotificationDropdown from './NotificationDropdown';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState({
    orderCount: 0,
    recentOrders: [],
    revenueData: [],
    totalBooks: 0,
    bestSellingBooks: []
  });
  const [bestSellingLabels, setBestSellingLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard verilerini çekiyoruz
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(prev => ({ ...prev, ...dashboardData }));
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBestSellingBooks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard/best-selling-books');
        setData(prev => ({ ...prev, bestSellingBooks: res.data }));
      } catch (error) {
        console.error(error);
      }
    };
    fetchBestSellingBooks();
  }, []);

  useEffect(() => {
    const fetchBookTitles = async () => {
      if (!data.bestSellingBooks || data.bestSellingBooks.length === 0) return;
      const titles = await Promise.all(data.bestSellingBooks.map(item => item.title || "Bilinmeyen Kitap"));
      setBestSellingLabels(titles);
    };
    fetchBookTitles();
  }, [data.bestSellingBooks]);

  if (loading) return <Loading />;
  if (error) return <div>Error loading dashboard data.</div>;

  const revenueLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueValues = new Array(12).fill(0);
  data.revenueData.forEach(item => { revenueValues[item._id - 1] = Math.round(item.totalRevenue); });
  const bestSellingValues = (data.bestSellingBooks || []).map(item => Math.round(parseFloat(item.totalSold)));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
        <NotificationDropdown />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl">{data.orderCount}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Orders Left</h2>
          <p className="text-2xl">{data.ordersLeft}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Products</h2>
          <p className="text-2xl">{data.totalBooks}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded p-4 w-full min-h-[400px]">
          <h2 className="text-lg font-semibold mb-2">Annual Revenue</h2>
          <RevenueChart labels={revenueLabels} dataValues={revenueValues} />
        </div>
        <div className="bg-white shadow rounded p-4 w-full min-h-[400px]">
          <h2 className="text-lg font-semibold mb-2">Best Selling Books (This Month)</h2>
          {data.bestSellingBooks && data.bestSellingBooks.length > 0 ? (
            <BestSellingBooksChart labels={bestSellingLabels} dataValues={bestSellingValues} />
          ) : (
            <p>Bu ay en çok satılan kitap verisi bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
