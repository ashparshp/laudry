const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@laundry.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@laundry.com");
      console.log("You can login with this email and your password");
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@laundry.com",
      password: hashedPassword,
      phone: "+919122763604",
      address: {
        street: "Admin Street",
        city: "Admin City",
        state: "Admin State",
        zipCode: "123456",
        pgName: "Admin Office",
        roomNumber: "N/A",
      },
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@laundry.com");
    console.log("Password: admin123");
    console.log("Role: admin");
  } catch (error) {
    console.error("Error creating admin user:", error.message);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
