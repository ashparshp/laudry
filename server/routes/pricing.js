const express = require("express");
const Pricing = require("../models/Pricing");
const auth = require("../middleware/auth");

const router = express.Router();

// Get current pricing
router.get("/", async (req, res) => {
  try {
    const pricing = await Pricing.find({ isActive: true });

    // If no pricing exists, create default pricing
    if (pricing.length === 0) {
      const defaultPricing = await createDefaultPricing();
      return res.json(defaultPricing);
    }

    res.json(pricing);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Calculate price for items
router.post("/calculate", async (req, res) => {
  try {
    const { items, ironService } = req.body;

    let totalPrice = 0;
    let processedItems = [];

    for (let item of items) {
      const pricing = await calculateItemPrice(item.type, item.weight);
      processedItems.push({
        ...item,
        pricePerKg: pricing.pricePerKg,
        totalPrice: pricing.totalPrice,
      });
      totalPrice += pricing.totalPrice;
    }

    // Add iron service cost
    let ironCost = 0;
    if (ironService && ironService.required) {
      ironCost = ironService.weight * 5; // 5 Rs per kg
      totalPrice += ironCost;
    }

    // Calculate discount
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const discount = calculateDiscount(totalWeight, totalPrice - ironCost);

    const finalPrice = totalPrice - discount.amount;

    res.json({
      items: processedItems,
      ironService: {
        required: ironService?.required || false,
        weight: ironService?.weight || 0,
        cost: ironCost,
      },
      subtotal: totalPrice - ironCost,
      discount,
      ironCost,
      totalPrice: finalPrice,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Update pricing (admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const pricing = await Pricing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!pricing) {
      return res.status(404).json({ message: "Pricing not found" });
    }

    res.json(pricing);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// Helper functions
async function createDefaultPricing() {
  const defaultPricingData = [
    {
      serviceType: "wash",
      weightTiers: [
        { minWeight: 0, maxWeight: 1, pricePerKg: 30, discountPercentage: 0 },
        { minWeight: 1, maxWeight: 2, pricePerKg: 29, discountPercentage: 0 },
        { minWeight: 2, maxWeight: 999, pricePerKg: 28, discountPercentage: 5 },
      ],
    },
    {
      serviceType: "dry-clean",
      weightTiers: [
        { minWeight: 0, maxWeight: 1, pricePerKg: 50, discountPercentage: 0 },
        { minWeight: 1, maxWeight: 2, pricePerKg: 48, discountPercentage: 0 },
        { minWeight: 2, maxWeight: 999, pricePerKg: 45, discountPercentage: 5 },
      ],
    },
    {
      serviceType: "iron",
      weightTiers: [
        { minWeight: 0, maxWeight: 1, pricePerKg: 15, discountPercentage: 0 },
        { minWeight: 1, maxWeight: 2, pricePerKg: 14, discountPercentage: 0 },
        { minWeight: 2, maxWeight: 999, pricePerKg: 13, discountPercentage: 5 },
      ],
    },
  ];

  const createdPricing = await Pricing.insertMany(defaultPricingData);
  return createdPricing;
}

async function calculateItemPrice(type, weight) {
  const pricing = await Pricing.findOne({ serviceType: type, isActive: true });

  if (!pricing) {
    // Fallback pricing
    const fallbackPrices = { wash: 30, "dry-clean": 50, iron: 15 };
    return {
      pricePerKg: fallbackPrices[type] || 30,
      totalPrice: weight * (fallbackPrices[type] || 30),
    };
  }

  // Find appropriate tier
  const tier = pricing.weightTiers.find(
    (tier) => weight >= tier.minWeight && weight <= tier.maxWeight
  );

  const pricePerKg = tier ? tier.pricePerKg : pricing.weightTiers[0].pricePerKg;

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

module.exports = router;
