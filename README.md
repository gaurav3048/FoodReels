# 🍔 FoodReels — Food Discovery & Ordering Platform

FoodReels is a full-stack food discovery and ordering web application that allows users to explore food through short videos, interact with food content, and order dishes online.

Unlike traditional food platforms that primarily display static images and menus, FoodReels provides a reels-style experience that makes discovering food more engaging and interactive.

## 🚀 Live Demo

- **Frontend:** https://food-reels-gamma.vercel.app
- **Backend:** https://foodreels-a3rq.onrender.com
- **GitHub Repository:** https://github.com/gaurav3048/FoodReels

## ✨ Features

- **Reels-Based Food Discovery:** Explore food through short videos.
- **User Authentication:** Secure registration and login using JWT authentication.
- **Food Video Uploads:** Upload and share food videos using ImageKit.
- **Like & Save:** Interact with food content and save your favorite dishes.
- **Food Ordering:** Place food orders directly through the application.
- **Online Payments:** Integrated Razorpay for payment processing.
- **Food Partner Integration:** Connect food discovery with food partners.
- **RESTful APIs:** Backend APIs for authentication, food management, and user interactions.
- **Protected Routes:** Secure access to authenticated features.
- **Responsive Interface:** Browse food content across supported screen sizes.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT, HTTP cookies |
| Media Management | ImageKit |
| Payment Gateway | Razorpay |
| API Development | REST APIs |
| Deployment | Vercel, Render |
| Version Control | Git, GitHub |

## 🏗️ Architecture

```text
                 ┌──────────────────────┐
                 │      React.js        │
                 │   Frontend (Vercel)  │
                 └──────────┬───────────┘
                            │
                       REST APIs
                            │
                 ┌──────────▼───────────┐
                 │    Node.js +         │
                 │    Express.js        │
                 │   Backend (Render)   │
                 └──────┬───────┬──────┘
                        │       │
               ┌────────▼──┐  ┌─▼──────────┐
               │  MongoDB  │  │  ImageKit  │
               │  Database │  │Media Assets│
               └───────────┘  └────────────┘

                  Razorpay Payment Gateway
```

## ⚙️ Getting Started

Follow these steps to run FoodReels locally.

### Prerequisites

Install the following tools before starting:

- Node.js and npm
- MongoDB or a MongoDB Atlas account
- Git
- ImageKit account for media uploads
- Razorpay account for payment integration

### 1. Clone the Repository

```bash
git clone https://github.com/gaurav3048/FoodReels.git
cd FoodReels
```

### 2. Install Dependencies

If your repository contains separate `frontend` and `backend` directories:

**Frontend**

```bash
cd frontend
npm install
```

**Backend**

Open another terminal:

```bash
cd backend
npm install
```

If your actual folder names differ, run these commands from the corresponding application directories.

### 3. Configure Environment Variables

Create a `.env` file in the backend directory and configure the variables required by your source code.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Use the exact environment variable names expected by your backend code.

For the frontend, configure the backend API URL in its `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

**Important:** Never commit `.env` files, database credentials, JWT secrets, or payment gateway secrets to GitHub.

### 4. Run the Application

Start the backend using the script defined in its `package.json`. For example:

```bash
cd backend
npm start
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite in your terminal, commonly `http://localhost:5173`.

### 5. Production Deployment

FoodReels is deployed using:

- **Vercel:** Hosts the React frontend.
- **Render:** Hosts the Node.js and Express backend.
- **MongoDB:** Stores application data.
- **ImageKit:** Handles food media assets.
- **Razorpay:** Processes online payments.

Production environment variables must be configured securely in the respective hosting dashboards.

## 🔐 Security

- JWT-based authentication and protected API routes.
- Cookie-based authentication where configured.
- Password hashing for user credentials.
- Environment variables for sensitive configuration.
- Payment processing through Razorpay.

Payment verification and authentication should always be enforced on the server side.

## 🔮 Future Improvements

- Personalized food recommendations.
- Advanced search and filtering.
- Food ratings and reviews.
- Improved video loading and performance.
- Order history and order tracking.
- Enhanced food partner dashboards.

## 👨‍💻 Author

**Gaurav Anand**

B.Tech — Electronics and Communication Engineering  
Cochin University of Science and Technology

- **GitHub:** https://github.com/gaurav3048

## 📄 License

This project is available for educational and portfolio purposes. Add a formal license to the repository if you intend to specify permissions for reuse and distribution.
