import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGetOrderByEmailQuery } from "../../redux/features/orders/ordersApi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getImgUrl } from "../../utils/getImgUrl";
import axios from "axios";
import { FaEdit } from "react-icons/fa";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("userInfo");
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [favorites, setFavorites] = useState([]); // favorites state remains unchanged

  // Address form state (for adding new address)
  const [newAddressTitle, setNewAddressTitle] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newPostalCode, setNewPostalCode] = useState("");
  const [newCountry, setNewCountry] = useState("");

  // Payment form state (for adding new payment)
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  // Reviews state (for the Reviews tab)
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);

  const { data: orders, error, isLoading } = useGetOrderByEmailQuery(
    currentUser?.email || ""
  );

  useEffect(() => {
    if (!currentUser) {
      window.location.href = "/login";
    }
  }, [currentUser]);

  // Kullanıcı bilgileri için
  const userName = currentUser?.displayName
    ? currentUser.displayName.split(" ")
    : [];
  const firstNameDisplay = userName[0] || currentUser?.email || "";
  const lastNameDisplay = userName[1] || "";

  // Editable states for user information
  const [editableFirstName, setEditableFirstName] = useState(firstNameDisplay);
  const [editableLastName, setEditableLastName] = useState(lastNameDisplay);
  const [editableEmail, setEditableEmail] = useState(currentUser?.email || "");
  const [editablePhone, setEditablePhone] = useState(currentUser?.phone || "");

  // Function to update user information to backend
  const handleUpdateUser = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/account/${currentUser.uid.trim()}`,
        {
          firstName: editableFirstName,
          lastName: editableLastName,
          email: editableEmail,
          phone: editablePhone,
        }
      );
      Swal.fire({
        icon: "success",
        title: "Information Updated",
        text: "Your information has been updated successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      // Optionally update your context or global state here with response.data
    } catch (err) {
      console.error("Error updating user:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Please try again.",
      });
    }
  };

  // --- Address Operations ---
  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/address/${currentUser.uid.trim()}`
      );
      setAddresses(response.data);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load addresses",
        text: "Please try again later.",
      });
    }
  };

  useEffect(() => {
    if (selectedTab === "address" && currentUser && currentUser.uid) {
      fetchAddresses();
    }
  }, [selectedTab, currentUser]);

  const handleAddAddress = async () => {
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
      try {
        await axios.post(
          `http://localhost:5000/api/address/${currentUser.uid.trim()}`,
          newAddress
        );
        fetchAddresses();
        setNewAddressTitle("");
        setNewStreet("");
        setNewCity("");
        setNewDistrict("");
        setNewNeighborhood("");
        setNewPostalCode("");
        setNewCountry("");
        setSelectedTab("address");
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Address Added",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
        console.error("Error adding address:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to add address",
          text: "Please try again.",
        });
      }
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/address/${currentUser.uid.trim()}/${addressId}`
      );
      setAddresses(addresses.filter((address) => address._id !== addressId));
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Address Deleted",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("Error deleting address:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to delete address",
        text: "Please try again.",
      });
    }
  };

  // --- Edit Address States and Functions ---
  const [editAddressId, setEditAddressId] = useState(null);
  const [editAddressTitle, setEditAddressTitle] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editNeighborhood, setEditNeighborhood] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editCountry, setEditCountry] = useState("");

  const startEditAddress = (address) => {
    setEditAddressId(address._id);
    setEditAddressTitle(address.title);
    setEditStreet(address.street);
    setEditCity(address.city);
    setEditDistrict(address.district);
    setEditNeighborhood(address.neighborhood);
    setEditPostalCode(address.postalCode);
    setEditCountry(address.country);
  };

  const cancelEditAddress = () => {
    setEditAddressId(null);
    setEditAddressTitle("");
    setEditStreet("");
    setEditCity("");
    setEditDistrict("");
    setEditNeighborhood("");
    setEditPostalCode("");
    setEditCountry("");
  };

  const handleUpdateAddress = async (addressId) => {
    if (
      editAddressTitle.trim() !== "" &&
      editStreet.trim() !== "" &&
      editCity.trim() !== "" &&
      editDistrict.trim() !== "" &&
      editNeighborhood.trim() !== "" &&
      editPostalCode.trim() !== "" &&
      editCountry.trim() !== ""
    ) {
      const updatedAddress = {
        title: editAddressTitle,
        street: editStreet,
        city: editCity,
        district: editDistrict,
        neighborhood: editNeighborhood,
        postalCode: editPostalCode,
        country: editCountry,
      };
      try {
        await axios.put(
          `http://localhost:5000/api/address/${currentUser.uid.trim()}/${addressId}`,
          updatedAddress
        );
        fetchAddresses();
        cancelEditAddress();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Address Updated",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
        console.error("Error updating address:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to update address",
          text: "Please try again.",
        });
      }
    }
  };

  // --- Payment Methods Operations ---
  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payment-method/${currentUser.uid.trim()}`
      );
      setPayments(response.data);
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load payment methods",
        text: "Please try again later.",
      });
    }
  };

  useEffect(() => {
    if (selectedTab === "payment" && currentUser && currentUser.uid) {
      fetchPaymentMethods();
    }
  }, [selectedTab, currentUser]);

  const handleAddPayment = async () => {
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
      try {
        await axios.post(
          `http://localhost:5000/api/payment-method/${currentUser.uid.trim()}`,
          newPayment
        );
        fetchPaymentMethods();
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
        setCardHolder("");
        setSelectedTab("payment");
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Payment Method Added",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
        console.error("Error adding payment method:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to add payment method",
          text: "Please try again.",
        });
      }
    }
  };

  const handleDeletePayment = async (methodId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/payment-method/${currentUser.uid.trim()}/${methodId}`
      );
      setPayments(payments.filter((payment) => payment._id !== methodId));
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Payment Method Deleted",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("Error deleting payment method:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to delete payment method",
        text: "Please try again.",
      });
    }
  };

  // --- Edit Payment States and Functions ---
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [editCardNumber, setEditCardNumber] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editCvv, setEditCvv] = useState("");
  const [editCardHolder, setEditCardHolder] = useState("");

  const startEditPayment = (payment) => {
    setEditPaymentId(payment._id);
    setEditCardNumber(payment.cardNumber);
    setEditExpiryDate(payment.expiryDate);
    setEditCvv(payment.cvv);
    setEditCardHolder(payment.cardHolder);
  };

  const cancelEditPayment = () => {
    setEditPaymentId(null);
    setEditCardNumber("");
    setEditExpiryDate("");
    setEditCvv("");
    setEditCardHolder("");
  };

  const handleUpdatePayment = async (paymentId) => {
    if (
      editCardNumber.trim() !== "" &&
      editExpiryDate.trim() !== "" &&
      editCvv.trim() !== "" &&
      editCardHolder.trim() !== ""
    ) {
      const updatedPayment = {
        cardNumber: editCardNumber,
        expiryDate: editExpiryDate,
        cvv: editCvv,
        cardHolder: editCardHolder,
      };
      try {
        await axios.put(
          `http://localhost:5000/api/payment-method/${currentUser.uid.trim()}/${paymentId}`,
          updatedPayment
        );
        fetchPaymentMethods();
        cancelEditPayment();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Payment Method Updated",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (err) {
        console.error("Error updating payment method:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to update payment method",
          text: "Please try again.",
        });
      }
    }
  };

  // Review silme fonksiyonu
  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`);
      setReviews(reviews.filter((review) => review._id !== reviewId));
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Review Deleted",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("Error deleting review:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to delete review",
        text: "Please try again.",
      });
    }
  };

  // Kullanıcıya ait review'leri getirme fonksiyonu
  // Ek olarak, eğer review.bookTitle boş veya "Unknown Book" ise, ilgili kitabın başlığı alınarak güncelleniyor.
  const fetchUserReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/user/${currentUser.uid}`
      );
      const reviewsData = response.data;
      const updatedReviews = await Promise.all(
        reviewsData.map(async (review) => {
          if (!review.bookTitle || review.bookTitle === "Unknown Book") {
            try {
              const { data: book } = await axios.get(
                `http://localhost:5000/api/books/${review.bookId}`
              );
              return { ...review, bookTitle: book.title };
            } catch (error) {
              console.error("Error fetching book for review:", error);
              return review;
            }
          }
          return review;
        })
      );
      setReviews(updatedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    if (selectedTab === "reviews" && currentUser && currentUser.uid) {
      fetchUserReviews();
    }
  }, [selectedTab, currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Example: Order details pop-up (Orders tab)
  const handleOrderClick = (order) => {
    Swal.fire({
      title: `<strong>Order ${
        order.orderNumber ? order.orderNumber : order._id
      }</strong>`,
      html: `
        <div style="text-align: left;">
          <p><strong>Status:</strong> ${order.status || "Pending"}</p>
          <p><strong>Total:</strong> ${
            order.totalPrice !== undefined && order.totalPrice !== null
              ? `$${order.totalPrice.toFixed(2)}`
              : "N/A"
          }</p>
          <p><strong>Placed on:</strong> ${new Date(
            order.createdAt
          ).toLocaleDateString()}</p>
          <hr style="margin: 1rem 0;"/>
          <p style="font-size: 1rem;"><strong>Shipping Details:</strong></p>
          <p style="font-size: 0.9rem;">${
            order.trackingInfo ||
            "Your order is being processed. Tracking info will be updated soon."
          }</p>
        </div>
      `,
      icon: "info",
      width: "600px",
      showCloseButton: true,
      confirmButtonText: "Close",
      customClass: {
        title: "swal2-title-custom",
        htmlContainer: "swal2-html-container-custom",
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading orders</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-4xl font-bold text-gray-800">Welcome,</h2>

      <div className="flex items-center mt-4">
        <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white text-xl font-semibold">
          {firstNameDisplay[0]}
          {lastNameDisplay[0]}
        </div>
        <div className="ml-4">
          <p className="font-semibold text-lg">
            {firstNameDisplay} {lastNameDisplay}
          </p>
        </div>
      </div>

      <div className="mt-6 flex space-x-6">
        <div className="flex flex-col w-1/4 space-y-4">
          {[
            { key: "userInfo", label: "User Information", icon: "fas fa-user" },
            { key: "orders", label: "Orders", icon: "fas fa-box" },
            { key: "reviews", label: "Reviews", icon: "fas fa-comment-dots" },
            { key: "address", label: "Addresses", icon: "fas fa-home" },
            { key: "payment", label: "Payment Methods", icon: "fas fa-credit-card" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                setSelectedTab(key);
                // reset any edit states when switching tabs
                cancelEditAddress();
                cancelEditPayment();
              }}
              className={`px-4 py-3 text-lg font-semibold transition-all duration-300 ease-in-out w-full rounded-lg flex items-center justify-start ${
                selectedTab === key
                  ? "bg-blue-700 text-white shadow-lg"
                  : "bg-[rgba(150,150,170,0.3)] text-gray-600 hover:bg-blue-50"
              }`}
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
          {/* Payment Methods Tab */}
          {selectedTab === "payment" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-semibold text-gray-800">
                  Your Payment Methods
                </h3>
                <button
                  onClick={() => setSelectedTab("addPayment")}
                  className="px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 shadow-md"
                >
                  Add New Payment Method
                </button>
              </div>
              <div className="grid gap-4">
                {payments.length === 0 ? (
                  <p>No payment methods added.</p>
                ) : (
                  payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="p-4 bg-gray-100 rounded-lg mb-4 relative"
                    >
                      {editPaymentId === payment._id ? (
                        <div>
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                Card Number
                              </label>
                              <input
                                type="text"
                                value={editCardNumber}
                                onChange={(e) =>
                                  setEditCardNumber(e.target.value)
                                }
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                value={editExpiryDate}
                                onChange={(e) =>
                                  setEditExpiryDate(e.target.value)
                                }
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                CVV
                              </label>
                              <input
                                type="text"
                                value={editCvv}
                                onChange={(e) => setEditCvv(e.target.value)}
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                Cardholder Name
                              </label>
                              <input
                                type="text"
                                value={editCardHolder}
                                onChange={(e) =>
                                  setEditCardHolder(e.target.value)
                                }
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => handleUpdatePayment(payment._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditPayment}
                              className="px-3 py-1 bg-gray-400 text-white rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => startEditPayment(payment)}
                              className="text-blue-600"
                            >
                              <FaEdit size={24} />
                            </button>
                          </div>
                          <p className="font-semibold">
                            Cardholder: {payment.cardHolder}
                          </p>
                          <p>
                            Card Number: **** **** ****{" "}
                            {payment.cardNumber.slice(-4)}
                          </p>
                          <p>Expiry Date: {payment.expiryDate}</p>
                          <div className="mt-2">
                            <button
                              onClick={() => handleDeletePayment(payment._id)}
                              className="text-red-600"
                            >
                              Delete Payment
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedTab === "addPayment" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">
                Add New Payment Method
              </h3>
              <div className="grid gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Cardholder Name
                  </label>
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

          {/* Orders Tab */}
          {selectedTab === "orders" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">
                Your Orders
              </h3>
              <div>
                {orders?.length === 0 && <p>No orders found</p>}
                {orders?.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => handleOrderClick(order)}
                    className="p-4 bg-gray-100 rounded-lg mb-4 cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-4"
                  >
                    {order.items && order.items.length > 0 && (
                      <img
                        src={
                          order.items[0].coverImage
                            ? getImgUrl(order.items[0].coverImage).href
                            : "/default-image.jpg"
                        }
                        alt="Book cover"
                        className="w-20 h-20 object-cover rounded shadow"
                      />
                    )}
                    <div>
                      <p className="font-semibold">
                        Order Number:{" "}
                        {order.orderNumber ? order.orderNumber : order._id}
                      </p>
                      <p>Status: {order.status ? order.status : "Pending"}</p>
                      <p>
                        Total:{" "}
                        {order.totalPrice !== undefined &&
                        order.totalPrice !== null
                          ? `$${order.totalPrice.toFixed(2)}`
                          : "N/A"}
                      </p>
                      <p>
                        Placed on:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Information Tab */}
          {selectedTab === "userInfo" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">
                Your Information
              </h3>
              <div className="grid gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editableFirstName}
                    onChange={(e) => setEditableFirstName(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editableLastName}
                    onChange={(e) => setEditableLastName(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <button
                  onClick={handleUpdateUser}
                  className="mt-4 px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900"
                >
                  Update Information
                </button>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {selectedTab === "address" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-semibold text-gray-800">
                  Your Addresses
                </h3>
                <button
                  onClick={() => setSelectedTab("addAddress")}
                  className="px-4 py-2 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 shadow-md"
                >
                  Add New Address
                </button>
              </div>
              <div className="grid gap-4">
                {addresses.length === 0 ? (
                  <p>No addresses added.</p>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address._id}
                      className="p-4 bg-gray-100 rounded-lg mb-4 relative"
                    >
                      {editAddressId === address._id ? (
                        <div>
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                Title
                              </label>
                              <input
                                type="text"
                                value={editAddressTitle}
                                onChange={(e) =>
                                  setEditAddressTitle(e.target.value)
                                }
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                Street
                              </label>
                              <input
                                type="text"
                                value={editStreet}
                                onChange={(e) => setEditStreet(e.target.value)}
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                City
                              </label>
                              <input
                                type="text"
                                value={editCity}
                                onChange={(e) => setEditCity(e.target.value)}
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                District
                              </label>
                              <input
                                type="text"
                                value={editDistrict}
                                onChange={(e) =>
                                  setEditDistrict(e.target.value)
                                }
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                Neighborhood
                              </label>
                              <input
                                type="text"
                                value={editNeighborhood}
                                onChange={(e) =>
                                  setEditNeighborhood(e.target.value)
                                }
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                value={editPostalCode}
                                onChange={(e) =>
                                  setEditPostalCode(e.target.value)
                                }
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="block font-semibold text-gray-700">
                                Country
                              </label>
                              <input
                                type="text"
                                value={editCountry}
                                onChange={(e) =>
                                  setEditCountry(e.target.value)
                                }
                                className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex space-x-2">
                            <button
                              onClick={() => handleUpdateAddress(address._id)}
                              className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditAddress}
                              className="px-3 py-1 bg-gray-400 text-white rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => startEditAddress(address)}
                              className="text-blue-600"
                            >
                              <FaEdit size={24} />
                            </button>
                          </div>
                          <p className="font-semibold">{address.title}</p>
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.district},{" "}
                            {address.neighborhood}
                          </p>
                          <p>{address.postalCode}</p>
                          <p>{address.country}</p>
                          <div className="mt-2">
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="mt-2 text-red-600"
                            >
                              Delete Address
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedTab === "addAddress" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">
                Add New Address
              </h3>
              <div className="grid gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newAddressTitle}
                    onChange={(e) => setNewAddressTitle(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Street
                  </label>
                  <input
                    type="text"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    District
                  </label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Neighborhood
                  </label>
                  <input
                    type="text"
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    className="border p-2 rounded-md focus:ring-blue-800 focus:border-blue-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-gray-700">
                    Country
                  </label>
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

          {/* Reviews Tab – Sadece yorumların listelendiği alan, input/form bulunmuyor */}
          {selectedTab === "reviews" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 className="text-3xl font-semibold text-gray-800 mb-4">
                Your Reviews
              </h3>
              <div className="mt-8 space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg shadow-sm flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xl ${
                                i < review.rating
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-gray-700">
                          <strong>{review.reviewer}</strong> reviewed{" "}
                          <span className="font-bold">
                            {review.bookTitle ? review.bookTitle : ""}
                          </span>
                          : {review.text}
                        </p>
                      </div>
                      {currentUser && review.userId === currentUser.uid}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No reviews yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
