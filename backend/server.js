// Load environment variables FIRST (before anything else)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

// import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');

const app = express();
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

// simple health check
app.get('/', (req, res) => {
  res.json({ message: 'Smart Job Portal API is running 🚀' });
});

// --- Connect to MongoDB and start server ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
