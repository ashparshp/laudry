const express = require("express");
const { body, validationResult } = require("express-validator");
const Order = require("../models/Order");
const Pricing = require("../models/Pricing");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/orders - Create a new order (both authenticated and guest orders)
router.post("/", async (req, res) => {
  try {
    const {
      items,
      ironService,
      pickupDate,
      deliveryDate,
      guestInfo,
      orderType,
      paymentMethod,
      notes,
    } = req.body;

    // Check if authenticated for user orders
    if (orderType === "user") {
      const token = req.header("x-auth-token");
      if (!token) {
        return res
          .status(401)
          .json({ message: "Authentication required for user orders" });
      }

      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Calculate item prices
    const itemsWithPrices = await Promise.all(
      items.map(async (item) => {
        const pricing = await calculateItemPrice(item.type, item.weight);
        return {
          ...item,
          pricePerKg: pricing.pricePerKg,
          totalPrice: pricing.totalPrice,
        };
      })
    );

    // Calculate subtotal
    const subtotal = itemsWithPrices.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    // Calculate iron service cost if required
    let ironCost = 0;
    if (ironService && ironService.required) {
      ironCost = ironService.weight * 15; // ₹15 per kg for iron service
    }

    // Calculate total weight
    const totalWeight =
      items.reduce((sum, item) => sum + item.weight, 0) +
      (ironService && ironService.required ? ironService.weight : 0);

    // Calculate discount
    const discount = calculateDiscount(totalWeight, subtotal + ironCost);

    // Calculate final total
    const finalTotal = subtotal + ironCost - discount.amount;

    // Create order data
    const orderData = {
      orderType: orderType || "guest",
      items: itemsWithPrices,
      ironService: ironService || { required: false },
      subtotal,
      discount,
      totalAmount: finalTotal,
      paymentMethod: paymentMethod || "cod",
      pickupDate: pickupDate
        ? new Date(pickupDate)
        : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
      deliveryDate: deliveryDate
        ? new Date(deliveryDate)
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default to 3 days later
      notes: notes || "",
      status: "pending",
    };

    // Set user or guest info based on order type
    if (orderType === "guest") {
      // Validate required fields for guest orders
      if (!guestInfo.pgName) {
        return res.status(400).json({ message: "PG/Hostel name is required" });
      }

      orderData.guestInfo = guestInfo;
      // Set customer info for admin contact
      orderData.customerInfo = {
        name: guestInfo.name,
        phone: guestInfo.phone,
        address: guestInfo.address,
        pgName: guestInfo.pgName,
        roomNumber: guestInfo.roomNumber || "",
      };
    } else {
      orderData.user = req.user.id;

      // Fetch user details to get address and phone
      const User = require("../models/User");
      const userDetails = await User.findById(req.user.id);

      if (!userDetails) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate that user has PG name in their profile
      if (!userDetails.address?.pgName) {
        return res.status(400).json({
          message:
            "Please update your profile with PG/Hostel name before placing an order",
        });
      }

      // Format address from user profile
      let userAddress = "";
      if (userDetails.address) {
        const addr = userDetails.address;
        userAddress = [addr.street, addr.city, addr.state, addr.zipCode]
          .filter(Boolean)
          .join(", ");
      }

      // Set customer info for admin contact
      orderData.customerInfo = {
        name: userDetails.name,
        phone: userDetails.phone,
        address: userAddress || "Address not provided",
        pgName: userDetails.address.pgName,
        roomNumber: userDetails.address?.roomNumber || "",
      };
    }

    // Create new order
    const order = new Order(orderData);

    await order.save();

    // Populate user details for response if it's a user order
    if (orderType !== "guest") {
      await order.populate("user", "name email phone");
    }

    // Send WhatsApp notification to admin
    await sendWhatsAppNotification(order);

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error.message);
    res.status(500).send("Server error");
  }
});

// Get user orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Get all orders (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Update order status (admin only)
router.put("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Helper functions
async function calculateItemPrice(type, weight) {
  // Basic pricing logic - you can customize this
  const basePrices = {
    wash: { 1: 30, 2: 29, 3: 28 },
    "dry-clean": { 1: 50, 2: 48, 3: 45 },
    iron: { 1: 15, 2: 14, 3: 13 },
  };

  let pricePerKg = basePrices[type][1]; // Default price

  if (weight >= 3) {
    pricePerKg = basePrices[type][3];
  } else if (weight >= 2) {
    pricePerKg = basePrices[type][2];
  }

  return {
    pricePerKg,
    totalPrice: weight * pricePerKg,
  };
}

function calculateDiscount(totalWeight, subtotal) {
  let discountPercentage = 0;

  if (totalWeight >= 3) {
    discountPercentage = 5;
  }

  const discountAmount = (subtotal * discountPercentage) / 100;

  return {
    percentage: discountPercentage,
    amount: discountAmount,
  };
}

// WhatsApp notification function
async function sendWhatsAppNotification(order) {
  try {
    const customerInfo = order.customerInfo;
    const items = order.items;
    const ironService = order.ironService;

    // Format order details for WhatsApp message
    let message = `🧺 *NEW LAUNDRY ORDER* 🧺\n\n`;
    message += `👤 *Customer Details:*\n`;
    message += `Name: ${customerInfo.name}\n`;
    message += `Phone: ${customerInfo.phone}\n`;
    message += `Address: ${customerInfo.address}\n`;
    message += `PG/Hostel: ${customerInfo.pgName}\n`;
    if (customerInfo.roomNumber) {
      message += `Room: ${customerInfo.roomNumber}\n`;
    }
    message += `\n`;

    message += `📦 *Order Details:*\n`;
    message += `Order ID: ${order._id}\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.type.toUpperCase()}: ${
        item.weight
      }kg - ₹${item.totalPrice}\n`;
    });

    if (ironService && ironService.required) {
      message += `Iron Service: ${ironService.weight}kg - ₹${
        ironService.weight * 15
      }\n`;
    }

    message += `\n💰 *Total Amount: ₹${order.totalAmount}*\n`;
    message += `📅 Pickup: ${new Date(
      order.pickupDate
    ).toLocaleDateString()}\n`;
    message += `📅 Delivery: ${new Date(
      order.deliveryDate
    ).toLocaleDateString()}\n`;
    message += `💳 Payment: ${order.paymentMethod.toUpperCase()}\n`;

    if (order.notes) {
      message += `📝 Notes: ${order.notes}\n`;
    }

    message += `\n⏰ Order placed: ${new Date().toLocaleString()}`;

    // Log the message (in production, you would send to WhatsApp API)
    console.log("📱 WhatsApp notification to admin:");
    console.log(message);
    console.log("─────────────────────────────────────");

    // Here you can integrate with WhatsApp Business API or Twilio
    // For now, we'll just log the message

    return true;
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    return false;
  }
}

module.exports = router;
