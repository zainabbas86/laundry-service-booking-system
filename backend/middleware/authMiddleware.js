
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Checks the Bearer token and loads the user into req.user.
const protect = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        req.user = user;
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    return next();
};

// Allows only the given roles. Use after protect, e.g. authorize(ROLES.MANAGER, ROLES.ADMIN).
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden for this role' });
    }
    return next();
};

module.exports = { protect, authorize };
