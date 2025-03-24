// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    orderCount: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard');
        if (!response.ok) {
          throw new Error('API isteği başarısız oldu.');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>Hata: {error.message}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Toplam Sipariş Sayısı: {dashboardData.orderCount}</p>
      <h2>En Son Siparişler</h2>
      <ul>
        {dashboardData.recentOrders.map((order) => (
          <li key={order._id}>
            {order.name} - Toplam Fiyat: {order.totalPrice} TL
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
