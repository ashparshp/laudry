import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Droplets,
  Clock,
  Shield,
  Star,
  MessageCircle,
  Calculator,
} from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "Premium Cleaning",
      description:
        "Professional washing and dry cleaning services with eco-friendly detergents",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Quick Service",
      description: "Same-day pickup and delivery service available",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Safe",
      description: "Your clothes are handled with utmost care and security",
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "Transparent Pricing",
      description:
        "Clear pricing structure with automatic discounts for bulk orders",
    },
  ];

  const pricing = [
    { weight: "1 KG", wash: "₹30", dryClean: "₹50", iron: "₹15" },
    { weight: "2 KG", wash: "₹29/kg", dryClean: "₹48/kg", iron: "₹14/kg" },
    {
      weight: "3+ KG",
      wash: "₹28/kg",
      dryClean: "₹45/kg",
      iron: "₹13/kg",
      discount: "5% Discount",
    },
  ];

  const handleWhatsApp = () => {
    const phoneNumber = "+919876543210"; // Replace with actual WhatsApp number
    const message =
      "Hi, I would like to know more about your laundry services.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-indigo-emerald py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Premium Laundry Services
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Professional washing, dry cleaning, and ironing services at your
              doorstep. Quality care for your clothes with transparent pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/order"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Order Now
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={handleWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Us
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide the best laundry services with modern equipment and
              experienced staff.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No hidden charges. Pay only for what you use. Iron service
              available at ₹5 per kg.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-indigo-emerald text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Weight</th>
                  <th className="px-6 py-4 text-left">Washing</th>
                  <th className="px-6 py-4 text-left">Dry Cleaning</th>
                  <th className="px-6 py-4 text-left">Iron Only</th>
                  <th className="px-6 py-4 text-left">Special Offer</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {row.weight}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {row.wash}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {row.dryClean}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {row.iron}
                    </td>
                    <td className="px-6 py-4">
                      {row.discount && (
                        <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-sm font-medium">
                          {row.discount}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              <strong>Iron Service:</strong> Add ₹5 per kg to any service for
              professional ironing
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-emerald-indigo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience Premium Laundry Care?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their
            laundry needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/order"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Place Your Order
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  to="/register"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors inline-flex items-center justify-center"
                >
                  Create Account
                </Link>
                <button
                  onClick={handleWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact via WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
