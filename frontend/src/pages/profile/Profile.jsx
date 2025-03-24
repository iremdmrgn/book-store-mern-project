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
import { SiVisa, SiMastercard, SiAmericanexpress, SiDiscover } from "react-icons/si";

const Profile = () => {
  const { currentUser, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read the tab key from the URL and update state
  const [selectedTab, setSelectedTab] = useState("userInfo");
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const tab = pathParts[2] || "userInfo";
    setSelectedTab(tab);
  }, [location.pathname]);

  // Update URL when changing tabs
  const handleTabChange = (key) => {
    navigate(`/profile/${key}`);
  };

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
  // State for detected card brand
  const [cardBrand, setCardBrand] = useState(null);

  // Auto-format expiry date (insert "/" after two digits)
  const handleExpiryDateChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 4) input = input.slice(0, 4);
    if (input.length > 2) {
      input = input.slice(0, 2) + "/" + input.slice(2);
    }
    setExpiryDate(input);
  };

  // Allow only 3 numeric digits for CVV
  const handleCvvChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 3) input = input.slice(0, 3);
    setCvv(input);
  };

  // Detect card brand based on card number (including Troy detection)
  const detectCardBrand = (number) => {
    const cleaned = number.replace(/\s+/g, "");
    if (cleaned.startsWith("4")) return "visa";
    if (cleaned.startsWith("5")) return "mastercard";
    if (cleaned.startsWith("34") || cleaned.startsWith("37")) return "amex";
    if (cleaned.startsWith("9792")) return "troy";
    if (cleaned.startsWith("6")) return "discover";
    return null;
  };

  // Update card number and detect brand
  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    setCardNumber(value);
    const brand = detectCardBrand(value);
    setCardBrand(brand);
  };

  // Reviews state (for the Reviews tab)
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);

  const { data: orders } = useGetOrderByEmailQuery(currentUser?.email || "");

  useEffect(() => {
    if (!currentUser) {
      window.location.href = "/login";
    }
  }, [currentUser]);

  // User information for display
  const userName = currentUser?.displayName ? currentUser.displayName.split(" ") : [];
  const firstNameDisplay = userName[0] || currentUser?.email || "";
  const lastNameDisplay = userName[1] || "";

  // Editable states for user information
  const [editableFirstName, setEditableFirstName] = useState(firstNameDisplay);
  const [editableLastName, setEditableLastName] = useState(lastNameDisplay);
  const [editableEmail, setEditableEmail] = useState(currentUser?.email || "");
  const [editablePhone, setEditablePhone] = useState(currentUser?.phone || "");

  useEffect(() => {
    if (currentUser) {
      const parts = currentUser.displayName ? currentUser.displayName.split(" ") : [];
      setEditableFirstName(parts[0] || currentUser.email || "");
      setEditableLastName(parts[1] || "");
      setEditableEmail(currentUser.email || "");
      setEditablePhone(currentUser.phone || "");
    }
  }, [currentUser]);

  // Fetch updated account info from MongoDB
  const fetchAccount = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/account/${currentUser.uid}`);
      setEditableFirstName(response.data.firstName);
      setEditableLastName(response.data.lastName);
      setEditableEmail(response.data.email);
      setEditablePhone(response.data.phone);
      console.log("Fetched account data:", response.data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

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
        const currentPassword = prompt("Please enter your current password to update your email:");
        if (!currentPassword) {
          throw new Error("Password is required for reauthentication");
        }
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }

      await updateProfile(currentUser, {
        displayName: `${editableFirstName} ${editableLastName}`,
      });
      if (editableEmail !== currentUser.email) {
        await updateEmail(currentUser, editableEmail);
      }
      await axios.put(`http://localhost:5000/api/account/${currentUser.uid.trim()}`, {
        firstName: editableFirstName,
        lastName: editableLastName,
        email: editableEmail,
        phone: editablePhone,
      });
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
      const response = await axios.get(`http://localhost:5000/api/address/${currentUser.uid.trim()}`);
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
        await axios.post(`http://localhost:5000/api/address/${currentUser.uid.trim()}`, newAddress);
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
      await axios.delete(`http://localhost:5000/api/address/${currentUser.uid.trim()}/${addressId}`);
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
        await axios.put(`http://localhost:5000/api/address/${currentUser.uid.trim()}/${addressId}`, updatedAddress);
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
      const response = await axios.get(`http://localhost:5000/api/payment-method/${currentUser.uid.trim()}`);
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

  // Helper functions for validating payment inputs
  const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const validateExpiryDate = (date) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(date)) return false;
    const [month, year] = date.split("/");
    const expiry = new Date(parseInt("20" + year), parseInt(month) - 1, 1);
    const now = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    expiry.setDate(expiry.getDate() - 1);
    return expiry >= now;
  };

  const validateCVV = (cvvValue) => {
    return /^\d{3}$/.test(cvvValue);
  };

  const handleAddPayment = async () => {
    if (
      cardNumber.trim() !== "" &&
      expiryDate.trim() !== "" &&
      cvv.trim() !== "" &&
      cardHolder.trim() !== ""
    ) {
      if (!validateCardNumber(cardNumber)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Card Number",
          text: "Please enter a valid card number.",
        });
        return;
      }
      if (!validateExpiryDate(expiryDate)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Expiry Date",
          text: "Please enter a valid expiry date in MM/YY format and ensure it is not expired.",
        });
        return;
      }
      if (!validateCVV(cvv)) {
        Swal.fire({
          icon: "error",
          title: "Invalid CVV",
          text: "Please enter a valid CVV (3 digits).",
        });
        return;
      }
      const newPayment = { cardNumber, expiryDate, cvv, cardHolder };
      try {
        await axios.post(`http://localhost:5000/api/payment-method/${currentUser.uid.trim()}`, newPayment);
        fetchPaymentMethods();
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
        setCardHolder("");
        setCardBrand(null);
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
      await axios.delete(`http://localhost:5000/api/payment-method/${currentUser.uid.trim()}/${methodId}`);
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
      const updatedPayment = { cardNumber: editCardNumber, expiryDate: editExpiryDate, cvv: editCvv, cardHolder: editCardHolder };
      try {
        await axios.put(`http://localhost:5000/api/payment-method/${currentUser.uid.trim()}/${paymentId}`, updatedPayment);
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
    const iconHtml = ReactDOMServer.renderToStaticMarkup(<PiShippingContainer size={24} />);
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
              order.trackingInfo || "Your order is being processed. Tracking info will be updated soon."
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

  // Fetch reviews for the user. If a review does not have a coverImage, fetch the book data.
  const fetchUserReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/user/${currentUser.uid}`);
      const reviewsData = response.data;
      const updatedReviews = await Promise.all(
        reviewsData.map(async (review) => {
          if (!review.coverImage) {
            try {
              const { data: book } = await axios.get(`http://localhost:5000/api/books/${review.bookId}`);
              return { ...review, coverImage: book.coverImage, bookTitle: book.title || review.bookTitle };
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
      {/* Apply Lobster font */}
      <h2 style={{ fontFamily: "Lobster, cursive" }} className="text-4xl font-bold text-black">
        Welcome,
      </h2>

      <div className="flex items-center mt-4">
        <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black text-xl font-semibold">
          {firstNameDisplay[0]}
          {lastNameDisplay[0]}
        </div>
        <div className="ml-4">
          <p className="font-semibold text-lg text-black">
            {firstNameDisplay} {lastNameDisplay}
          </p>
        </div>
      </div>

      <div className="mt-6 flex space-x-6">
        {/* Sidebar Tabs */}
        <div className="flex flex-col w-1/5 space-y-4">
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
                  ? "bg-gray-300 text-black shadow-lg"
                  : "bg-[rgba(150,150,170,0.3)] text-black hover:bg-gray-100"
              }`}
            >
              <i className={`${icon} ml-2 mr-2`} style={{ fontSize: "1.2rem" }}></i>
              {label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="px-6 py-3 text-lg font-semibold bg-gray-400 text-black rounded-md w-full mt-6 transition-colors duration-300 ease-in-out hover:bg-gray-700 shadow-lg"
          >
            Log Out
          </button>
        </div>

        <div className="w-3/4">
          {/* Payment Methods Tab */}
          {selectedTab === "payment" && (
            <div className="p-8 bg-white shadow-xl rounded-xl w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black">
                  Your Payment Methods
                </h3>
                <button
                  onClick={() => setSelectedTab("addPayment")}
                  className="inline-flex items-center px-4 py-1 text-blue-900"
                >
                  <MdOutlineAddCard size={24} className="mr-2" />
                  Add New Payment Method
                </button>
              </div>
              <div className="grid gap-4">
                {payments.length === 0 ? (
                  <p className="text-black">No payment methods added.</p>
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
                              <label className="text-sm font-semibold text-black">Card Number</label>
                              <input
                                type="text"
                                value={editCardNumber}
                                onChange={(e) => setEditCardNumber(e.target.value)}
                                className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-black">Expiry Date</label>
                              <input
                                type="text"
                                value={editExpiryDate}
                                onChange={(e) => setEditExpiryDate(e.target.value)}
                                className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-black">CVV</label>
                              <input
                                type="text"
                                value={editCvv}
                                onChange={(e) => setEditCvv(e.target.value)}
                                className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-black">Cardholder Name</label>
                              <input
                                type="text"
                                value={editCardHolder}
                                onChange={(e) => setEditCardHolder(e.target.value)}
                                className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end space-x-4">
  <button
    onClick={() => handleUpdatePayment(payment._id)}
    className="px-6 py-1 text-sm bg-gray-400 text-black rounded-lg hover:bg-gray-500 transition"
  >
    Save
  </button>
  <button
    onClick={cancelEditPayment}
    className="px-6 py-1 text-sm bg-gray-400 text-black rounded-lg hover:bg-gray-500 transition"
  >
    Cancel
  </button>
</div>

                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute -top-2 -right-[300px] text-red-600 hover:text-red-800 transition">
                            <button onClick={() => handleDeletePayment(payment._id)}>
                              <LuTrash2 size={20} />
                            </button>
                          </div>
                          <div className="absolute top-28 -right-[310px] text-blue-900">
                            <button onClick={() => startEditPayment(payment)}>
                              <FaEdit size={24} />
                            </button>
                          </div>
                          {/* Display bank logo for saved card */}
                          <div className="flex items-center mb-2">
                            {detectCardBrand(payment.cardNumber) === "visa" && (
                              <SiVisa size={46} style={{ color: "#1A1F71" }} className="mr-2" />
                            )}
                            {detectCardBrand(payment.cardNumber) === "mastercard" && (
                              <SiMastercard size={46} style={{ color: "#EB001B" }} className="mr-2" />
                            )}
                            {detectCardBrand(payment.cardNumber) === "amex" && (
                              <SiAmericanexpress size={46} style={{ color: "#2E77BC" }} className="mr-2" />
                            )}
                            {detectCardBrand(payment.cardNumber) === "discover" && (
                              <SiDiscover size={46} style={{ color: "#FF6000" }} className="mr-2" />
                            )}
                            {detectCardBrand(payment.cardNumber) === "troy" && (
                              <span className="mr-2" style={{ fontSize: "42px", fontWeight: "bold", color: "#0085C7" }}>
                                Troy
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-black text-lg">Cardholder: {payment.cardHolder}</p>
<p className="text-black">Card Number: **** **** **** {payment.cardNumber.slice(-4)}</p>
<p className="text-black">Expiry Date: {payment.expiryDate}</p>

                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Add Payment Tab */}
          {selectedTab === "addPayment" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg w-full max-w-2xl">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black mb-4">
                Add New Payment Method
              </h3>
              <div className="grid gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Card Number</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234567890123456"
                      required
                      inputMode="numeric"
                      maxLength={19}
                      pattern="^[0-9]{13,19}$"
                      className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300 flex-1"
                    />
                    {cardBrand === "visa" && (
                      <SiVisa size={46} style={{ color: "#1A1F71" }} className="ml-2" />
                    )}
                    {cardBrand === "mastercard" && (
                      <SiMastercard size={46} style={{ color: "#EB001B" }} className="ml-2" />
                    )}
                    {cardBrand === "amex" && (
                      <SiAmericanexpress size={46} style={{ color: "#2E77BC" }} className="ml-2" />
                    )}
                    {cardBrand === "discover" && (
                      <SiDiscover size={46} style={{ color: "#FF6000" }} className="ml-2" />
                    )}
                    {cardBrand === "troy" && (
                      <span className="ml-2" style={{ fontSize: "42px", fontWeight: "bold", color: "#0085C7" }}>
                        Troy
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Expiry Date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    required
                    maxLength={5}
                    pattern="^(0[1-9]|1[0-2])\/\d{2}$"
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    required
                    inputMode="numeric"
                    maxLength={3}
                    pattern="^\d{3}$"
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex justify-end">
  <button
    onClick={handleAddPayment}
    className="mt-4 w-auto px-5 py-2 bg-gray-300 text-black font-semibold rounded-lg hover:bg-gray-400"
  >
    Save Payment Method
  </button>
</div>

              </div>
            </div>
          )}

          {/* Orders Tab */}
          {selectedTab === "orders" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg w-full max-w-2xl">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black mb-4">
                Your Orders
              </h3>
              <div>
                {orders?.length === 0 && <p className="text-black">No orders found</p>}
                {orders?.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => handleOrderClick(order)}
                    className="p-4 bg-gray-100 rounded-lg mb-4 cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-4"
                  >
                    {order.items && order.items.length > 0 && (
                      <img
                        src={order.items[0].coverImage ? getImgUrl(order.items[0].coverImage).href : "/default-image.jpg"}
                        alt="Book cover"
                        className="w-20 h-20 object-cover rounded shadow"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-black">
                        Order Number: {order.orderNumber ? order.orderNumber : order._id}
                      </p>
                      <p className="text-black">Status: {order.status ? order.status : "Pending"}</p>
                      <p className="text-black">
                        Total: {order.totalPrice !== undefined && order.totalPrice !== null ? `$${order.totalPrice.toFixed(2)}` : "N/A"}
                      </p>
                      <p className="text-black">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Information Tab */}
          {selectedTab === "userInfo" && (
            <div className="p-6 border rounded-2xl bg-white text-black shadow-lg w-full max-w-2xl">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black mb-4">
                Your Information
              </h3>
              <div className="grid gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">First Name</label>
                  <input
                    type="text"
                    value={editableFirstName}
                    onChange={(e) => setEditableFirstName(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Last Name</label>
                  <input
                    type="text"
                    value={editableLastName}
                    onChange={(e) => setEditableLastName(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Phone Number</label>
                  <input
                    type="text"
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Email</label>
                  <input
                    type="email"
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex justify-end">
  <button
    onClick={handleUpdateUser}
    className="mt-4 w-auto px-5 py-2 bg-gray-300 text-black font-semibold rounded-lg hover:bg-gray-400"
  >
    Update Information
  </button>
</div>

              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {selectedTab === "address" && (
            <div className="p-8 bg-white shadow-xl rounded-xl w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black">
                  Your Addresses
                </h3>
                <button onClick={() => setSelectedTab("addAddress")} className="inline-flex items-center px-4 py-1 text-blue-900">
                  <MdAddHome size={24} className="mr-2" /> Add New Address
                </button>
              </div>
              {addresses.length === 0 ? (
                <p className="text-black">No addresses added.</p>
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
                              <label className="text-sm font-semibold text-black">Title</label>
                              <input type="text" value={editAddressTitle} onChange={(e) => setEditAddressTitle(e.target.value)} className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-black">Street</label>
                              <input type="text" value={editStreet} onChange={(e) => setEditStreet(e.target.value)} className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-black">City</label>
                              <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-black">District</label>
                              <input type="text" value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)} className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-black">Neighborhood</label>
                              <input type="text" value={editNeighborhood} onChange={(e) => setEditNeighborhood(e.target.value)} className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-black">Postal Code</label>
                              <input type="text" value={editPostalCode} onChange={(e) => setEditPostalCode(e.target.value)} className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300" />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-semibold text-black">Country</label>
                              <input type="text" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300" />
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end space-x-4">
  <button
    onClick={() => handleUpdateAddress(address._id)}
    className="px-6 py-1 text-sm bg-gray-400 text-black rounded-lg transition"
  >
    Save
  </button>
  <button
    onClick={cancelEditAddress}
    className="px-6 py-1 text-sm bg-gray-400 text-black rounded-lg hover:bg-gray-500 transition"
  >
    Cancel
  </button>
</div>

                        </div>
                      ) : (
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-black">{address.title}</h4>
                          <p className="text-black mt-1">{address.street}</p>
                          <p className="text-black">
                            {address.city}, {address.district}, {address.neighborhood}
                          </p>
                          <p className="text-black">{address.postalCode}, {address.country}</p>
                          <div className="relative">
                            <button onClick={() => handleDeleteAddress(address._id)} className="absolute -top-28 -right-2 text-red-600 hover:text-red-800 transition">
                              <LuTrash2 size={20} />
                            </button>
                            <button onClick={() => startEditAddress(address)} className="absolute -top-2 -right-4 text-blue-900">
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
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg w-full max-w-2xl">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-mb-4">
                Add New Address
              </h3>
              <div className="grid gap-4">
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Title</label>
                  <input
                    type="text"
                    value={newAddressTitle}
                    onChange={(e) => setNewAddressTitle(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Street</label>
                  <input
                    type="text"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">District</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Neighborhood</label>
                  <input
                    type="text"
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Postal Code</label>
                  <input
                    type="text"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block font-semibold text-black">Country</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="border p-2 rounded-md focus:ring-gray-300 focus:border-gray-300"
                  />
                </div>
                <div className="flex justify-end">
  <button
    onClick={handleAddAddress}
    className="mt-4 w-auto px-5 py-2 bg-gray-300 text-black font-semibold rounded-lg hover:bg-gray-400"
  >
    Save Address
  </button>
</div>

              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {selectedTab === "reviews" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg w-full max-w-2xl">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black mb-4">
                Your Reviews
              </h3>
              <div className="mt-8 space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm flex items-start">
                      <img
                        src={review.coverImage ? getImgUrl(review.coverImage).href : "/default-image.jpg"}
                        alt={review.bookTitle ? review.bookTitle : "Review"}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-xl ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}>
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-black">
                          <strong>{review.reviewer}</strong> reviewed{" "}
                          <span className="font-bold">{review.bookTitle ? review.bookTitle : ""}</span>: {review.text}
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
                  <p className="text-black">No reviews yet. Be the first to review this book!</p>
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
