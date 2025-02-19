import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';
import { Link } from 'react-router-dom';

// Importing necessary actions
import { clearCart, removeFromCart, increaseQuantity, decreaseQuantity } from '../../redux/features/cart/cartSlice';

// Importing the utility function for image URLs
import { getImgUrl } from '../../utils/getImgUrl';

const CheckoutPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.newPrice * item.quantity, 0).toFixed(2); // Adjust totalPrice calculation to account for quantity
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, trigger, watch } = useForm();
    const [step, setStep] = useState(1);

    const [createOrder, { isLoading }] = useCreateOrderMutation();

    const onSubmit = async (data) => {
        const newOrder = {
            name: data.name,
            email: data.email, // Send the edited email
            address: {
                street: data.address,
                city: data.city,
                state: data.state,
                zipcode: data.zipcode,
                country: data.country,
            },
            phone: data.phone,
            productIds: cartItems.map(item => item?._id),
            totalPrice,
        };

        try {
            await createOrder(newOrder).unwrap();
            Swal.fire({
                title: 'Confirmed Order',
                text: 'Your order has been placed successfully!',
                icon: 'success',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#aaa',
                confirmButtonText: 'Go to Orders',
                cancelButtonText: 'Return to Homepage'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/orders');
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = 'http://localhost:5173';  // Redirect to homepage
                }
            });
        } catch (error) {
            console.error('Error placing order', error);
            Swal.fire({
                title: 'Order Failed',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Okay',
            });
        }
    };

    if (isLoading) return <div>Processing...</div>;

    const handleNextStep = async () => {
        if (step === 1) {
            const isValid = await trigger(["name", "phone"]);
            if (isValid) {
                setStep(2);
            } else {
                Swal.fire({
                    title: 'Missing Information',
                    text: 'Please fill out all required fields before proceeding.',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                });
            }
        } else if (step === 2) {
            const isValid = await trigger(["address", "city", "state", "zipcode", "country"]);
            if (isValid) {
                setStep(3);
            } else {
                Swal.fire({
                    title: 'Missing Information',
                    text: 'Please fill out all required address fields before proceeding.',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                });
            }
        }
    };

    // Function to get the correct image for each book
    const getBookImage = (name) => {
        return getImgUrl(name);  // This dynamically gets the image URL based on the name of the book
    };

    // Watch for changes in the form fields to determine if they are valid
    const isPersonalInfoValid = !errors.name && !errors.phone;
    const isAddressValid = !errors.address && !errors.city && !errors.state && !errors.zipcode && !errors.country;

    const handleBackStep = () => {
        setStep(step - 1);
    };

    return (
        <section className="bg-[rgba(240,240,240,0.1)] min-h-screen p-6">
            <div className="container max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-xl">
                    <div className="flex justify-between mb-8">
                        <div
                            className={`flex items-center ${step === 1 ? 'font-semibold text-blue-600' : ''}`}
                            onClick={() => setStep(1)}
                        >
                            <span className={`text-xl cursor-pointer ${isPersonalInfoValid || step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>1. Personal Info</span>
                        </div>
                        <div
                            className={`flex items-center ${step === 2 ? 'font-semibold text-blue-600' : ''}`}
                            onClick={() => (isPersonalInfoValid && step !== 1) && setStep(2)}
                        >
                            <span className={`text-xl cursor-pointer ${isPersonalInfoValid || step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>2. Address</span>
                        </div>
                        <div
                            className={`flex items-center ${step === 3 ? 'font-semibold text-blue-600' : ''}`}
                            onClick={() => (isAddressValid && step !== 2) && setStep(3)}
                        >
                            <span className={`text-xl cursor-pointer ${isAddressValid || step === 3 ? 'text-blue-600' : 'text-gray-400'}`}>3. Review</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {step === 1 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700">Full Name</label>
                                        <input
                                            {...register("name", { required: "Full name is required" })}
                                            className="w-full border rounded-md p-3 mt-2"
                                            type="text"
                                            placeholder="John Doe"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">Email Address</label>
                                        <input
                                            {...register("email", { required: "Email is required" })}
                                            className="w-full border rounded-md p-3 mt-2"
                                            defaultValue={currentUser?.email}  // Allow the user to edit the email
                                        />
                                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">Phone Number</label>
                                        <input
                                            {...register("phone", { required: "Phone number is required" })}
                                            className="w-full border rounded-md p-3 mt-2"
                                            type="text"
                                            placeholder="+123 456 7890"
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700">Street Address</label>
                                        <input
                                            {...register("address", { required: "Address is required" })}
                                            className="w-full border rounded-md p-3 mt-2"
                                            type="text"
                                            placeholder="1234 Main St"
                                        />
                                        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700">City</label>
                                            <input
                                                {...register("city", { required: "City is required" })}
                                                className="w-full border rounded-md p-3 mt-2"
                                                type="text"
                                                placeholder="City"
                                            />
                                            {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-gray-700">State</label>
                                            <input
                                                {...register("state", { required: "State is required" })}
                                                className="w-full border rounded-md p-3 mt-2"
                                                type="text"
                                                placeholder="State"
                                            />
                                            {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">Zipcode</label>
                                        <input
                                            {...register("zipcode", { required: "Zipcode is required" })}
                                            className="w-full border rounded-md p-3 mt-2"
                                            type="text"
                                            placeholder="Zipcode"
                                        />
                                        {errors.zipcode && <p className="text-red-500 text-sm">{errors.zipcode.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700">Country</label>
                                        <input
                                            {...register("country", { required: "Country is required" })}
                                            className="w-full border rounded-md p-3 mt-2"
                                            type="text"
                                            placeholder="Country"
                                        />
                                        {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>
                                <div>
                                    <h3 className="font-semibold text-lg">Order Summary</h3>
                                    <div className="mt-4 space-y-2">
                                        {cartItems.map((item, index) => (
                                            <div key={item._id} className="flex justify-between items-center">
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={getBookImage(item.coverImage)}
                                                        alt={item.title}
                                                        className="w-16 h-20 object-cover"
                                                    />
                                                    <span>{item.title}</span>
                                                    <span className="text-gray-600">x{item.quantity}</span>
                                                </div>
                                                <span>${(item.newPrice * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <span className="font-semibold text-lg">Total:</span>
                                        <span className="text-lg">${totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            {step > 1 && (
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                                    onClick={handleBackStep}
                                >
                                    Back
                                </button>
                            )}
                            {step === 1 && (
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 ml-auto"
                                    onClick={handleNextStep}
                                >
                                    Next
                                </button>
                            )}
                            {step !== 1 && (
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900"
                                    onClick={step === 3 ? handleSubmit(onSubmit) : handleNextStep}
                                >
                                    {step === 3 ? 'Confirm Order' : 'Next'}
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
