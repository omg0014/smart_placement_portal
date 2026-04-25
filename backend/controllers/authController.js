const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── MojoAuth SDK setup ────────────────────────────────────────────────────
const mojoauth = require('mojoauth-sdk')({
  apiKey: process.env.MOJOAUTH_API_KEY,
});

// helper to generate app JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// In-memory store for pending registrations { state_id -> {name, email, password, role} }
// NOTE: For production, use Redis or a DB collection with TTL
const pendingRegistrations = new Map();

// POST /api/auth/send-otp
// Called first during signup — stores form data and triggers MojoAuth email OTP
const sendOtp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check if email is already registered before sending OTP
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Send OTP via MojoAuth SDK
    const mojoRes = await mojoauth.mojoAPI.signinWithEmailOTP(email, {});

    const { state_id } = mojoRes;

    if (!state_id) {
      return res.status(500).json({ message: 'Failed to initiate OTP. Please try again.' });
    }

    // Temporarily hold the registration data keyed by state_id
    // Auto-clear after 10 minutes
    pendingRegistrations.set(state_id, { name, email, password, role: role || 'seeker' });
    setTimeout(() => pendingRegistrations.delete(state_id), 10 * 60 * 1000);

    res.json({ message: 'OTP sent to your email', state_id });
  } catch (error) {
    const msg = error?.message || error?.Description || JSON.stringify(error);
    console.error('Send OTP error:', msg);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// POST /api/auth/verify-otp
// Called with { state_id, otp } — verifies OTP then creates the account
const verifyOtp = async (req, res) => {
  try {
    const { state_id, otp } = req.body;

    if (!state_id || !otp) {
      return res.status(400).json({ message: 'state_id and otp are required' });
    }

    const pending = pendingRegistrations.get(state_id);
    if (!pending) {
      return res.status(400).json({ message: 'OTP session expired or invalid. Please restart signup.' });
    }

    // Verify OTP with MojoAuth SDK
    // NOTE: SDK resolves for BOTH success and error responses.
    // Error responses contain a `code` field (e.g. code:913 = Invalid OTP).
    // Success responses contain oauth/token data WITHOUT a code field.
    const mojoRes = await mojoauth.mojoAPI.verifyEmailOTP(otp, state_id);

    console.log('MojoAuth verify response:', JSON.stringify(mojoRes));

    // If response has a numeric code, it's an error from MojoAuth
    if (!mojoRes || mojoRes.code) {
      const errMsg = mojoRes?.description || mojoRes?.message || 'Invalid or expired OTP.';
      console.error('MojoAuth OTP error:', errMsg);
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    }

    // OTP verified — create the user account
    const { name, email, password, role } = pending;

    // Double-check the email isn't registered (race condition guard)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      pendingRegistrations.delete(state_id);
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Clean up pending store
    pendingRegistrations.delete(state_id);

    const token = generateToken(user);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: userObj,
    });
  } catch (error) {
    const msg = error?.message || error?.Description || JSON.stringify(error);
    console.error('Verify OTP error:', msg);

    // MojoAuth SDK rejects with an error object on wrong/expired OTP
    return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
  }
};

// POST /api/auth/signup (legacy — kept for backward compat, now bypassed in UI)
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'seeker',
    });

    const token = generateToken(user);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: 'Something went wrong during signup' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Something went wrong during login' });
  }
};

// GET /api/auth/me — get current logged-in user
const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch user info' });
  }
};

module.exports = { signup, login, getMe, sendOtp, verifyOtp };
