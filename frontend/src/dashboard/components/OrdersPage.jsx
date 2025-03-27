import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../components/Loading';
import { getImgUrl } from '../../utils/getImgUrl';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Tüm siparişleri çekiyoruz
        const res = await axios.get('http://localhost:5000/api/orders');
        // API yanıtı doğrudan dizi değilse, orders property’sini kullanın
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
              className="p-4 bg-gray-100 rounded-lg mb-4 cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-4"
              // Burada sipariş detay sayfasına yönlendirme ekleyebilirsiniz
            >
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
                <p className="text-black">Status: {order.status ? order.status : "Pending"}</p>
                <p className="text-black">
                  Total: {order.totalPrice !== undefined && order.totalPrice !== null
                    ? `$${order.totalPrice.toFixed(2)}`
                    : "N/A"}
                </p>
                <p className="text-black">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
