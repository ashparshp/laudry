const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      required: true,
      enum: ["wash", "dry-clean", "iron"],
    },
    weightTiers: [
      {
        minWeight: {
          type: Number,
          required: true,
        },
        maxWeight: {
          type: Number,
          required: true,
        },
        pricePerKg: {
          type: Number,
          required: true,
        },
        discountPercentage: {
          type: Number,
          default: 0,
        },
      },
    ],
    ironServicePrice: {
      type: Number,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pricing", pricingSchema);
