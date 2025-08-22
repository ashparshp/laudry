import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import { Package, Clock, Star, User, MapPin, Phone } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:8088";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8088/api/orders/my-orders"
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      processing:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      ready:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      delivered:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "ready":
        return <Star className="w-4 h-4" />;
      case "delivered":
        return <Star className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your laundry orders and account settings
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-indigo-emerald rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Phone className="w-5 h-5 mr-3" />
                  <span>{user?.phone}</span>
                </div>

                {user?.address && (
                  <div className="flex items-start text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 mr-3 mt-0.5" />
                    <div>
                      <p>{user.address.street}</p>
                      <p>
                        {user.address.city}, {user.address.state}{" "}
                        {user.address.zipCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {orders.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Total Orders
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {
                        orders.filter((order) => order.status === "delivered")
                          .length
                      }
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Orders
                </h2>
              </div>

              <div className="p-6">
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Loading orders...
                    </p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      You haven't placed any laundry orders yet.
                    </p>
                    <a
                      href="/order"
                      className="bg-gradient-indigo-emerald text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
                    >
                      Place Your First Order
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">
                                {order.status}
                              </span>
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              ₹{order.totalAmount}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Items
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              {order.items.map((item, index) => (
                                <li key={index}>
                                  {item.weight}kg {item.type} - ₹
                                  {item.totalPrice}
                                </li>
                              ))}
                              {order.ironService?.required && (
                                <li>
                                  Iron service ({order.ironService.weight}kg) -
                                  ₹{order.ironService.totalPrice}
                                </li>
                              )}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Schedule
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              <p>
                                <span className="font-medium">Pickup:</span>{" "}
                                {new Date(
                                  order.pickupDate
                                ).toLocaleDateString()}
                              </p>
                              <p>
                                <span className="font-medium">Delivery:</span>{" "}
                                {new Date(
                                  order.deliveryDate
                                ).toLocaleDateString()}
                              </p>
                              <p>
                                <span className="font-medium">Payment:</span>{" "}
                                <span className="capitalize">
                                  {order.paymentMethod}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              Special Instructions
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {order.notes}
                            </p>
                          </div>
                        )}

                        {order.discount?.percentage > 0 && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {order.discount.percentage}% Discount Applied -
                              Saved ₹{order.discount.amount}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
