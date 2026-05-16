# E-Waste Management System

A comprehensive MERN stack application for managing electronic waste pickup requests with user and admin roles.

## 🚀 Features

### User Features
- User registration and authentication
- Submit e-waste pickup requests
- Track pickup request status (Pending, Assigned, Collected)
- Edit profile details
- View reward points earned
- Edit/delete pending requests

### Admin Features
- Secure admin authentication
- View dashboard with statistics
- Manage all pickup requests
- Assign pickup requests to collectors
- Update request status
- View all users and their requests
- Analytics dashboard

### Technical Features
- JWT-based authentication
- RESTful APIs
- Input validation and error handling
- Responsive UI with Bootstrap
- MongoDB database with Mongoose ODM
- React.js with TypeScript
- Express.js backend

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (installed and running)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd E-waste
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with the following variables:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ewaste_management
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file with the following variable:
REACT_APP_API_URL=http://localhost:5000/api

# Start the frontend development server
npm start
```

## 🗄️ Database Setup

Make sure MongoDB is installed and running on your system. The application will create a database named `ewaste_management` automatically.

### Default Collections
- `users` - User accounts
- `admins` - Admin accounts  
- `pickuprequests` - Pickup request data

## 📱 Usage

### User Registration and Login
1. Navigate to `http://localhost:3000/register` to create a new user account
2. Fill in the required details (name, email, password, phone, address)
3. After registration, you'll be redirected to the dashboard
4. Use `http://localhost:3000/login` for future logins

### Admin Registration and Login
1. Navigate to `http://localhost:3000/admin/register` to create an admin account
2. Fill in the required details (name, email, password)
3. After registration, you'll be redirected to the admin dashboard
4. Use `http://localhost:3000/admin/login` for future admin logins

### Creating Pickup Requests (Users)
1. Login to your user account
2. Click "New Request" on the dashboard
3. Fill in the pickup request form:
   - Item type (laptop, desktop, mobile, etc.)
   - Quantity
   - Condition (working, not working, partially working)
   - Pickup address
   - Preferred date
   - Optional notes
4. Submit the request

### Managing Pickup Requests (Admins)
1. Login to your admin account
2. View the dashboard for statistics and recent requests
3. Go to "Pickup Requests" tab to see all requests
4. Use the status filter to view specific request types
5. Assign pending requests to yourself
6. Mark assigned requests as collected

## 🏗️ Project Structure

```
E-waste/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Admin.js             # Admin model
│   │   └── PickupRequest.js     # Pickup request model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── pickupRequests.js    # Pickup request routes
│   │   └── admin.js             # Admin management routes
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Main server file
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx        # Login component
│   │   │   ├── Register.tsx     # Registration component
│   │   │   ├── UserDashboard.tsx # User dashboard
│   │   │   └── AdminDashboard.tsx # Admin dashboard
│   │   ├── services/
│   │   │   ├── api.ts           # API configuration
│   │   │   ├── authService.ts   # Authentication service
│   │   │   ├── pickupService.ts # Pickup request service
│   │   │   └── adminService.ts  # Admin service
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript type definitions
│   │   ├── App.tsx              # Main App component
│   │   ├── index.tsx            # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── .env                     # Environment variables
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/register` - Admin registration
- `POST /api/auth/admin/login` - Admin login

### Pickup Requests
- `POST /api/pickup-requests` - Create pickup request
- `GET /api/pickup-requests/my-requests` - Get user's requests
- `GET /api/pickup-requests/:id` - Get specific request
- `PUT /api/pickup-requests/:id` - Update request
- `DELETE /api/pickup-requests/:id` - Delete request
- `GET /api/pickup-requests/admin/all` - Get all requests (Admin)
- `PUT /api/pickup-requests/:id/assign` - Assign request (Admin)
- `PUT /api/pickup-requests/:id/collect` - Mark as collected (Admin)

### Admin Management
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get specific user
- `GET /api/admin/analytics` - Get analytics data

## 🎯 Reward Points System

Users earn reward points based on the item type and quantity:

- Laptop: 50 points each
- Desktop: 40 points each
- Tablet: 25 points each
- Printer: 30 points each
- Monitor: 35 points each
- Keyboard: 10 points each
- Mouse: 5 points each
- Mobile: 20 points each
- Other: 15 points each

Points are awarded when the pickup request is marked as "Collected".

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🌟 Future Enhancements

- Email notifications for status changes
- Real-time updates with Socket.io
- File upload for item images
- Geolocation for pickup addresses
- Payment integration for premium services
- Mobile application
- Advanced analytics and reporting

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in .env file
   - Verify MongoDB is accessible on the specified port

2. **JWT Token Error**
   - Check JWT_SECRET in backend .env file
   - Clear browser localStorage if needed
   - Verify token expiration time

3. **CORS Issues**
   - Ensure REACT_APP_API_URL is correctly set in frontend .env
   - Check backend CORS configuration

4. **Port Conflicts**
   - Change PORT in backend .env if 5000 is occupied
   - Frontend runs on 3000 by default

## 📞 Support

For any issues or questions, please refer to the code documentation or create an issue in the repository.

## 📄 License

This project is licensed under the ISC License.
