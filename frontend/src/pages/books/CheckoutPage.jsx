import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';
import axios from 'axios';
import { getImgUrl } from '../../utils/getImgUrl';
import { clearCartAsync } from '../../redux/features/cart/cartSlice';
import { SiVisa, SiMastercard, SiAmericanexpress, SiDiscover } from 'react-icons/si';

const CheckoutPage = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const totalPrice = cartItems.reduce((acc, item) => acc + item.newPrice * item.quantity, 0).toFixed(2);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
    trigger,
  } = useForm();

  // 4 steps: 1. Personal Info, 2. Address, 3. Payment, 4. Review
  const [step, setStep] = useState(1);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  // -------------- ADDRESS STATES --------------
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressOption, setSelectedAddressOption] = useState('saved'); // 'saved' or 'new'
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/address/${currentUser.uid.trim()}`);
        setSavedAddresses(response.data);
        if (response.data.length > 0) {
          setSelectedSavedAddress(response.data[0]);
          setSelectedAddressOption('saved');
        } else {
          setSelectedAddressOption('new');
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    if (currentUser?.uid) fetchSavedAddresses();
  }, [currentUser]);

  // -------------- PAYMENT STATES --------------
  const [savedPayments, setSavedPayments] = useState([]);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('saved'); // 'saved' or 'new'
  const [selectedSavedPayment, setSelectedSavedPayment] = useState(null);

  useEffect(() => {
    const fetchSavedPayments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/payment-method/${currentUser.uid.trim()}`);
        setSavedPayments(response.data);
        if (response.data.length > 0) {
          setSelectedSavedPayment(response.data[0]);
          setSelectedPaymentOption('saved');
        } else {
          setSelectedPaymentOption('new');
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };
    if (currentUser?.uid) fetchSavedPayments();
  }, [currentUser]);

  // Helper to detect card brand
  const detectCardBrand = (number) => {
    const cleaned = number.replace(/\s+/g, "");
    if (cleaned.startsWith("4")) return "visa";
    if (cleaned.startsWith("5")) return "mastercard";
    if (cleaned.startsWith("34") || cleaned.startsWith("37")) return "amex";
    if (cleaned.startsWith("9792")) return "troy";
    if (cleaned.startsWith("6")) return "discover";
    return null;
  };

  // Watch new address and payment fields
  const watchedAddress = watch(["addressTitle", "address", "city", "state", "zipcode", "country"]);
  const watchedPayment = watch(["cardNumber", "expiryDate", "cvv", "cardHolder"]);

  // ---- Personal Information ----
  const [editableFirstName, setEditableFirstName] = useState("");
  const [editableLastName, setEditableLastName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhone, setEditablePhone] = useState("");

  useEffect(() => {
    if (currentUser) {
      const parts = currentUser.displayName ? currentUser.displayName.split(" ") : [];
      setEditableFirstName(parts[0] || currentUser.email || "");
      setEditableLastName(parts[1] || "");
      setEditableEmail(currentUser.email || "");
    }
  }, [currentUser]);

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

  useEffect(() => {
    setValue("phone", editablePhone);
    setValue("email", editableEmail);
    setValue("name", `${editableFirstName} ${editableLastName}`);
  }, [editablePhone, editableEmail, editableFirstName, editableLastName, setValue]);

  const onSubmit = async (data) => {
    const deliveryAddress = selectedAddressOption === 'saved' && selectedSavedAddress
      ? {
          address: selectedSavedAddress.street,
          city: selectedSavedAddress.city,
          state: selectedSavedAddress.state || "",
          zipcode: selectedSavedAddress.postalCode,
          country: selectedSavedAddress.country,
        }
      : {
          address: data.address,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          country: data.country,
        };

    const paymentMethod = selectedPaymentOption === 'saved' && selectedSavedPayment
      ? {
          cardHolder: selectedSavedPayment.cardHolder,
          cardNumber: selectedSavedPayment.cardNumber,
          expiryDate: selectedSavedPayment.expiryDate,
        }
      : {
          cardHolder: data.cardHolder,
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate,
          cvv: data.cvv,
        };

    const orderData = {
      name: data.name,
      email: data.email,
      address: {
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zipcode: deliveryAddress.zipcode,
        country: deliveryAddress.country,
      },
      phone: Number(data.phone),
      items: cartItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        coverImage: item.coverImage,
        price: item.newPrice,
        quantity: Number(item.quantity)
      })),
      totalPrice: Number(totalPrice),
    };

    console.log("Order Data:", orderData);

    try {
      await createOrder(orderData).unwrap();
      dispatch(clearCartAsync(currentUser.uid));

      Swal.fire({
        title: 'Order Confirmed',
        text: 'Your order has been placed successfully!',
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'View Orders',
        cancelButtonText: 'Return Home'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profile/orders');
        } else {
          window.location.href = 'http://localhost:5173';
        }
      });
    } catch (error) {
      console.error('Order submission error:', error);
      Swal.fire({
        title: 'Order Failed',
        text: 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Okay',
      });
    }
  };

  if (isLoading) return <div className="text-center py-8">Processing your order...</div>;

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Address" },
    { number: 3, title: "Payment" },
    { number: 4, title: "Review" },
  ];

  const handleStepClick = async (targetStep) => {
    if (targetStep < step) {
      setStep(targetStep);
      return;
    }
    if (targetStep === 2) {
      const valid = await trigger(["name", "phone"]);
      if (valid) setStep(2);
      else
        Swal.fire({
          title: 'Incomplete',
          text: 'Please fill in all required Personal Info fields first.',
          icon: 'warning',
        });
    } else if (targetStep === 3) {
      if (selectedAddressOption === 'new') {
        const valid = await trigger(["addressTitle", "address", "city", "state", "zipcode", "country"]);
        if (valid) {
          const result = await Swal.fire({
            title: 'Save Address?',
            text: 'Do you want to save this address for future orders?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it',
            cancelButtonText: 'No, continue without saving'
          });
          if (result.isConfirmed) {
            const values = getValues();
            const addressPayload = {
              title: values.addressTitle,
              street: values.address,
              city: values.city,
              state: values.state,
              district: "",
              neighborhood: "",
              postalCode: values.zipcode,
              country: values.country,
            };
            try {
              await axios.post(`http://localhost:5000/api/address/${currentUser.uid.trim()}`, addressPayload);
            } catch(error) {
              console.error("Error saving address:", error);
              Swal.fire({
                title: 'Error',
                text: 'Failed to save address. Please try again.',
                icon: 'error',
              });
            }
          }
          setStep(3);
        } else {
          Swal.fire({
            title: 'Incomplete',
            text: 'Please fill in all required Address fields first.',
            icon: 'warning',
          });
        }
      } else {
        setStep(3);
      }
    } else if (targetStep === 4) {
      if (selectedPaymentOption === 'new') {
        const valid = await trigger(["cardNumber", "expiryDate", "cvv", "cardHolder"]);
        if (valid) {
          const result = await Swal.fire({
            title: 'Save Payment Method?',
            text: 'Do you want to save this payment method for future use?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it',
            cancelButtonText: 'No, continue without saving'
          });
          if (result.isConfirmed) {
            const values = getValues();
            const paymentPayload = {
              cardNumber: values.cardNumber,
              expiryDate: values.expiryDate,
              cvv: values.cvv,
              cardHolder: values.cardHolder,
            };
            try {
              await axios.post(`http://localhost:5000/api/payment-method/${currentUser.uid.trim()}`, paymentPayload);
            } catch (error) {
              console.error("Error saving payment method:", error);
              Swal.fire({
                title: 'Error',
                text: 'Failed to save payment method. Please try again.',
                icon: 'error',
              });
            }
          }
          setStep(4);
        } else {
          Swal.fire({
            title: 'Incomplete',
            text: 'Please fill in all required Payment fields first.',
            icon: 'warning',
          });
        }
      } else {
        setStep(4);
      }
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["name", "phone"]);
      if (valid) setStep(2);
      else
        Swal.fire({
          title: 'Incomplete',
          text: 'Fill in all required Personal Info fields.',
          icon: 'warning',
        });
    } else if (step === 2) {
      if (selectedAddressOption === 'new') {
        const valid = await trigger(["addressTitle", "address", "city", "state", "zipcode", "country"]);
        if (valid) {
          const result = await Swal.fire({
            title: 'Save Address?',
            text: 'Do you want to save this address for future orders?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it',
            cancelButtonText: 'No, continue without saving'
          });
          if (result.isConfirmed) {
            const values = getValues();
            const addressPayload = {
              title: values.addressTitle,
              street: values.address,
              city: values.city,
              state: values.state,
              district: "",
              neighborhood: "",
              postalCode: values.zipcode,
              country: values.country,
            };
            try {
              await axios.post(`http://localhost:5000/api/address/${currentUser.uid.trim()}`, addressPayload);
            } catch (error) {
              console.error("Error saving address:", error);
              Swal.fire({
                title: 'Error',
                text: 'Failed to save address. Please try again.',
                icon: 'error',
              });
            }
          }
          setStep(3);
        } else {
          Swal.fire({
            title: 'Incomplete',
            text: 'Fill in all required Address fields.',
            icon: 'warning',
          });
        }
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      if (selectedPaymentOption === 'new') {
        const valid = await trigger(["cardNumber", "expiryDate", "cvv", "cardHolder"]);
        if (valid) {
          const result = await Swal.fire({
            title: 'Save Payment Method?',
            text: 'Do you want to save this payment method for future use?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it',
            cancelButtonText: 'No, continue without saving'
          });
          if (result.isConfirmed) {
            const values = getValues();
            const paymentPayload = {
              cardNumber: values.cardNumber,
              expiryDate: values.expiryDate,
              cvv: values.cvv,
              cardHolder: values.cardHolder,
            };
            try {
              await axios.post(`http://localhost:5000/api/payment-method/${currentUser.uid.trim()}`, paymentPayload);
            } catch (error) {
              console.error("Error saving payment method:", error);
              Swal.fire({
                title: 'Error',
                text: 'Failed to save payment method. Please try again.',
                icon: 'error',
              });
            }
          }
          setStep(4);
        } else {
          Swal.fire({
            title: 'Incomplete',
            text: 'Fill in all required Payment fields.',
            icon: 'warning',
          });
        }
      } else {
        setStep(4);
      }
    }
  };

  const handleBackStep = () => setStep(step - 1);
  const getBookImage = (name) => getImgUrl(name);

  return (
    <section style={{ backgroundColor: 'rgb(250,248,230)' }} className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white shadow-md rounded-2xl p-4">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map(({ number, title }) => (
                <div
                  key={number}
                  className="flex-1 flex flex-col items-center cursor-pointer"
                  onClick={() => handleStepClick(number)}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                      step >= number ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {number}
                  </div>
                  <span className="mt-2 text-sm font-medium">{title}</span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-300 mt-4 relative">
              <div
                className="h-1 bg-blue-600 absolute top-0 left-0 transition-all duration-300"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium text-gray-700">Full Name</label>
                    <input
                      {...register("name", { required: "Full name is required" })}
                      type="text"
                      placeholder="John Doe"
                      defaultValue={currentUser?.displayName || ""}
                      className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Email Address</label>
                    <input
                      {...register("email", { required: "Email is required" })}
                      type="email"
                      defaultValue={currentUser?.email}
                      className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Phone Number</label>
                    <input
                      {...register("phone", { required: "Phone number is required" })}
                      type="text"
                      placeholder="+123 456 7890"
                      defaultValue={editablePhone || ""}
                      className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
                  Delivery Address
                </h2>
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="font-semibold mb-3">Select one of your saved addresses:</p>
                    {savedAddresses.map(address => (
                      <div key={address._id} 
                           onClick={() => {
                             setSelectedAddressOption('saved');
                             setSelectedSavedAddress(address);
                           }}
                           className={`flex items-center mb-4 p-4 border rounded-lg cursor-pointer transition duration-200 ${
                             selectedSavedAddress?._id === address._id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                           }`}
                      >
                        <input
                          type="radio"
                          name="addressOption"
                          value={address._id}
                          checked={selectedAddressOption === 'saved' && selectedSavedAddress?._id === address._id}
                          onChange={() => {
                            setSelectedAddressOption('saved');
                            setSelectedSavedAddress(address);
                          }}
                          className="mr-4"
                        />
                        <div>
                          <p className="font-bold text-gray-800">{address.title}</p>
                          <p className="text-gray-600 text-sm">{address.street}</p>
                          <p className="text-gray-600 text-sm">
                            {address.city}, {address.postalCode}, {address.country}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={() => setSelectedAddressOption('new')}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200"
                    >
                      <input
                        type="radio"
                        name="addressOption"
                        value="new"
                        checked={selectedAddressOption === 'new'}
                        onChange={() => setSelectedAddressOption('new')}
                        className="mr-4"
                      />
                      <span className="font-bold text-gray-800">Enter a new address</span>
                    </div>
                  </div>
                )}

                {(savedAddresses.length === 0 || selectedAddressOption === 'new') && (
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="block font-medium text-gray-700">Address Title</label>
                      <input
                        {...register("addressTitle", { required: "Address title is required" })}
                        type="text"
                        placeholder="e.g., Home, Office"
                        className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                      />
                      {errors.addressTitle && <p className="text-red-500 text-sm mt-1">{errors.addressTitle.message}</p>}
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Street Address</label>
                      <input
                        {...register("address", { required: "Address is required" })}
                        type="text"
                        placeholder="1234 Main St"
                        className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-700">City</label>
                        <input
                          {...register("city", { required: "City is required" })}
                          type="text"
                          placeholder="City"
                          className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700">State</label>
                        <input
                          {...register("state", { required: "State is required" })}
                          type="text"
                          placeholder="State"
                          className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Zipcode</label>
                      <input
                        {...register("zipcode", { required: "Zipcode is required" })}
                        type="text"
                        placeholder="Zipcode"
                        className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                      />
                      {errors.zipcode && <p className="text-red-500 text-sm mt-1">{errors.zipcode.message}</p>}
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Country</label>
                      <input
                        {...register("country", { required: "Country is required" })}
                        type="text"
                        placeholder="Country"
                        className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                      />
                      {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
                  Payment Information
                </h2>
                {savedPayments.length > 0 && (
                  <div className="mb-6">
                    <p className="font-semibold mb-3">Select one of your saved payment methods:</p>
                    {savedPayments.map(payment => (
                      <div
                        key={payment._id}
                        onClick={() => {
                          setSelectedPaymentOption('saved');
                          setSelectedSavedPayment(payment);
                        }}
                        className={`flex items-center mb-4 p-4 border rounded-lg cursor-pointer transition duration-200 ${
                          selectedSavedPayment?._id === payment._id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          value={payment._id}
                          checked={selectedPaymentOption === 'saved' && selectedSavedPayment?._id === payment._id}
                          onChange={() => {
                            setSelectedPaymentOption('saved');
                            setSelectedSavedPayment(payment);
                          }}
                          className="mr-4"
                        />
                        <div>
                          <div className="flex items-center mb-1">
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
                              <span className="mr-2" style={{ fontSize: "46px", fontWeight: "bold", color: "#0085C7" }}>
                                Troy
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-gray-800">{payment.cardHolder}</p>
                          <p className="text-gray-600 text-sm">**** **** **** {payment.cardNumber.slice(-4)}</p>
                          <p className="text-gray-600 text-sm">Exp: {payment.expiryDate}</p>
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={() => setSelectedPaymentOption('new')}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200"
                    >
                      <input
                        type="radio"
                        name="paymentOption"
                        value="new"
                        checked={selectedPaymentOption === 'new'}
                        onChange={() => setSelectedPaymentOption('new')}
                        className="mr-4"
                      />
                      <span className="font-bold text-gray-800">Enter a new payment method</span>
                    </div>
                  </div>
                )}
                {selectedPaymentOption === 'new' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-700">Card Number</label>
                      <div className="mt-2 flex items-center">
                        <input
                          {...register("cardNumber", { required: "Card number is required" })}
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                        />
                        {detectCardBrand(watchedPayment[0] || "") === "visa" && (
                          <SiVisa size={46} style={{ color: "#1A1F71" }} className="ml-2" />
                        )}
                        {detectCardBrand(watchedPayment[0] || "") === "mastercard" && (
                          <SiMastercard size={46} style={{ color: "#EB001B" }} className="ml-2" />
                        )}
                        {detectCardBrand(watchedPayment[0] || "") === "amex" && (
                          <SiAmericanexpress size={46} style={{ color: "#2E77BC" }} className="ml-2" />
                        )}
                        {detectCardBrand(watchedPayment[0] || "") === "discover" && (
                          <SiDiscover size={46} style={{ color: "#FF6000" }} className="ml-2" />
                        )}
                        {detectCardBrand(watchedPayment[0] || "") === "troy" && (
                          <span className="ml-2" style={{ fontSize: "32px", fontWeight: "bold", color: "#0085C7" }}>
                            Troy
                          </span>
                        )}
                      </div>
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>}
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Expiry Date</label>
                      <input
                        {...register("expiryDate", { required: "Expiry date is required" })}
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        onChange={(e) => {
                          let input = e.target.value.replace(/\D/g, "");
                          if (input.length > 4) input = input.slice(0, 4);
                          if (input.length > 2) input = input.slice(0, 2) + "/" + input.slice(2);
                          setValue("expiryDate", input);
                        }}
                        className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                      />
                      {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>}
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">CVV</label>
                      <input
                        {...register("cvv", { 
                          required: "CVV is required", 
                          pattern: { value: /^\d{3}$/, message: "CVV must be 3 digits" } 
                        })}
                        type="text"
                        placeholder="123"
                        maxLength={3}
                        inputMode="numeric"
                        className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                      />
                      {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>}
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Cardholder Name</label>
                      <input
                        {...register("cardHolder", { required: "Cardholder name is required" })}
                        type="text"
                        placeholder="John Doe"
                        className="mt-2 w-full border rounded-md p-3 focus:ring-blue-600 focus:border-blue-600"
                      />
                      {errors.cardHolder && <p className="text-red-500 text-sm mt-1">{errors.cardHolder.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Lobster, cursive' }}>
                  Review & Confirm
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg">Order Summary</h3>
                    <div className="mt-4 space-y-2">
                      {cartItems.map(item => (
                        <div key={item._id} className="flex justify-between items-center border-b pb-2">
                          <div className="flex items-center space-x-4">
                            <img src={getImgUrl(item.coverImage)} alt={item.title} className="w-16 h-20 object-cover rounded" />
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-semibold">${(item.newPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">Delivery Address</h3>
                    <div className="border p-4 rounded-md mt-2">
                      {selectedAddressOption === 'saved' && selectedSavedAddress ? (
                        <p className="text-gray-700">
                          <span className="font-bold">{selectedSavedAddress.title}</span> - {selectedSavedAddress.street}, {selectedSavedAddress.city}
                          {selectedSavedAddress.state ? `, ${selectedSavedAddress.state}` : ''}, {selectedSavedAddress.postalCode}, {selectedSavedAddress.country}
                        </p>
                      ) : (
                        <p className="text-gray-700">
                          {watchedAddress[1] || 'Address'}, {watchedAddress[2] || 'City'}, {watchedAddress[3] || 'State'}, {watchedAddress[4] || 'Zipcode'}, {watchedAddress[5] || 'Country'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">Payment Method</h3>
                    <div className="border p-4 rounded-md mt-2 flex items-center">
                      {selectedPaymentOption === 'saved' && selectedSavedPayment ? (
                        <>
                          {detectCardBrand(selectedSavedPayment.cardNumber) === "visa" && (
                            <SiVisa size={46} style={{ color: "#1A1F71" }} className="mr-2" />
                          )}
                          {detectCardBrand(selectedSavedPayment.cardNumber) === "mastercard" && (
                            <SiMastercard size={46} style={{ color: "#EB001B" }} className="mr-2" />
                          )}
                          {detectCardBrand(selectedSavedPayment.cardNumber) === "amex" && (
                            <SiAmericanexpress size={46} style={{ color: "#2E77BC" }} className="mr-2" />
                          )}
                          {detectCardBrand(selectedSavedPayment.cardNumber) === "discover" && (
                            <SiDiscover size={46} style={{ color: "#FF6000" }} className="mr-2" />
                          )}
                          {detectCardBrand(selectedSavedPayment.cardNumber) === "troy" && (
                            <span className="mr-2" style={{ fontSize: "32px", fontWeight: "bold", color: "#0085C7" }}>
                              Troy
                            </span>
                          )}
                          <p className="text-gray-700">
                            {selectedSavedPayment.cardHolder} — **** **** **** {selectedSavedPayment.cardNumber.slice(-4)} (Exp: {selectedSavedPayment.expiryDate})
                          </p>
                        </>
                      ) : (
                        <>
                          {detectCardBrand(watchedPayment[0] || "") === "visa" && (
                            <SiVisa size={32} style={{ color: "#1A1F71" }} className="mr-2" />
                          )}
                          {detectCardBrand(watchedPayment[0] || "") === "mastercard" && (
                            <SiMastercard size={32} style={{ color: "#EB001B" }} className="mr-2" />
                          )}
                          {detectCardBrand(watchedPayment[0] || "") === "amex" && (
                            <SiAmericanexpress size={32} style={{ color: "#2E77BC" }} className="mr-2" />
                          )}
                          {detectCardBrand(watchedPayment[0] || "") === "discover" && (
                            <SiDiscover size={32} style={{ color: "#FF6000" }} className="mr-2" />
                          )}
                          {detectCardBrand(watchedPayment[0] || "") === "troy" && (
                            <span className="mr-2" style={{ fontSize: "32px", fontWeight: "bold", color: "#0085C7" }}>
                              Troy
                            </span>
                          )}
                          <p className="text-gray-700">
                            Cardholder: {watchedPayment[3] || 'N/A'}, Card: {watchedPayment[0] ? '**** **** **** ' + watchedPayment[0].slice(-4) : 'N/A'}, Exp: {watchedPayment[1] || 'N/A'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="border-t pt-3 mt-6 flex justify-end">
                    <span className="font-semibold text-lg mr-2">Total:</span>
                    <span className="text-lg font-bold">${totalPrice}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
                >
                  Back
                </button>
              )}
              {step < 4 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}
              {step === 4 && (
                <button
                  type="submit"
                  className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
                >
                  Confirm Order
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
