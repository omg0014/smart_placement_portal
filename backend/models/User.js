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
