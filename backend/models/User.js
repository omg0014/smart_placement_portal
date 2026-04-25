const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['seeker', 'recruiter'],
    default: 'seeker',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  preferredRoles: [{
    type: String,
  }],
  skills: [{
    type: String,
  }],
  education: {
    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    year: { type: String, default: '' },
  },
  experienceLevel: {
    type: String,
    enum: ['Fresher', 'Experienced', ''],
    default: '',
  },
  linkedin: {
    type: String,
    default: '',
  },
  portfolio: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  // path to uploaded resume file (seekers only)
  resume: {
    type: String,
    default: '',
  },
  // jobs the seeker has saved/bookmarked
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
