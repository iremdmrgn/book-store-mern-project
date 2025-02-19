import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGetOrderByEmailQuery } from "../../redux/features/orders/ordersApi";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("userInfo");
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Address form state
  const [newAddressTitle, setNewAddressTitle] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newPostalCode, setNewPostalCode] = useState("");
  const [newCountry, setNewCountry] = useState("");

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const { data: orders, error, isLoading } = useGetOrderByEmailQuery(currentUser?.email || "");

  useEffect(() => {
    if (!currentUser) {
      window.location.href = "/login";
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const userName = currentUser?.displayName ? currentUser.displayName.split(' ') : [];
  const firstName = userName[0] || currentUser?.email || "";
  const lastName = userName[1] || "";

  const handleAddAddress = () => {
    if (
      newAddressTitle.trim() !== "" &&
      newStreet.trim() !== "" &&
      newCity.trim() !== "" &&
      newDistrict.trim() !== "" &&
      newNeighborhood.trim() !== "" &&
      newPostalCode.trim() !== "" &&
      newCountry.trim() !== ""
    ) {
      const newAddress = {
        title: newAddressTitle,
        street: newStreet,
        city: newCity,
        district: newDistrict,
        neighborhood: newNeighborhood,
        postalCode: newPostalCode,
        country: newCountry,
      };
      setAddresses([...addresses, newAddress]);
      setNewAddressTitle("");
      setNewStreet("");
      setNewCity("");
      setNewDistrict("");
      setNewNeighborhood("");
      setNewPostalCode("");
      setNewCountry("");
      
      // After saving, redirect to the address tab
      setSelectedTab("address");
    }
  };

  const handleDeleteAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleAddPayment = () => {
    if (
      cardNumber.trim() !== "" &&
      expiryDate.trim() !== "" &&
      cvv.trim() !== "" &&
      cardHolder.trim() !== ""
    ) {
      const newPayment = {
        cardNumber,
        expiryDate,
        cvv,
        cardHolder,
      };
      setPayments([...payments, newPayment]);
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCardHolder("");
      
      // After saving, redirect to the payment tab
      setSelectedTab("payment");
    }
  };

  const handleDeletePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading orders</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-4xl font-bold text-gray-800">Welcome,</h2>

      <div className="flex items-center mt-4">
        <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white text-xl font-semibold">
          {firstName[0]}{lastName[0]}
        </div>
        <div className="ml-4">
          <p className="font-semibold text-lg">{firstName} {lastName}</p>
        </div>
      </div>

      <div className="mt-6 flex space-x-6">
        <div className="flex flex-col w-1/4 space-y-4">
          {[{ key: "userInfo", label: "User Information", icon: "fas fa-user" },
            { key: "orders", label: "Orders", icon: "fas fa-box" },
            { key: "favorites", label: "Favorites", icon: "fas fa-star" },
            { key: "reviews", label: "Reviews", icon: "fas fa-comment-dots" },
            { key: "address", label: "Addresses", icon: "fas fa-home" },
            { key: "payment", label: "Payment Methods", icon: "fas fa-credit-card" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key)}
              className={`px-4 py-3 text-lg font-semibold transition-all duration-300 ease-in-out w-full rounded-lg flex items-center justify-start ${selectedTab === key ? "bg-blue-700 text-white shadow-lg" : "bg-[rgba(150,150,170,0.3)] text-gray-600 hover:bg-blue-50"}`}
            >
              <i className={`${icon} mr-2`} style={{ fontSize: "1.2rem" }}></i>
              {label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="px-6 py-3 text-lg font-semibold bg-red-600 text-white rounded-full w-full mt-6 transform transition-all duration-300 ease-in-out hover:bg-red-700 hover:scale-105 shadow-md"
          >
            Log Out
          </button>
        </div>

        <div className="w-3/4">
          {selectedTab === "orders" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">Your Orders</h3>
              <div>
                {orders?.length === 0 && <p>No orders found</p>}
                {orders?.map((order, index) => (
                  <div key={index} className="p-4 bg-gray-100 rounded-lg mb-4">
                    <p className="font-semibold">Order ID: {order._id}</p>
                    <p>Status: {order.status}</p>
                    <p>Total: ${order.totalAmount ? order.totalAmount.toFixed(2) : "N/A"}</p>
                    <p>Placed on: {order.createdAt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "favorites" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">Your Favorites</h3>
              <div>
                {favorites?.length === 0 && <p>No favorites added</p>}
                {favorites?.map((favorite, index) => (
                  <div key={index} className="p-4 bg-gray-100 rounded-lg mb-4">
                    <p className="font-semibold">{favorite.title}</p>
                    <p>{favorite.author}</p>
                    <p>Price: ${favorite.price}</p>
                    <button
                      onClick={() => setFavorites(favorites.filter((_, i) => i !== index))}
                      className="mt-2 text-red-600"
                    >
                      Remove from Favorites
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "userInfo" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">Your Information</h3>
              <div className="grid gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={currentUser?.email || ""}
                    readOnly
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <button
                  onClick={() => alert('User information updated!')}
                  className="mt-4 px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900"
                >
                  Update Information
                </button>
              </div>
            </div>
          )}

          {selectedTab === "address" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">Your Addresses</h3>
              <div className="grid gap-4">
                {addresses.length === 0 ? (
                  <p>No addresses added.</p>
                ) : (
                  addresses.map((address, index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-lg mb-4">
                      <p className="font-semibold">{address.title}</p>
                      <p>{address.street}</p>
                      <p>{address.city}, {address.district}, {address.neighborhood}</p>
                      <p>{address.postalCode}</p>
                      <p>{address.country}</p>
                      <button
                        onClick={() => handleDeleteAddress(index)}
                        className="mt-2 text-red-600"
                      >
                        Delete Address
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => setSelectedTab("addAddress")}
                className="mt-4 px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900"
              >
                Add New Address
              </button>
            </div>
          )}

          {selectedTab === "addAddress" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">Add New Address</h3>
              <div className="grid gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newAddressTitle}
                    onChange={(e) => setNewAddressTitle(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Street</label>
                  <input
                    type="text"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">District</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Neighborhood</label>
                  <input
                    type="text"
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Country</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <button
                  onClick={handleAddAddress}
                  className="mt-4 px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900"
                >
                  Save Address
                </button>
              </div>
            </div>
          )}

          {selectedTab === "payment" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">Your Payment Methods</h3>
              <div className="grid gap-4">
                {payments.length === 0 ? (
                  <p>No payment methods added.</p>
                ) : (
                  payments.map((payment, index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-lg mb-4">
                      <p className="font-semibold">Cardholder: {payment.cardHolder}</p>
                      <p>Card Number: **** **** **** {payment.cardNumber.slice(-4)}</p>
                      <p>Expiry Date: {payment.expiryDate}</p>
                      <button
                        onClick={() => handleDeletePayment(index)}
                        className="mt-2 text-red-600"
                      >
                        Delete Payment
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => setSelectedTab("addPayment")}
                className="mt-4 px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900"
              >
                Add New Payment Method
              </button>
            </div>
          )}

          {selectedTab === "addPayment" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">Add New Payment Method</h3>
              <div className="grid gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Expiry Date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <button
                  onClick={handleAddPayment}
                  className="mt-4 px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900"
                >
                  Save Payment Method
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
