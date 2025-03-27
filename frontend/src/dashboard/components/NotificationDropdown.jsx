import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Toplam sipariş sayısını al ve badge'yi hesapla
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/count');
        const newCount = res.data.count;
        if (prevCount !== 0 && newCount > prevCount) {
          setBadgeCount(newCount - prevCount);
        }
        setPrevCount(newCount);
      } catch (error) {
        console.error("Error fetching order count:", error);
      }
    };

    fetchOrderCount();
    const intervalId = setInterval(fetchOrderCount, 10000); // Her 10 saniyede bir
    return () => clearInterval(intervalId);
  }, [prevCount]);

  // Dropdown açıldığında son siparişleri çek ve badge'yi sıfırla
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/recent');
        setRecentOrders(res.data);
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      }
    };
    if (dropdownOpen) {
      fetchRecentOrders();
      setBadgeCount(0);
    }
  }, [dropdownOpen]);

  // Dropdown dışına tıklanırsa kapatma
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', cursor: 'pointer' }}>
      <div onClick={() => setDropdownOpen(prev => !prev)}>
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
      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '110%',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '300px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
            Recent Orders
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {recentOrders.length === 0 ? (
              <div style={{ padding: '10px' }}>No new orders</div>
            ) : (
              recentOrders.map(order => (
                <div key={order._id}
                  style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                  onClick={() => {
                    setDropdownOpen(false);
                    // Yönlendirmeyi, siparişlerin yönetildiği sayfaya yapıyoruz
                    navigate(`/dashboard/orders`);
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>
                    Order #{order.orderNumber || order._id}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Total: ${order.totalPrice.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
