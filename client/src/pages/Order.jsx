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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Place Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Professional laundry service at your doorstep
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="user"
                      checked={orderType === "user"}
                      onChange={(e) => setOrderType(e.target.value)}
                      disabled={!isAuthenticated}
                      className="form-radio text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      User Account {!isAuthenticated && "(Login required)"}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="guest"
                      checked={orderType === "guest"}
                      onChange={(e) => setOrderType(e.target.value)}
                      className="form-radio text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Guest Order
                    </span>
                  </label>
                </div>
              </div>

              {/* User Information Display */}
              {orderType === "user" && isAuthenticated && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Order Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 <strong>Pickup Address:</strong> We'll use the address
                    from your profile
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    📞 <strong>Contact:</strong> We'll use the phone number from
                    your profile
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    🏠 <strong>PG/Hostel Name:</strong> Required in your profile
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    You can update your address, phone number, and PG details in
                    your profile settings
                  </p>
                </div>
              )}

              {/* Guest Information */}
              {orderType === "guest" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Contact Information
                  </h3>
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={guestInfo.name}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, name: e.target.value })
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={guestInfo.phone}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, phone: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Pickup Address"
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={guestInfo.address}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, address: e.target.value })
                    }
                  />

                  {/* PG Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="PG/Hostel Name *"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={guestInfo.pgName}
                      onChange={(e) =>
                        setGuestInfo({ ...guestInfo, pgName: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Room Number (Optional)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              )}

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Laundry Items
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-3">
                    <select
                      value={item.type}
                      onChange={(e) =>
                        updateItem(index, "type", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="wash">Washing</option>
                      <option value="dry-clean">Dry Cleaning</option>
                      <option value="iron">Iron Only</option>
                    </select>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={item.weight}
                      onChange={(e) =>
                        updateItem(index, "weight", e.target.value)
                      }
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="KG"
                    />
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      KG
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Iron Service */}
              <div>
                <label className="flex items-center">
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
                    className="form-checkbox text-indigo-600"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    Add Iron Service (+₹5 per kg)
                  </span>
                </label>

                {ironService.required && (
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
                    className="mt-2 w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Weight (KG)"
                  />
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={pickupDate || new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio text-indigo-600"
                    />
                    <Banknote className="ml-2 mr-2 w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Cash on Delivery
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="qr"
                      checked={paymentMethod === "qr"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio text-indigo-600"
                    />
                    <CreditCard className="ml-2 mr-2 w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      QR Code Payment
                    </span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Any special care instructions..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !pricing}
                  className="w-full bg-gradient-indigo-emerald text-white py-3 px-4 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Order via WhatsApp
                </button>
              </div>
            </form>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-fit">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Pricing Summary
            </h3>

            {pricing ? (
              <div className="space-y-3">
                {pricing.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.weight}kg {item.type} @ ₹{item.pricePerKg}/kg
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ₹{item.totalPrice}
                    </span>
                  </div>
                ))}

                {pricing.ironService.required && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Iron Service ({pricing.ironService.weight}kg @ ₹5/kg)
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ₹{pricing.ironCost}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Subtotal
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ₹{pricing.subtotal}
                    </span>
                  </div>

                  {pricing.discount.percentage > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount ({pricing.discount.percentage}%)</span>
                      <span>-₹{pricing.discount.amount}</span>
                    </div>
                  )}

                  {pricing.ironCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Iron Service
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        ₹{pricing.ironCost}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      ₹{pricing.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Add items to see pricing</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                Pricing Info
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• 3+ KG orders get 5% discount</li>
                <li>• Iron service: ₹5 per kg</li>
                <li>• Free pickup & delivery</li>
                <li>• Same-day service available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
