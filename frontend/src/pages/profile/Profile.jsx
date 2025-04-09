import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGetOrderByEmailQuery } from "../../redux/features/orders/ordersApi";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { getImgUrl } from "../../utils/getImgUrl";
import axios from "axios";
import { FaEdit, FaRegClipboard, FaTools, FaCheckCircle } from "react-icons/fa";
import { PiShippingContainer } from "react-icons/pi";
import { FaBoxOpen } from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";
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
import io from "socket.io-client";

// ------------------
// Order Status Tracker – shows all stages (used in modal)
// ------------------
const OrderStatusTracker = ({ status }) => {
  const steps = ["Order Received", "Preparing Order", "Shipped", "Delivered"];
  let currentIndex = steps.findIndex((step) => step === status);
  if (currentIndex === -1) currentIndex = 0; // default to first step if no match
  return (
    <div className="flex items-center space-x-2 mt-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  isCompleted
                    ? "bg-green-500"
                    : isActive
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs text-center mt-1">{step}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 ${
                  index < currentIndex
                    ? "bg-green-500"
                    : index === currentIndex
                    ? "bg-gray-500"
                    : "bg-gray-300"
                }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ------------------
// Shipping Status Tracker – similar to above but for shipping events
// ------------------
// Bu bileşende opsiyonel olarak timeline prop'u var. timeline, her adım için zamanı içeren nesneler dizisi
const ShippingStatusTracker = ({ shippingStatus, timeline }) => {
  const steps = [
    { step: "Shipped", info: "Shipment has started", location: "Istanbul, Turkey" },
    { step: "In Transit", info: "On the way", location: "Ankara, Turkey" },
    { step: "At the Shipping Facility", info: "Waiting at the facility", location: "Izmir, Turkey" },
    { step: "Out for Delivery", info: "Out for delivery", location: "Bursa, Turkey" },
    { step: "Delivered", info: "Delivered", location: "Kocaeli, Turkey" },
  ];

  let currentIndex = steps.findIndex(
    (stepObj) => stepObj.step.toLowerCase() === shippingStatus.toLowerCase()
  );
  if (currentIndex === -1) currentIndex = 0; // Eşleşme yoksa ilk adımdan başla

  return (
    <div className="space-y-4">
      {steps.map((stepObj, index) => {
        // Zaman bilgisi sadece mevcut ve geçmiş adımlar için gösterilecek
        const timeDetail = timeline && index <= currentIndex ? timeline[index].time : null;
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={stepObj.step} className="flex items-start space-x-4">
            {/* Yuvarlak sayı ve adım ismi için kapsayıcı (genişlik artırıldı) */}
            <div className="flex flex-col items-center w-20">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  isCompleted
                    ? "bg-blue-500"
                    : isActive
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-1 text-center whitespace-nowrap">
                {stepObj.step}
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-2"></div>
            {/* Detay bilgileri */}
            <div className="flex flex-col text-sm font-medium text-gray-600 w-48 text-left space-y-1">
              {index <= currentIndex && (
                <div className="text-xs text-gray-500">{stepObj.location}</div>
              )}
              {index <= currentIndex && (
                <div className="text-xs text-gray-500">{stepObj.info}</div>
              )}
              {timeDetail && index <= currentIndex && (
                <div className="text-xs text-gray-500">{timeDetail}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};













// ------------------
// Minimal Order Status Indicator – used in order list view (unchanged)
// ------------------
const OrderStatusIndicator = ({ status }) => {
  const statusMap = {
    "Order Received": {
      icon: <FaRegClipboard />,
      color: "text-green-500",
      label: "Order Received",
    },
    "Preparing Order": {
      icon: <FaBoxOpen />,
      color: "text-green-500",
      label: "Preparing Order",
    },
    Shipped: {
      icon: <MdLocalShipping />,
      color: "text-green-500",
      label: "Shipped",
    },
    Delivered: {
      icon: <FaCheckCircle />,
      color: "text-green-500",
      label: "Delivered",
    },
  };
  const current = statusMap[status] || statusMap["Order Received"];
  return (
    <div className="flex items-center space-x-1 mt-2">
      <span className={`text-xl ${current.color}`}>{current.icon}</span>
      <span className="text-sm font-medium">{current.label}</span>
    </div>
  );
};

const Profile = () => {
  const { currentUser, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState("userInfo");
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const tab = pathParts[2] || "userInfo";
    setSelectedTab(tab);
  }, [location.pathname]);

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

  const handleExpiryDateChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 4) input = input.slice(0, 4);
    if (input.length > 2) {
      input = input.slice(0, 2) + "/" + input.slice(2);
    }
    setExpiryDate(input);
  };

  const handleCvvChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 3) input = input.slice(0, 3);
    setCvv(input);
  };

  const detectCardBrand = (number) => {
    const cleaned = number.replace(/\s+/g, "");
    if (cleaned.startsWith("4")) return "visa";
    if (cleaned.startsWith("5")) return "mastercard";
    if (cleaned.startsWith("34") || cleaned.startsWith("37")) return "amex";
    if (cleaned.startsWith("9792")) return "troy";
    if (cleaned.startsWith("6")) return "discover";
    return null;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    setCardNumber(value);
    const brand = detectCardBrand(value);
    setCardBrand(brand);
  };

  // Reviews state
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);

  // Fetch orders using RTK Query
  const { data: orders } = useGetOrderByEmailQuery(currentUser?.email || "");

  // Local state for customer orders to allow real-time socket updates
  const [customerOrders, setCustomerOrders] = useState([]);
  useEffect(() => {
    if (orders) {
      setCustomerOrders(orders);
    }
  }, [orders]);

  // Socket integration: listen for "orderUpdated" events and update local orders
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("orderUpdated", (updatedOrder) => {
      if (updatedOrder.email === currentUser?.email) {
        setCustomerOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      window.location.href = "/login";
    }
  }, [currentUser]);

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

  useEffect(() => {
    if (currentUser) {
      fetchAccount();
    }
  }, [currentUser]);

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

  const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s+/g, "");
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
        await axios.post(
          `http://localhost:5000/api/payment-method/${currentUser.uid.trim()}`,
          newPayment
        );
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

  const handleOrderClick = (order) => {
    // Order progress tracker (durum takibi)
    const statusTrackerHtml = ReactDOMServer.renderToStaticMarkup(
      <OrderStatusTracker status={order.status || "Order Received"} />
    );
  
    // Kullanıcı bilgileri
    const userInfoHtml = `
      <div style="margin-top: 1rem;">
        <h4>User Information</h4>
        <p><strong>Name:</strong> ${editableFirstName} ${editableLastName}</p>
        <p><strong>Email:</strong> ${editableEmail}</p>
        <p><strong>Phone:</strong> ${editablePhone}</p>
      </div>
    `;
  
    // Delivery Address: Eğer order.address nesnesi varsa,
    // checkout bölümünüzdeki gibi "Data Net Bilgisayar - Muhittin mahallesi, Tekirdağ, 58760, Türkiye" formatında gösterilsin.
    const addressHtml = order.address && typeof order.address === "object"
      ? `
        <div style="margin-top: 1rem; text-align: left;">
          <h4>Delivery Address</h4>
          <p style="color: #4a5568; font-size: 0.9rem;">
            ${order.address.title ? order.address.title + " - " : ""}
            ${order.address.street ? order.address.street + ", " : ""}
            ${order.address.city ? order.address.city + ", " : ""}
            ${order.address.postalCode ? order.address.postalCode + ", " : ""}
            ${order.address.country || ""}
          </p>
        </div>
      `
      : order.address
        ? `
        <div style="margin-top: 1rem; text-align: left;">
          <h4>Delivery Address</h4>
          <p style="color: #4a5568; font-size: 0.9rem;">${order.address}</p>
        </div>
      `
        : "";
  
    // Payment Method: Eğer order.paymentMethod nesnesel ise, checkout'taki gibi detaylı gösterelim.
    let paymentHtml = "";
    if (order.paymentMethod && typeof order.paymentMethod === "object") {
      let bankLogoHtml = "";
      const brand = detectCardBrand(order.paymentMethod.cardNumber);
      if (brand === "visa") {
        bankLogoHtml = `<img src="/path-to-visa-logo.png" alt="Visa" style="width:32px; margin-right:8px;" />`;
      } else if (brand === "mastercard") {
        bankLogoHtml = `<img src="/path-to-mastercard-logo.png" alt="Mastercard" style="width:32px; margin-right:8px;" />`;
      } else if (brand === "amex") {
        bankLogoHtml = `<img src="/path-to-amex-logo.png" alt="Amex" style="width:32px; margin-right:8px;" />`;
      } else if (brand === "discover") {
        bankLogoHtml = `<img src="/path-to-discover-logo.png" alt="Discover" style="width:32px; margin-right:8px;" />`;
      }
      paymentHtml = `
        <div style="margin-top: 1rem; text-align: left;">
          <h4>Payment Method</h4>
          <p style="color: #4a5568; font-size: 0.9rem; display: flex; align-items: center;">
            ${bankLogoHtml}
            ${order.paymentMethod.cardHolder} — **** **** **** ${order.paymentMethod.cardNumber.slice(-4)} (Exp: ${order.paymentMethod.expiryDate})
          </p>
        </div>
      `;
    } else if (order.paymentMethod) {
      paymentHtml = `
        <div style="margin-top: 1rem; text-align: left;">
          <h4>Payment Method</h4>
          <p style="color: #4a5568; font-size: 0.9rem;">${order.paymentMethod}</p>
        </div>
      `;
    }
  
    // Order items HTML: Her bir sipariş ürününü checkout'taki gibi listeleyelim.
    let itemsHtml = "";
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        itemsHtml += `
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <img src="${
              item.coverImage ? getImgUrl(item.coverImage) : '/default-image.jpg'
            }" alt="${item.title}" style="width:50px; height:70px; object-fit:cover; margin-right:10px; border-radius:4px;" />
            <div>
              <p style="margin:0; font-weight:bold;">${item.title}</p>
              <p style="margin:0; font-size:0.9rem;">Quantity: ${item.quantity} x $${item.price.toFixed(2)}</p>
            </div>
          </div>
        `;
      });
    }
  
    // Shipping Information: Eğer order.shippingStatus varsa (ve "Pending" değilse)
    const shippingSectionHtml =
      order.shippingStatus && order.shippingStatus !== "Pending"
        ? `
        <div style="margin-top: 1rem;">
          <h4>Shipping Information</h4>
          <p><strong>Status:</strong> ${order.shippingStatus}</p>
          <button id="view-shipping-tracking" style="padding: 8px 16px; background-color: #007bff; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
            View Tracking Details
          </button>
        </div>
      `
        : "";
  
    // Assemble final modal HTML:
    const modalHtml = `
      <div style="text-align: left;">
        <p><strong>Order No:</strong> ${order.orderNumber ? order.orderNumber : order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Order Summary:</strong> ${
          order.items && order.items.length > 0
            ? `${order.items.length} item${order.items.length > 1 ? "s" : ""}`
            : "N/A"
        }</p>
        <p><strong>Total:</strong> ${
          order.totalPrice !== undefined && order.totalPrice !== null
            ? `$${order.totalPrice.toFixed(2)}`
            : "N/A"
        }</p>
        ${statusTrackerHtml}
        <hr style="margin: 1rem 0;"/>
        <p style="font-size: 1rem; font-weight:bold;">Items:</p>
        ${itemsHtml}
        ${userInfoHtml}
        ${addressHtml}
        ${paymentHtml}
        ${shippingSectionHtml}
      </div>
    `;
  
    Swal.fire({
      title: `<strong>Order Details</strong>`,
      html: modalHtml,
      width: "600px",
      showCloseButton: true,
      confirmButtonText: "Close",
      customClass: {
        title: "swal2-title-custom",
        htmlContainer: "swal2-html-container-custom",
      },
      didOpen: (domElement) => {
        const btn = domElement.querySelector("#view-shipping-tracking");
        if (btn) {
          btn.addEventListener("click", () => {
            const sampleTimeline = [
              { step: "Shipped", time: "10:30 AM" },
              { step: "In Transit", time: "12:00 PM" },
              { step: "At the Shipping Facility", time: "02:15 PM" },
              { step: "Out for Delivery", time: "04:00 PM" },
              { step: "Delivered", time: "06:45 PM" },
            ];
            const shippingTrackerHtml = ReactDOMServer.renderToStaticMarkup(
              <ShippingStatusTracker shippingStatus={order.shippingStatus} timeline={sampleTimeline} />
            );
            Swal.fire({
              title: "Shipping Tracking Details",
              html: shippingTrackerHtml,
              width: "600px",
              confirmButtonText: "Close",
            });
          });
        }
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
          if (!review.coverImage) {
            try {
              const { data: book } = await axios.get(
                `http://localhost:5000/api/books/${review.bookId}`
              );
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
          {selectedTab === "payment" && (
            <div className="p-8 bg-white shadow-xl rounded-xl w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black">
                  My Payment Methods
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
                              onClick={() => handleDeletePayment(payment._id)}
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

          {selectedTab === "orders" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg w-full max-w-2xl">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black mb-4">
                My Orders
              </h3>
              <div>
                {customerOrders?.length === 0 && <p className="text-black">No orders found</p>}
                {customerOrders?.map((order) => (
                  <div key={order._id} className="p-4 bg-gray-100 rounded-lg mb-4">
                    <div className="flex flex-col">
                      {/* Top section with Date, Total and Details button */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-black"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-black"><strong>Total:</strong> {order.totalPrice !== undefined && order.totalPrice !== null ? `$${order.totalPrice.toFixed(2)}` : "N/A"}</p>
                        </div>
                        <div className="text-blue-600 cursor-pointer" onClick={() => handleOrderClick(order)}>
                          Details
                        </div>
                      </div>
                      <hr className="my-2" />
                      {/* Bottom section: Status and product images */}
                      <div className="mb-2">
                        <OrderStatusIndicator status={order.status || "Order Received"} />
                      </div>
                      <div className="flex space-x-2">
                        {order.items && order.items.map((item, idx) => (
                          <img
                            key={idx}
                            src={item.coverImage ? getImgUrl(item.coverImage) : "/default-image.jpg"}
                            alt="Book cover"
                            className="w-20 h-20 object-cover rounded shadow"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "userInfo" && (
            <div className="p-6 border rounded-2xl bg-white text-black shadow-lg w-full max-w-2xl">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black mb-4">
                My Information
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

          {selectedTab === "address" && (
            <div className="p-8 bg-white shadow-xl rounded-xl w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black">
                  My Addresses
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
                          <p className="text-black">
                            {address.postalCode}, {address.country}
                          </p>
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
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black mb-4">
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

          {selectedTab === "reviews" && (
            <div className="p-6 border rounded-lg bg-white text-black shadow-lg w-full max-w-2xl">
              <h3 style={{ fontFamily: "Lobster, cursive" }} className="text-3xl font-semibold text-black mb-4">
                My Reviews
              </h3>
              <div className="mt-8 space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm flex items-start">
                      <img
                        src={review.coverImage ? getImgUrl(review.coverImage) : "/default-image.jpg"}
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
