const User = require('../models/User');

// @desc    Update user profile and mark onboarding as complete
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      phone,
      address,
      preferredRoles,
      skills,
      education,
      experienceLevel,
      linkedin,
      portfolio,
      bio,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (preferredRoles !== undefined) user.preferredRoles = preferredRoles;
    if (skills !== undefined) user.skills = skills;
    if (education !== undefined) user.education = education;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (bio !== undefined) user.bio = bio;

    user.onboardingCompleted = true;

    await user.save();

    // Do not return password
    const updatedUser = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
