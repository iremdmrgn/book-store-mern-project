import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [badgeCount, setBadgeCount] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [lastSeen, setLastSeen] = useState(0);
  const navigate = useNavigate();

  // Admin id'sini localStorage'dan alıyoruz (admin login sonrası bu değer saklanmalı)
  const adminId = localStorage.getItem("adminId");

  // Hem toplam sipariş sayısını hem de adminin lastSeen değerini backend'den çekiyoruz
  const fetchData = async () => {
    try {
      const resCount = await axios.get('http://localhost:5000/api/orders/count');
      const newCount = resCount.data.count;
      const resLastSeen = await axios.get(`http://localhost:5000/api/admin/${adminId}/last-seen`);
      const backendLastSeen = resLastSeen.data.lastSeenOrderCount;
      setCurrentCount(newCount);
      setLastSeen(backendLastSeen);
      if (newCount > backendLastSeen) {
        setBadgeCount(newCount - backendLastSeen);
      } else {
        setBadgeCount(0);
      }
      console.log("New count:", newCount, "Backend lastSeen:", backendLastSeen, "Badge:", newCount - backendLastSeen);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // adminId varsa her 10 saniyede bir veriyi çekiyoruz
  useEffect(() => {
    if (adminId) {
      fetchData();
      const intervalId = setInterval(fetchData, 10000);
      return () => clearInterval(intervalId);
    }
  }, [adminId]);

  const handleBellClick = async () => {
    try {
      // Kullanıcı çanı tıkladığında, backend'deki lastSeenOrderCount değerini mevcut sipariş sayısına güncelliyoruz.
      await axios.put(`http://localhost:5000/api/admin/${adminId}/last-seen`, {
        lastSeenOrderCount: currentCount,
      });
      setBadgeCount(0);
      setLastSeen(currentCount);
    } catch (error) {
      console.error("Error updating last seen:", error);
    }
    // Yönlendirme: Admin sipariş yönetim sayfasına
    navigate('/dashboard/orders');
  };

  return (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleBellClick}>
      <FaBell size={24} />
      {badgeCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '12px'
          }}
        >
          {badgeCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
