# Laundry Service Backend

Express.js backend API for the laundry service website.

## Features

- User authentication with JWT
- Order management system
- Dynamic pricing calculation
- Admin panel APIs
- MongoDB integration
- RESTful API design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=8088
MONGODB_URI=mongodb://localhost:27017/laundry-service
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Development

```bash
npm run dev
```

The server will run on http://localhost:8088

### Production

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Pricing

- `GET /api/pricing` - Get current pricing
- `POST /api/pricing/calculate` - Calculate price for items

## Database Models

- **User**: User accounts with authentication
- **Order**: Laundry orders with items and pricing
- **Pricing**: Dynamic pricing configuration

## Technologies Used

- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests
