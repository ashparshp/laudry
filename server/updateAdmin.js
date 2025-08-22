const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const updateAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Find admin user
    const admin = await User.findOne({ email: "admin@laundry.com" });
    if (!admin) {
      console.log("Admin user not found. Creating new admin user...");

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      // Create admin user
      const newAdmin = new User({
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

      await newAdmin.save();
      console.log("New admin user created successfully!");
    } else {
      console.log("Admin user found. Updating password...");

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      // Update password
      admin.password = hashedPassword;
      await admin.save();

      console.log("Admin password updated successfully!");
    }

    console.log("Login Credentials:");
    console.log("Email: admin@laundry.com");
    console.log("Password: admin123");
    console.log("Role: admin");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.disconnect();
  }
};

updateAdminPassword();
