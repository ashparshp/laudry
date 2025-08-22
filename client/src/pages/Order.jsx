import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  MessageCircle,
  Calculator,
  Plus,
  Minus,
  Calendar,
  CreditCard,
  Banknote,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8088";

const Order = () => {
  const { isAuthenticated, user } = useAuth();
  const [orderType, setOrderType] = useState("guest");
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    phone: "",
    address: "",
    pgName: "",
    roomNumber: "",
  });

  const [items, setItems] = useState([{ type: "wash", weight: 5 }]);

  const [ironService, setIronService] = useState({
    required: true,
    weight: 5,
  });

  const [pricing, setPricing] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [pickupDate, setPickupDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setOrderType("user");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (items.length > 0) {
      calculatePricing();
    }
  }, [items, ironService]);

  const calculatePricing = () => {
    try {
      // Define pricing rates
      const priceRates = {
        wash: 20, // ₹20 per kg for washing
        "dry-clean": 50, // ₹50 per kg for dry cleaning
        iron: 15, // ₹15 per kg for iron only
      };

      const ironServiceRate = 5; // ₹5 per kg for iron service

      // Calculate item costs
      const processedItems = items.map((item) => {
        const pricePerKg = priceRates[item.type] || 20;
        const totalPrice = item.weight * pricePerKg;
        return {
          ...item,
          pricePerKg,
          totalPrice,
        };
      });

      // Calculate subtotal
      const subtotal = processedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      // Calculate iron service cost
      const ironCost = ironService.required
        ? ironService.weight * ironServiceRate
        : 0;

      // Calculate discount (5% for orders 3kg and above)
      const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
      const discountPercentage = totalWeight >= 3 ? 5 : 0;
      const discountAmount = (subtotal * discountPercentage) / 100;

      // Calculate final total
      const totalPrice = subtotal - discountAmount + ironCost;

      const pricingData = {
        items: processedItems,
        ironService: {
          required: ironService.required,
          weight: ironService.weight,
        },
        subtotal,
        discount: {
          percentage: discountPercentage,
          amount: discountAmount,
        },
        ironCost,
        totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      };

      setPricing(pricingData);
    } catch (error) {
      console.error("Error calculating pricing:", error);
    }
  };

  const addItem = () => {
    setItems([...items, { type: "wash", weight: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] =
      field === "weight" ? parseFloat(value) || 0 : value;
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items,
        ironService,
        paymentMethod,
        pickupDate,
        deliveryDate,
        notes,
        orderType,
      };

      if (orderType === "guest") {
        orderData.guestInfo = guestInfo;
      }

      const response = await axios.post(
        "http://localhost:8088/api/orders",
        orderData
      );
      setSuccess(true);

      // Reset form
      setItems([{ type: "wash", weight: 5 }]);
      setIronService({ required: true, weight: 5 });
      setGuestInfo({
        name: "",
        phone: "",
        address: "",
        pgName: "",
        roomNumber: "",
      });
      setPickupDate("");
      setDeliveryDate("");
      setNotes("");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = "+919122763604";

    // Debug: Log user object to see what's available
    console.log("User object:", user);
    console.log("User address:", user?.address);

    // Prepare customer info
    let customerDetails = "";
    if (orderType === "guest") {
      customerDetails = `Customer: ${guestInfo.name}\nPhone: ${
        guestInfo.phone
      }\nAddress: ${guestInfo.address}\nPG/Hostel: ${guestInfo.pgName}${
        guestInfo.roomNumber ? `\nRoom: ${guestInfo.roomNumber}` : ""
      }\n\n`;
    } else if (isAuthenticated && user) {
      // For logged-in users, provide better information
      const userPhone = user.phone || "Not provided";
      const userAddress = user.address
        ? `${user.address.street || ""}, ${user.address.city || ""}, ${
            user.address.state || ""
          }`.replace(/^,\s*|,\s*$/g, "")
        : "Not provided";
      const pgInfo = user.address?.pgName
        ? `\nPG/Hostel: ${user.address.pgName}${
            user.address.roomNumber ? `\nRoom: ${user.address.roomNumber}` : ""
          }`
        : "\nPG/Hostel: Not provided";

      customerDetails = `Customer: ${user.name}\nPhone: ${userPhone}\nAddress: ${userAddress}${pgInfo}\n\n`;
    }

    const message = `Hi, I'd like to place a laundry order:\n\n${customerDetails}Items: ${items
      .map((item) => `${item.weight}kg ${item.type}`)
      .join(", ")}\n${
      ironService.required ? `Iron service: ${ironService.weight}kg\n` : ""
    }${pickupDate ? `Pickup Date: ${pickupDate}\n` : ""}${
      deliveryDate ? `Delivery Date: ${deliveryDate}\n` : ""
    }Total: ₹${pricing?.totalPrice || 0}\n\nPlease confirm availability.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your laundry order has been received. We'll contact you soon to
              confirm the pickup time.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-gradient-indigo-emerald text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-indigo-emerald rounded-full mb-3">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Place Your Order
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional laundry service at your doorstep with quick pickup and
            delivery
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Free Pickup & Delivery
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Same Day Service
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Quality Guaranteed
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          {/* Order Form */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Type */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Choose Order Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-600/30">
                    <input
                      type="radio"
                      value="user"
                      checked={orderType === "user"}
                      onChange={(e) => setOrderType(e.target.value)}
                      disabled={!isAuthenticated}
                      className="form-radio text-indigo-600"
                    />
                    <div className="ml-3">
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                        User Account
                      </span>
                      {!isAuthenticated && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Login required for this option
                        </p>
                      )}
                    </div>
                  </label>
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-600/30">
                    <input
                      type="radio"
                      value="guest"
                      checked={orderType === "guest"}
                      onChange={(e) => setOrderType(e.target.value)}
                      className="form-radio text-indigo-600"
                    />
                    <div className="ml-3">
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Guest Order
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Quick order without account
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* User Information Display */}
              {orderType === "user" && isAuthenticated && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600 dark:text-blue-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Account Order Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Pickup address from profile
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Contact from profile
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          PG/Hostel details required
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Information */}
              {orderType === "guest" && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        value={guestInfo.name}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        value={guestInfo.phone}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        PG/Hostel Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter PG/Hostel name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        value={guestInfo.pgName}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, pgName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Room Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter room number"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        value={guestInfo.roomNumber}
                        onChange={(e) =>
                          setGuestInfo({
                            ...guestInfo,
                            roomNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pickup Address *
                    </label>
                    <textarea
                      placeholder="Enter your complete pickup address"
                      required
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      value={guestInfo.address}
                      onChange={(e) =>
                        setGuestInfo({ ...guestInfo, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Laundry Items
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Service Type
                          </label>
                          <select
                            value={item.type}
                            onChange={(e) =>
                              updateItem(index, "type", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                          >
                            <option value="wash">Washing Service</option>
                            <option value="dry-clean">Dry Cleaning</option>
                            <option value="iron">Iron Only</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Weight (KG)
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.weight}
                            onChange={(e) =>
                              updateItem(index, "weight", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="0.0"
                          />
                        </div>
                        {items.length > 1 && (
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            >
                              <Minus size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Iron Service */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Additional Services
                </h3>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={ironService.required}
                      onChange={(e) =>
                        setIronService({
                          ...ironService,
                          required: e.target.checked,
                          weight: e.target.checked ? ironService.weight : 0,
                        })
                      }
                      className="form-checkbox text-indigo-600 mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Add Professional Iron Service
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ₹5 per kg - Professional ironing with crisp finish
                      </p>
                    </div>
                  </label>

                  {ironService.required && (
                    <div className="mt-4 ml-7">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Weight for Iron Service (KG)
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={ironService.weight}
                        onChange={(e) =>
                          setIronService({
                            ...ironService,
                            weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        placeholder="0.0"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Schedule Your Service
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={pickupDate || new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                  Payment Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-600/30">
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio text-indigo-600"
                    />
                    <Banknote className="ml-2 mr-2 w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                        Cash on Delivery
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-600/30">
                    <input
                      type="radio"
                      value="qr"
                      checked={paymentMethod === "qr"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio text-indigo-600"
                    />
                    <CreditCard className="ml-2 mr-2 w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                        QR Code Payment
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  placeholder="Any special care instructions, fabric details, or delivery preferences..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || !pricing}
                    className="w-full bg-gradient-indigo-emerald text-white py-3 px-4 rounded-lg text-base font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Placing Order...
                      </div>
                    ) : (
                      "Place Order"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-base font-semibold transition-all flex items-center justify-center shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Order via WhatsApp
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Pricing Summary */}
          <div className="xl:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-fit sticky top-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-indigo-600" />
              Pricing Summary
            </h3>

            {pricing ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {pricing.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"
                    >
                      <div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {item.weight}kg{" "}
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1).replace("-", " ")}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @ ₹{item.pricePerKg}/kg
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ₹{item.totalPrice}
                      </span>
                    </div>
                  ))}
                </div>

                {pricing.ironService.required && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Iron Service ({pricing.ironService.weight}kg)
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @ ₹5/kg
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₹{pricing.ironCost}
                    </span>
                  </div>
                )}

                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600 dark:text-gray-300">
                      Subtotal
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{pricing.subtotal}
                    </span>
                  </div>

                  {pricing.discount.percentage > 0 && (
                    <div className="flex justify-between text-lg text-green-600 dark:text-green-400 mt-2">
                      <span>Discount ({pricing.discount.percentage}%)</span>
                      <span className="font-semibold">
                        -₹{pricing.discount.amount}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-2 border-indigo-200 dark:border-indigo-700">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{pricing.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Add items to see pricing</p>
                <p className="text-sm mt-2">
                  Start by selecting your laundry items
                </p>
              </div>
            )}

            {/* Pricing Info Card */}
            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pricing Information
              </h4>
              <ul className="space-y-3 text-sm text-blue-800 dark:text-blue-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  3+ KG orders get 5% discount
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Iron service: ₹5 per kg
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Free pickup & delivery
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Same-day service available
                </li>
              </ul>
            </div>

            {/* Service Guarantee */}
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center mb-2">
                <svg
                  className="w-5 h-5 text-emerald-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Quality Guaranteed
                </span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                100% satisfaction or we'll rewash your items for free
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
