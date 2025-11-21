# Kairos Chat

A real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring WebSocket communication, image sharing, and customizable themes.

## Features

- Real-time messaging with Socket.IO
- User authentication and authorization
- Online/offline user status
- Image sharing with Cloudinary integration
- Multiple theme options
- Responsive design
- Profile management
- Message history persistence

## Tech Stack

### Frontend
- React 18
- Vite
- Zustand (state management)
- React Router DOM
- Axios
- Socket.IO Client
- Tailwind CSS
- DaisyUI
- Lucide React (icons)
- React Hot Toast (notifications)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT (JSON Web Tokens)
- Bcrypt (password hashing)
- Cloudinary (image storage)
- Cookie Parser
- CORS

## Prerequisites

Before running this application, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Installation

### Clone the repository

```bash
git clone https://github.com/mahatolalit/kairos.git
cd kairos
```

### Install dependencies

Install dependencies for both frontend and backend:

```bash
npm run build
```

This command will:
- Install backend dependencies
- Install frontend dependencies
- Build the frontend for production

### Development Setup

For development, you'll need to install dependencies separately:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Running the Application

### Production Mode

```bash
npm start
```

This will start the backend server which serves the built frontend.

### Development Mode

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5001`.

## Project Structure

```
kairos/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── lib/              # Utility functions (db, socket)
│   │   ├── middleware/       # Auth middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   └── index.js          # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── lib/              # Axios config
│   │   ├── pages/            # Page components
│   │   ├── store/            # Zustand stores
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   └── package.json
└── package.json              # Root package.json
```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /signup` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /check` - Check authentication status

### Message Routes (`/api/messages`)
- `GET /users` - Get users for sidebar
- `GET /:id` - Get messages with a specific user
- `POST /send/:id` - Send a message to a user

### Cloudinary Routes (`/api/cloudinary`)
- `GET /sign` - Get Cloudinary signature for image upload

## Features in Detail

### Real-time Communication
The application uses Socket.IO for real-time bidirectional communication. Users can see when others are online and receive messages instantly.

### Image Sharing
Users can share images in their conversations. Images are uploaded to Cloudinary with client-side validation (max 5MB, images only).

### Theme Customization
The application supports multiple DaisyUI themes that users can switch between in the settings page.

### Authentication
Secure authentication using JWT tokens stored in HTTP-only cookies. Passwords are hashed using bcrypt.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

mahatolalit

## Acknowledgments

- Socket.IO for real-time communication
- Cloudinary for image hosting
- DaisyUI for the component library
- Zustand for state management
