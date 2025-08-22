const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.orderType !== "guest";
      },
    },
    orderType: {
      type: String,
      enum: ["user", "guest"],
      default: "user",
    },
    guestInfo: {
      name: String,
      phone: String,
      address: String,
      pgName: {
        type: String,
        required: function () {
          return this.orderType === "guest";
        },
      },
      roomNumber: String, // Room number (optional)
    },
    // Customer contact info (for admin to contact)
    customerInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      pgName: {
        type: String,
        required: true, // Always required for admin contact
      },
      roomNumber: String, // Room number (optional)
    },
    items: [
      {
        type: {
          type: String,
          required: true,
          enum: ["wash", "dry-clean", "iron"],
        },
        weight: {
          type: Number,
          required: true,
          min: 0,
        },
        pricePerKg: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    ironService: {
      required: {
        type: Boolean,
        default: false,
      },
      weight: {
        type: Number,
        default: 0,
      },
      pricePerKg: {
        type: Number,
        default: 5,
      },
      totalPrice: {
        type: Number,
        default: 0,
      },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      percentage: {
        type: Number,
        default: 0,
      },
      amount: {
        type: Number,
        default: 0,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "qr"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "delivered", "cancelled"],
      default: "pending",
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
