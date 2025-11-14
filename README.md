# Shift Builder

A full-stack web application for managing work shifts, designed to help administrators manage workers, and allow workers to view and manage their schedules.

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)

## 🎯 About the Project

Shift Builder is a shift management system that allows:

- **Workers** to register, view their assigned shifts, filter shifts by date, and manage their profiles
- **Administrators** to create and manage shifts, view all workers, edit worker profiles, and oversee the entire system

The application uses a secure authentication system with role-based access control, ensuring that workers can only access their own data while administrators have full system access.

## 🛠️ Technologies Used

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling tool
- **JWT (JSON Web Tokens)** - For secure authentication
- **bcryptjs** - For password encryption
- **dotenv** - For environment variable management

### Frontend

- **Angular** - Modern web framework (v20)
- **TypeScript** - Typed superset of JavaScript
- **RxJS** - Reactive programming library
- **Angular Router** - For navigation and routing

## ✨ Features

- User authentication and authorization (JWT-based)
- Role-based access control (Admin and Regular User)
- Shift creation, viewing, editing, and deletion
- Worker profile management
- Shift filtering and search capabilities
- Comment system for shifts
- Secure password hashing
- Token-based session management

## 📁 Project Structure

```
shift-builder/
│
├── server/                          # Backend server
│   ├── config/
│   │   └── database.js             # MongoDB connection configuration
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware
│   ├── models/                     # Database models (schemas)
│   │   ├── User.js                 # User model
│   │   ├── Shift.js                # Shift model
│   │   ├── Comment.js              # Comment model
│   │   └── Permission.js            # Permission model
│   ├── modules/                    # Feature modules
│   │   ├── User/
│   │   │   ├── Controller.js       # User business logic
│   │   │   ├── Route.js            # User API routes
│   │   │   └── Module.js           # User module exports
│   │   ├── Shift/
│   │   │   ├── Controller.js       # Shift business logic
│   │   │   ├── Route.js            # Shift API routes
│   │   │   └── Module.js           # Shift module exports
│   │   ├── Comment/
│   │   │   ├── Controller.js       # Comment business logic
│   │   │   ├── Route.js            # Comment API routes
│   │   │   └── Module.js           # Comment module exports
│   │   └── Permission/
│   │       ├── Controller.js       # Permission business logic
│   │       ├── Route.js            # Permission API routes
│   │       └── Module.js           # Permission module exports
│   ├── scripts/                    # Utility scripts
│   │   └── initPermissions.js      # Initialize database permissions
│   ├── utils/                      # Utility functions
│   │   ├── auth.js                 # JWT token utilities
│   │   └── tokenBlacklist.js       # Token blacklist management
│   ├── server.js                   # Main server entry point
│   └── package.json                # Server dependencies
│
└── angular-app/                     # Frontend application
    ├── src/
    │   ├── app/
    │   │   ├── components/         # Angular components (pages)
    │   │   │   ├── login/          # Login page
    │   │   │   ├── register/       # Registration page
    │   │   │   ├── admin-login/    # Admin login page
    │   │   │   ├── admin-register/ # Admin registration page
    │   │   │   ├── worker-home/    # Worker dashboard
    │   │   │   ├── admin-home/     # Admin dashboard
    │   │   │   ├── add-shift/     # Add shift form
    │   │   │   ├── all-shifts/     # View all shifts
    │   │   │   ├── all-workers/    # View all workers
    │   │   │   ├── edit-profile/   # Edit own profile
    │   │   │   ├── edit-worker-profile/ # Edit worker profile (admin)
    │   │   │   └── filtershifts-worker/ # Filter shifts
    │   │   ├── services/           # Angular services
    │   │   │   ├── auth.ts         # Authentication service
    │   │   │   ├── api.service.ts  # API communication service
    │   │   │   ├── shift.service.ts # Shift management service
    │   │   │   ├── comment.service.ts # Comment service
    │   │   │   ├── shift.ts        # Shift type definitions
    │   │   │   └── utils.ts        # Utility functions
    │   │   ├── app.routes.ts       # Application routing
    │   │   ├── app.config.ts       # App configuration
    │   │   └── app.ts              # Main app component
    │   ├── assets/                 # Static assets (images, etc.)
    │   ├── index.html              # Main HTML file
    │   ├── main.ts                 # Application entry point
    │   └── styles.css              # Global styles
    ├── angular.json                # Angular configuration
    └── package.json                # Frontend dependencies
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - [Download MongoDB](https://www.mongodb.com/try/download/community)
  - Make sure MongoDB is running on your system
  - Default connection: `mongodb://localhost:27017`

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shift-builder
```

### 2. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 3. Create Environment File

Create a `.env` file in the `server/` directory with the following content:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shiftbuilder
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE_TIME=3600
```

