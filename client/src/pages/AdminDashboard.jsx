import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Navigate } from "react-router-dom";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle.jsx";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8088";

const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    processingOrders: 0,
  });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchOrders();
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:8088/api/orders");
      setOrders(response.data);

      // Calculate stats
      const totalRevenue = response.data
        .filter((order) => order.status === "delivered")
        .reduce((sum, order) => sum + order.totalAmount, 0);
      const pendingOrders = response.data.filter(
        (order) => order.status === "pending"
      ).length;
      const deliveredOrders = response.data.filter(
        (order) => order.status === "delivered"
      ).length;
      const processingOrders = response.data.filter(
        (order) => order.status === "processing"
      ).length;

      setStats((prev) => ({
        ...prev,
        totalOrders: response.data.length,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        processingOrders,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8088/api/users");
      setUsers(response.data);
      setStats((prev) => ({
        ...prev,
        totalUsers: response.data.length,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8088/api/orders/${orderId}/status`, {
        status: newStatus,
      });

      fetchOrders(); // Refresh orders and stats
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-300",
      processing:
        "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 dark:from-indigo-900 dark:to-indigo-800 dark:text-indigo-300",
      ready:
        "bg-gradient-to-r from-caribbean-100 to-caribbean-200 text-caribbean-800 dark:from-caribbean-900 dark:to-caribbean-800 dark:text-caribbean-300",
      delivered:
        "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 dark:from-emerald-900 dark:to-emerald-800 dark:text-emerald-300",
      cancelled:
        "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-300",
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-caribbean-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent bg-gradient-indigo-caribbean opacity-20 mx-auto mb-4"></div>
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-indigo-600 dark:border-caribbean-400 -mt-32"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-caribbean-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-caribbean-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your laundry service business
            </p>
          </div>
          <ThemeToggle size={24} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-indigo-100 dark:border-gray-600">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-indigo-caribbean shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Orders
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-caribbean-600 bg-clip-text text-transparent">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-caribbean-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-caribbean-100 dark:border-gray-600">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-caribbean-indigo shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Users
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-caribbean-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-emerald-100 dark:border-gray-600">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-caribbean-500 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Revenue (Delivered)
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-caribbean-600 bg-clip-text text-transparent">
                  ₹{stats.totalRevenue}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  From {stats.deliveredOrders} delivered orders
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-yellow-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-yellow-100 dark:border-gray-600">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.pendingOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-blue-100 dark:border-gray-600">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Processing Orders
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.processingOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeTab === "overview"
                  ? "bg-gradient-indigo-caribbean text-white shadow-lg scale-105"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeTab === "orders"
                  ? "bg-gradient-indigo-caribbean text-white shadow-lg scale-105"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-3 px-6 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeTab === "users"
                  ? "bg-gradient-indigo-caribbean text-white shadow-lg scale-105"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Users
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-indigo-100 dark:border-gray-600">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-caribbean-500 rounded-t-xl">
                <h2 className="text-lg font-semibold text-white">
                  Recent Orders
                </h2>
              </div>
              <div className="p-6">
                {ordersLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-transparent bg-gradient-indigo-caribbean opacity-20 mx-auto"></div>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-indigo-600 dark:border-caribbean-400 -mt-8"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-600"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.user?.name ||
                              order.guestInfo?.name ||
                              "Guest Order"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            ₹{order.totalAmount} •{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )} shadow-sm`}
                        >
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="bg-gradient-to-br from-white to-caribbean-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-caribbean-100 dark:border-gray-600">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-caribbean-500 to-emerald-500 rounded-t-xl">
                <h2 className="text-lg font-semibold text-white">
                  Revenue Overview
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-caribbean-indigo rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Revenue chart will be implemented here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Coming soon with advanced analytics
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-caribbean-500 rounded-t-xl">
              <h2 className="text-lg font-semibold text-white">All Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ordersLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-transparent bg-gradient-indigo-caribbean opacity-20"></div>
                          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-indigo-600 dark:border-caribbean-400 -ml-8"></div>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.user?.name ||
                                order.guestInfo?.name ||
                                "Guest"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.user?.email ||
                                order.guestInfo?.phone ||
                                "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {order.items.length} item(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className="bg-gradient-to-r from-emerald-600 to-caribbean-600 bg-clip-text text-transparent font-bold">
                            ₹{order.totalAmount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              order.status
                            )} shadow-sm`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order._id, e.target.value)
                              }
                              className="text-xs border-2 border-indigo-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-caribbean-500 to-emerald-500 rounded-t-xl">
              <h2 className="text-lg font-semibold text-white">All Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {usersLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-transparent bg-gradient-indigo-caribbean opacity-20"></div>
                          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-indigo-600 dark:border-caribbean-400 -ml-8"></div>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                              user.role === "admin"
                                ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900 dark:to-purple-800 dark:text-purple-300"
                                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                              user.isActive
                                ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 dark:from-emerald-900 dark:to-emerald-800 dark:text-emerald-300"
                                : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-300"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
