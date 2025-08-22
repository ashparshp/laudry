# Laundry Service - PG Registration & WhatsApp Integration

## What's been implemented:

### 1. **Enhanced Registration Form**

- Added **PG/Hostel Name** (required field)
- Added **Room Number** (optional field)
- Users must provide PG name during registration

### 2. **Order Processing with PG Details**

- **Guest Orders**: Captures PG name and room number from the form
- **User Orders**: Uses PG details from user's profile
- PG name is mandatory for all orders
- Server validates PG name presence before creating orders

### 3. **WhatsApp Integration**

- **Automatic Admin Notifications**: When an order is placed, admin receives detailed WhatsApp message
- **Customer WhatsApp Button**: Customers can send order details via WhatsApp
- Messages include full customer details with PG/hostel information

### 4. **Updated Models**

- **User Model**: Added `pgName` (required) and `roomNumber` (optional)
- **Order Model**: Added customer info with PG details for admin reference

## How to test:

### **Registration with PG Details:**

1. Go to: http://localhost:5174/register
2. Fill all details including **PG/Hostel Name** (required)
3. Room number is optional
4. Register successfully

### **Place Order as Guest:**

1. Go to: http://localhost:5174/order
2. Select "Guest Order"
3. Fill contact info including **PG/Hostel Name** (required)
4. Add items and place order
5. Check server console for admin WhatsApp message

### **Place Order as User:**

1. Login with registered account
2. Go to: http://localhost:5174/order
3. Select "User Account"
4. System uses PG details from your profile
5. Place order and check server console

### **WhatsApp Features:**

1. **Admin Notification**: Automatically sent to console (can be integrated with WhatsApp API)
2. **Customer WhatsApp**: Click "Contact via WhatsApp" button to send details

## Admin Phone Numbers:

- **Phone**: +919122763604
- **WhatsApp**: +919122763604

## Example Admin WhatsApp Message:

```
🧺 NEW LAUNDRY ORDER 🧺

👤 Customer Details:
Name: John Doe
Phone: +919876543210
Address: 123 Main Street, City
PG/Hostel: Green Valley PG
Room: 101

📦 Order Details:
Order ID: 64f7...
1. WASH: 5kg - ₹100
Iron Service: 3kg - ₹45

💰 Total Amount: ₹145
📅 Pickup: 8/23/2025
📅 Delivery: 8/26/2025
💳 Payment: COD

⏰ Order placed: 8/22/2025, 12:30:00 PM
```

## Next Steps for Production:

1. **Integrate WhatsApp Business API** or **Twilio** for actual message sending
2. **Add order tracking** with PG-specific delivery instructions
3. **Create admin dashboard** to manage PG-wise orders
4. **Add bulk messaging** for PG administrators
