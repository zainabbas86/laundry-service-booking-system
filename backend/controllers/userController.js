const User = require('../models/User');
const { ROLES, ROLE_LIST } = require('../constants/roles');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Roles each creator may assign. Managers add customers and drivers only.
const CAN_CREATE = {
    [ROLES.ADMIN]: ROLE_LIST,
    [ROLES.MANAGER]: [ROLES.DRIVER, ROLES.CUSTOMER],
};

// POST /api/users
const createUser = async (req, res) => {
    const { name, password } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    const role = req.body.role || ROLES.CUSTOMER;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ message: 'Email is not valid' });
    }
    if (!ROLE_LIST.includes(role)) {
        return res.status(400).json({ message: `Unknown role: ${role}` });
    }
    if (!(CAN_CREATE[req.user.role] || []).includes(role)) {
        return res.status(403).json({ message: `A ${req.user.role} cannot create a ${role}` });
    }

    try {
        if (await User.exists({ email })) {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }

        const user = await User.create({ name, email, password, role });
        return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        // Unique index on email catches two requests racing past the check above.
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { createUser };
