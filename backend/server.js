// Load environment variables FIRST (before anything else)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

// Create standard HTTP server and Socket.io
const http = require('http');
const { Server } = require('socket.io');

// import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', 
      'http://localhost:5174', 
      'https://smart-placement-portal-three.vercel.app'
    ],
    credentials: true,
  },
});

// A Map to keep track of connected users: { userId: socketId }
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // When a user logs in, they emit 'register' with their DB user ID
  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    // Find and remove the disconnected socket
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// Attach socket map and io to req for easy access in controllers
app.use((req, res, next) => {
  req.io = io;
  req.userSockets = userSockets;
  next();
});

const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'https://smart-placement-portal-three.vercel.app'
  ], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// make sure the uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);

// simple health check
app.get('/', (req, res) => {
  res.json({ message: 'Smart Job Portal API is running 🚀' });
});

// --- Connect to MongoDB and start server ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Notice: listening on `server` not `app` because of Socket.io
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
