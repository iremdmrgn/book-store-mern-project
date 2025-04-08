import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../components/Loading';
import { getImgUrl } from '../../utils/getImgUrl';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

// Establish a socket connection to your server (adjust the URL as needed)
const socket = io("http://localhost:5000");

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [orderStatusUpdates, setOrderStatusUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Options for order statuses
  const orderStatusOptions = [
    "Order Received",
    "Preparing Order",
    "Shipped",
    "Delivered"
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch all orders
        const res = await axios.get('http://localhost:5000/api/orders');
        // If API response is not a direct array, use the orders property
        const ordersArray = Array.isArray(res.data)
          ? res.data
          : res.data.orders || [];
        setOrders(ordersArray);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Listen for socket events to update order data in real time
  useEffect(() => {
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.off("orderUpdated");
    };
  }, []);

  // Save the selected new status for each order in state
  const handleStatusChange = (orderId, newStatus) => {
    setOrderStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  // API call to update the order status
  const handleStatusUpdate = async (orderId) => {
    const newStatus = orderStatusUpdates[orderId];
    if (!newStatus) {
      toast.error("Please select a status to update.");
      return;
    }
    try {
      // Update order API call – adjust the endpoint as needed
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus });
      // If successful, update the order status in state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success("Order status updated successfully!");
      // Clear the selected status update for this order
      setOrderStatusUpdates(prev => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Error updating order status.");
    }
  };

  if (loading) return <Loading />;
  if (error) return <div>Error loading orders.</div>;

  return (
    <div className="p-6 border rounded-lg bg-white text-black shadow-lg w-full max-w-2xl mx-auto">
      <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black mb-4">
        All Orders
      </h3>
      <div>
        {orders.length === 0 ? (
          <p className="text-black">No orders found.</p>
        ) : (
          orders.map(order => (
            <div
              key={order._id}
              className="p-4 bg-gray-100 rounded-lg mb-4 cursor-pointer hover:bg-gray-200 transition-colors flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                {order.items && order.items.length > 0 && (
                  <img
                    src={order.items[0].coverImage ? getImgUrl(order.items[0].coverImage) : "/default-image.jpg"}
                    alt="Book cover"
                    className="w-20 h-20 object-cover rounded shadow"
                  />
                )}
                <div>
                  <p className="font-semibold text-black">
                    Order #: {order.orderNumber ? order.orderNumber : order._id}
                  </p>
                  <p className="text-black">Current Status: {order.status ? order.status : "Pending"}</p>
                  <p className="text-black">
                    Total: {order.totalPrice !== undefined && order.totalPrice !== null
                      ? `$${order.totalPrice.toFixed(2)}`
                      : "N/A"}
                  </p>
                  <p className="text-black">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={orderStatusUpdates[order._id] || order.status || ""}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="">Select Status</option>
                  {orderStatusOptions.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleStatusUpdate(order._id)}
                  className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition-all duration-200"
                >
                  Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
