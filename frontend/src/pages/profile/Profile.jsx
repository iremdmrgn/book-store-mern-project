import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGetOrderByEmailQuery } from "../../redux/features/orders/ordersApi";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getImgUrl } from "../../utils/getImgUrl";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { PiShippingContainer } from "react-icons/pi";
import ReactDOMServer from "react-dom/server";
import {
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import { LuTrash2 } from "react-icons/lu";
import { MdAddHome, MdOutlineAddCard } from "react-icons/md";

const Profile = () => {
  const { currentUser, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // URL'den sekme anahtarını okuyup state'e atıyoruz
  const [selectedTab, setSelectedTab] = useState("userInfo");

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const tab = pathParts[2] || "userInfo";
    setSelectedTab(tab);
  }, [location.pathname]);

  // Sekme değiştirirken URL'yi de güncelleyen fonksiyon
  const handleTabChange = (key) => {
    navigate(`/profile/${key}`);
  };

  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [favorites, setFavorites] = useState([]);

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

  // User information for display
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

  // Update local editable states when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const parts = currentUser.displayName
        ? currentUser.displayName.split(" ")
        : [];
      setEditableFirstName(parts[0] || currentUser.email || "");
      setEditableLastName(parts[1] || "");
      setEditableEmail(currentUser.email || "");
      setEditablePhone(currentUser.phone || "");
    }
  }, [currentUser]);

  // Function to fetch updated account info from MongoDB
  const fetchAccount = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/account/${currentUser.uid}`
      );
      setEditableFirstName(response.data.firstName);
      setEditableLastName(response.data.lastName);
      setEditableEmail(response.data.email);
      setEditablePhone(response.data.phone);
      console.log("Fetched account data:", response.data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  // Call fetchAccount when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchAccount();
    }
  }, [currentUser]);

  // Update user information with reauthentication
  const handleUpdateUser = async () => {
    try {
      if (currentUser.providerData[0]?.providerId === "google.com") {
        await reauthenticateWithPopup(currentUser, new GoogleAuthProvider());
      } else {
        const currentPassword = prompt(
          "Please enter your current password to update your email:"
        );
        if (!currentPassword) {
          throw new Error("Password is required for reauthentication");
        }
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      await updateProfile(currentUser, {
        displayName: `${editableFirstName} ${editableLastName}`,
      });
      if (editableEmail !== currentUser.email) {
        await updateEmail(currentUser, editableEmail);
      }
      await axios.put(
        `http://localhost:5000/api/account/${currentUser.uid.trim()}`,
        {
          firstName: editableFirstName,
          lastName: editableLastName,
          email: editableEmail,
          phone: editablePhone,
        }
      );
      await refreshUser();
      await fetchAccount();
      Swal.fire({
        icon: "success",
        title: "Information Updated",
        text: "Your information has been updated successfully",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("Error updating user:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Please try again.",
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

  const handleOrderClick = (order) => {
    const iconHtml = ReactDOMServer.renderToStaticMarkup(
      <PiShippingContainer size={24} />
    );
    let itemsHtml = "";
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        itemsHtml += `
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <img src="${
              item.coverImage ? getImgUrl(item.coverImage).href : '/default-image.jpg'
            }" alt="${item.title}" style="width:50px; height:70px; object-fit:cover; margin-right:10px; border-radius:4px;" />
            <div>
              <p style="margin:0; font-weight:bold;">${item.title}</p>
              <p style="margin:0; font-size:0.9rem;">Quantity: ${item.quantity} x $${item.price.toFixed(2)}</p>
            </div>
          </div>
        `;
      });
    }
    Swal.fire({
      title: `<strong>Order ${order.orderNumber ? order.orderNumber : order._id}</strong>`,
      html: `
        <div style="text-align: left;">
          <p><strong>Status:</strong> ${order.status || "Pending"}</p>
          <p><strong>Total:</strong> ${
            order.totalPrice !== undefined && order.totalPrice !== null
              ? `$${order.totalPrice.toFixed(2)}`
              : "N/A"
          }</p>
          <p><strong>Placed on:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <hr style="margin: 1rem 0;"/>
          <p style="font-size: 1rem; font-weight:bold;">Items:</p>
          ${itemsHtml}
          <hr style="margin: 1rem 0;"/>
          <p style="font-size: 1rem; font-weight:bold;">Shipping Details:</p>
          <p style="font-size: 0.9rem; display: flex; align-items: center;">
            ${iconHtml} <span style="margin-left: 8px;">${
              order.trackingInfo ||
              "Your order is being processed. Tracking info will be updated soon."
            }</span>
          </p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Apply Lobster font via inline style */}
      <h2 style={{ fontFamily: "Lobster, cursive" }} className="text-4xl font-bold text-gray-800">
        Welcome,
      </h2>

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
                handleTabChange(key);
                cancelEditAddress();
                cancelEditPayment();
              }}
              className={`px-4 py-3 text-lg font-semibold transition-all duration-300 ease-in-out w-full rounded-lg flex items-center justify-start ${
                selectedTab === key
                  ? "bg-blue-700 text-white shadow-lg"
                  : "bg-[rgba(150,150,170,0.3)] text-gray-600 hover:bg-blue-50"
              }`}
            >
              <i className={`${icon} ml-2 mr-2`} style={{ fontSize: "1.2rem" }}></i>
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
          {/* Redesigned Payment Methods Tab */}
          {selectedTab === "payment" && (
            <div className="p-8 bg-white shadow-xl rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-gray-800">
                  Your Payment Methods
                </h3>
                <button
                  onClick={() => setSelectedTab("addPayment")}
                  className="inline-flex items-center px-4 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-900 transition text-sm"
                >
                  <MdOutlineAddCard size={18} className="mr-2" />
                  Add New Payment Method
                </button>
              </div>
              <div className="grid gap-4">
                {payments.length === 0 ? (
                  <p className="text-gray-500">No payment methods added.</p>
                ) : (
                  payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm relative min-h-[150px]"
                    >
                      {editPaymentId === payment._id ? (
                        <div className="w-full">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">Card Number</label>
                              <input
                                type="text"
                                value={editCardNumber}
                                onChange={(e) => setEditCardNumber(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">Expiry Date</label>
                              <input
                                type="text"
                                value={editExpiryDate}
                                onChange={(e) => setEditExpiryDate(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">CVV</label>
                              <input
                                type="text"
                                value={editCvv}
                                onChange={(e) => setEditCvv(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">Cardholder Name</label>
                              <input
                                type="text"
                                value={editCardHolder}
                                onChange={(e) => setEditCardHolder(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end space-x-4">
                            <button
                              onClick={() => handleUpdatePayment(payment._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditPayment}
                              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                        <div className="absolute -top-6 -right-[590px] text-red-600 hover:text-red-800 transition">
                          <button onClick={() => handleDeletePayment(payment._id)}>
                            <LuTrash2 size={20} />
                          </button>
                        </div>
                        <div className="absolute top-20 -right-[600px] text-blue-600 hover:text-blue-800 transition">
                          <button onClick={() => startEditPayment(payment)}>
                            <FaEdit size={24} />
                          </button>
                        </div>
                        <p className="font-semibold">Cardholder: {payment.cardHolder}</p>
                        <p>Card Number: **** **** **** {payment.cardNumber.slice(-4)}</p>
                        <p>Expiry Date: {payment.expiryDate}</p>
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
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-gray-800 mb-4">
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
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-gray-800 mb-4">
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
            <div className="p-6 border rounded-2xl bg-white text-black shadow-lg">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-gray-800 mb-4">
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

          {/* Redesigned Addresses Tab */}
          {selectedTab === "address" && (
            <div className="p-8 bg-white shadow-xl rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-gray-800">
                  Your Addresses
                </h3>
                <button
                  onClick={() => setSelectedTab("addAddress")}
                  className="inline-flex items-center px-4 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-sm"
                >
                  <MdAddHome size={18} className="mr-2" />
                  Add New Address
                </button>
              </div>
              {addresses.length === 0 ? (
                <p className="text-gray-500">No addresses added.</p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className="flex items-center justify-between p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
                    >
                      {editAddressId === address._id ? (
                        <div className="w-full">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">Title</label>
                              <input
                                type="text"
                                value={editAddressTitle}
                                onChange={(e) => setEditAddressTitle(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">Street</label>
                              <input
                                type="text"
                                value={editStreet}
                                onChange={(e) => setEditStreet(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">City</label>
                              <input
                                type="text"
                                value={editCity}
                                onChange={(e) => setEditCity(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">District</label>
                              <input
                                type="text"
                                value={editDistrict}
                                onChange={(e) => setEditDistrict(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">Neighborhood</label>
                              <input
                                type="text"
                                value={editNeighborhood}
                                onChange={(e) => setEditNeighborhood(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">Postal Code</label>
                              <input
                                type="text"
                                value={editPostalCode}
                                onChange={(e) => setEditPostalCode(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-gray-700">Country</label>
                              <input
                                type="text"
                                value={editCountry}
                                onChange={(e) => setEditCountry(e.target.value)}
                                className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end space-x-4">
                            <button
                              onClick={() => handleUpdateAddress(address._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditAddress}
                              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-700">{address.title}</h4>
                          <p className="text-gray-600 mt-1">{address.street}</p>
                          <p className="text-gray-600">
                            {address.city}, {address.district}, {address.neighborhood}
                          </p>
                          <p className="text-gray-600">{address.postalCode}, {address.country}</p>
                          <div className="relative">
                            {/* Delete Icon positioned further above (negative top) at top-left */}
                            <button 
                              onClick={() => handleDeleteAddress(address._id)} 
                              className="absolute -top-28 -right-2 text-red-600 hover:text-red-800 transition"
                            >
                              <LuTrash2 size={20} />
                            </button>
                            {/* Edit Icon positioned further above (negative top) at top-right */}
                            <button 
                              onClick={() => startEditAddress(address)} 
                              className="absolute -top-2 -right-4 text-blue-600 hover:text-blue-800 transition"
                            >
                              <FaEdit size={24} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === "addAddress" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-gray-800 mb-4">
                Add New Address
              </h3>
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

          {/* Reviews Tab */}
          {selectedTab === "reviews" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-gray-800 mb-4">
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
                      {currentUser && review.userId === currentUser.uid && (
                        <button
                          onClick={async () => {
                            try {
                              await axios.delete(`http://localhost:5000/api/reviews/${review._id}`);
                              setReviews(reviews.filter(r => r._id !== review._id));
                            } catch (err) {
                              console.error("Error deleting review:", err);
                              alert("Failed to delete review. Please try again.");
                            }
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          x
                        </button>
                      )}
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