**Important:**

- Replace `your-secret-key-change-this-in-production` with a strong, random secret key
- Adjust `MONGODB_URI` if your MongoDB is running on a different host or port
- `JWT_EXPIRE_TIME` is in seconds (3600 = 1 hour)

### 4. Initialize Database Permissions

Before running the server, you need to initialize the permissions in the database. You can do this in three ways:

**Option A: Using the initPermissions Script (Recommended)**

Navigate to the server directory and run:

```bash
cd server
npm run init-permissions
```

This script will:

- Connect to your MongoDB database
- Check if permissions already exist
- Create "admin" and "regular_user" permissions if they don't exist
- Display a success message when complete

**Option B: Using MongoDB Shell**

```javascript
use shiftbuilder
db.permissions.insertMany([
  { description: "admin" },
  { description: "regular_user" }
])
```

**Option C: Using the API** (after starting the server)

Make POST requests to `/api/permission` to create permissions.

### 5. Frontend Setup

Navigate to the angular-app directory and install dependencies:

```bash
cd ../angular-app
npm install
```

## ▶️ Running the Application

### Running the Backend Server

1. Make sure MongoDB is running on your system
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Start the server:

   ```bash
   npm start
   ```

   For development with auto-reload (recommended):

   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Running the Frontend Application

1. Open a new terminal window
2. Navigate to the angular-app directory:
   ```bash
   cd angular-app
   ```
3. Start the development server:

   ```bash
   npm start
   ```

   Or using Angular CLI directly:

   ```bash
   ng serve
   ```

The frontend will be available at `http://localhost:4200` (default Angular port).

### Building for Production

To build the frontend for production:

```bash
cd angular-app
npm run build
```

The built files will be in the `angular-app/dist/` directory.

## 🔌 API Endpoints

### User Endpoints

- `GET /api/user/` - Get all users (Admin only)
- `GET /api/user/:id` - Get user by ID
- `POST /api/user/` - Create new user (registration)
- `POST /api/user/login` - Login user (returns JWT token)
- `PATCH /api/user/:id` - Update user by ID
- `DELETE /api/user/:id` - Delete user (Admin only)
- `POST /api/user/logout` - Logout user (invalidates token)

### Shift Endpoints

- `GET /api/shifts/` - Get all shifts (Admin only) or get shift by ID (if `_id` in query)
- `GET /api/shifts?userId=:userId` - Get shifts by user ID
- `POST /api/shifts/` - Create new shift (Admin only)
- `PATCH /api/shifts` - Update shift by ID
- `DELETE /api/shifts` - Delete shift (Admin only)

### Comment Endpoints

- `GET /api/comment/` - Get all comments (Admin only)
- `GET /api/comment/:id` - Get comment by ID
- `GET /api/comment/user/:userId` - Get all comments by user ID
- `POST /api/comment` - Create new comment
- `PATCH /api/comment/` - Update comment by ID
- `DELETE /api/comment/:id` - Delete comment (Admin only)

### Permission Endpoints

- `GET /api/permission` - Get all permissions
- `POST /api/permission` - Create new permission

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Admin-only endpoints require both authentication and admin permission.

## 🗄️ Database Setup

### MongoDB Connection

The application connects to MongoDB using the connection string specified in the `.env` file. By default, it connects to:

- **Host:** localhost
- **Port:** 27017
- **Database:** shiftbuilder

### Database Collections

The application uses the following collections:

- **users** - Stores user accounts (workers and admins)
- **shifts** - Stores work shifts assigned to users
- **comments** - Stores comments associated with users and shifts
- **permissions** - Stores permission types (admin, regular_user)

### Initial Setup Scripts

The server includes utility scripts in the `server/scripts/` directory:

- `initPermissions.js` - Initialize default permissions
- `syncComments.js` - Sync comments with users
- `addShiftNameIndex.js` - Add database indexes for performance

## 🔒 Security Features

- **Password Hashing:** All passwords are encrypted using bcryptjs before storage
- **JWT Authentication:** Secure token-based authentication
- **Token Blacklisting:** Logged-out tokens are invalidated
- **Role-Based Access Control:** Different permissions for admins and regular users
- **Input Validation:** All user inputs are validated before processing

## 📝 Notes

- The frontend runs on port 4200 by default (Angular development server)
- The backend runs on port 3000 by default (configurable via `.env`)
- Make sure both servers are running for the application to work properly
- MongoDB must be running before starting the backend server
- Admin users must register through the admin registration page (separate from regular registration)

## 🤝 Contributing

This is a capstone project. For contributions or questions, please contact me!

## 📄 License

This project is part of a capstone project for educational purposes.

---

**Happy Coding! 🚀**
