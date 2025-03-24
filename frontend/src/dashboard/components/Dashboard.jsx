// src/dashboard/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RevenueChart from './RevenueChart';
import Loading from '../../components/Loading';
import OrderNotification from './OrderNotification';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setData(response.data);
      } catch (err) {
        console.error("Dashboard data fetching error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div>Error loading dashboard data.</div>;

  // Annual Revenue Chart için: 12 ay verilerini işliyoruz.
  const revenueLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const revenueValues = new Array(12).fill(0);
  data.revenueData.forEach(item => {
    const monthIndex = item._id - 1;
    revenueValues[monthIndex] = item.totalRevenue;
  });

  // Best Selling Books için: Kitap isimleri ve satış adetleri
  const bestSellingLabels = data.bestSellingBooks.map(
    item => item.bookDetails[0]?.title || "No Title"
  );
  const bestSellingValues = data.bestSellingBooks.map(item => item.totalSold);

  return (
    <div>
      {/* Sipariş bildirimi */}
      <OrderNotification />

      {/* İstatistik Kartları */}
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

      {/* Grafikler: Yan yana, tam genişlikte ve biraz büyütülmüş */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded p-4 w-full min-h-[400px]">
          <h2 className="text-lg font-semibold mb-2">Annual Revenue</h2>
          <RevenueChart labels={revenueLabels} dataValues={revenueValues} />
        </div>
        <div className="bg-white shadow rounded p-4 w-full min-h-[400px]">
          <h2 className="text-lg font-semibold mb-2">Best Selling Books (This Month)</h2>
          <RevenueChart labels={bestSellingLabels} dataValues={bestSellingValues} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
