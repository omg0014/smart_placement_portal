// Factory function — returns middleware that only allows specific roles
// Usage: role('recruiter') or role('seeker', 'recruiter')
const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${allowedRoles.join(' or ')} can do this.`,
      });
    }

    next();
  };
};

module.exports = role;
