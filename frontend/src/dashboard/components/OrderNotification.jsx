// src/dashboard/components/OrderNotification.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderNotification = () => {
  const [orderCount, setOrderCount] = useState(null);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders/count');
        if (orderCount !== null && response.data.count > orderCount) {
          toast.info("New order received!", { position: toast.POSITION.TOP_RIGHT });
        }
        setOrderCount(response.data.count);
      } catch (error) {
        console.error("Error fetching order count:", error);
      }
    };

    const intervalId = setInterval(fetchOrderCount, 10000); // Poll every 10 seconds
    return () => clearInterval(intervalId);
  }, [orderCount]);

  return null; // This component does not render anything visible
};

export default OrderNotification;
