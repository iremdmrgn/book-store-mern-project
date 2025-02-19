import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGetOrderByEmailQuery } from "../../redux/features/orders/ordersApi";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("orders");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [addressError, setAddressError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [addresses, setAddresses] = useState([]); // State to store fetched addresses
  const [addressErrorFetch, setAddressErrorFetch] = useState(""); // Error for fetching addresses

  const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email || "");

  useEffect(() => {
    if (!currentUser) {
      window.location.href = "/login";
    } else {
      // Fetch addresses for the current user
      const fetchAddresses = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/address/addresses/${currentUser?.uid}`
          );
          if (response.ok) {
            const data = await response.json();
            console.log("Addresses:", data); // Log the addresses to console
            setAddresses(data); // Set the fetched addresses in the state
          } else {
            const errorText = await response.text();
            console.error("Error fetching addresses:", errorText);
            setAddressErrorFetch("Error loading addresses");
          }
        } catch (error) {
          console.error("Error fetching addresses:", error);
          setAddressErrorFetch("Error loading addresses");
        }
      };

      fetchAddresses();
    }
  }, [currentUser]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (!street || !city || !state || !postalCode || !country) {
      setAddressError("Please fill in all address fields.");
      return;
    }
    setAddressError("");

    const addressData = {
      street,
      city,
      state,
      postalCode,
      country,
      userId: currentUser?.uid,
    };
    console.log(addressData);
    try {
      const response = await fetch("http://localhost:5000/api/add-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });
      console.log(response);
      if (response.ok) {
        const result = await response.json(); // JSON olarak yanıt al
        setAddress(result);
      } else {
        const errorText = await response.text(); // Hata mesajını almak için
        console.error("Error response:", errorText);
        setAddressError("Error saving address. Please try again.");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setAddressError("Error saving address. Please try again.");
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      setPaymentError("Please fill in all payment fields.");
      return;
    }
    setPaymentError("");

    const paymentData = {
      cardNumber,
      cardHolder,
      expiryDate,
      cvv,
      userId: currentUser?.uid,
    };

    try {
      const response = await fetch("http://localhost:5000/api/payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentMethod(result);
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setPaymentError("Error saving payment method. Please try again.");
      }
    } catch (error) {
      console.error("Error saving payment method:", error);
      setPaymentError("Error saving payment method. Please try again.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // Redirect to login page after logout
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading orders</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-4xl font-bold text-gray-800">
        Welcome, {currentUser?.name}
      </h2>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => setSelectedTab("orders")}
          className={`px-4 py-2 text-lg font-semibold transition duration-300 ease-in-out ${
            selectedTab === "orders"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setSelectedTab("address")}
          className={`px-4 py-2 text-lg font-semibold transition duration-300 ease-in-out ${
            selectedTab === "address"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Address
        </button>
        <button
          onClick={() => setSelectedTab("payment")}
          className={`px-4 py-2 text-lg font-semibold transition duration-300 ease-in-out ${
            selectedTab === "payment"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Payment
        </button>
      </div>

      {/* Orders Tab */}
      {selectedTab === "orders" && (
        <div className="mt-6">
          <h3 className="text-3xl font-semibold text-gray-800">Your Orders</h3>
          {orders.length === 0 ? (
            <p className="text-gray-600">You don't have any orders yet.</p>
          ) : (
            orders.map((order, index) => (
              <div
                key={order._id}
                className="order-item mt-4 p-4 border rounded-lg bg-white text-black shadow-md"
              >
                <p className="p-1 bg-secondary text-white w-10 rounded mb-1">
                  # {index + 1}
                </p>
                <h2 className="font-bold">Order ID: {order._id}</h2>
                <p className="text-gray-600">Name: {order.name}</p>
                <p className="text-gray-600">Email: {order.email}</p>
                <p className="text-gray-600">Phone: {order.phone}</p>
                <p className="text-gray-600">Total Price: ${order.totalPrice}</p>
                <h3 className="font-semibold mt-2">Address:</h3>
                <p>
                  {order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}
                </p>
                <h3 className="font-semibold mt-2">Products Id:</h3>
                <ul>
                  {order.productIds.map((productId) => (
                    <li key={productId}>{productId}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {/* Address Tab */}
      {selectedTab === "address" && (
        <div>
          {/* Address Form Here */}
        </div>
      )}

      {/* Payment Tab */}
      {selectedTab === "payment" && (
        <div>
          {/* Payment Form Here */}
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
