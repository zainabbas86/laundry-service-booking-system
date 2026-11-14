const mongoose = require('mongoose');
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

const toSafeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

const getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ name: 1 });
        return res.json(users.map(toSafeUser));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ message: 'User not found' });
    }

    const { name, role, password } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase().trim() : undefined;

    if (email !== undefined && !EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ message: 'Email is not valid' });
    }
    if (role !== undefined && !ROLE_LIST.includes(role)) {
        return res.status(400).json({ message: `Unknown role: ${role}` });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isSelf = user.id === req.user.id;
        if (user.role === ROLES.ADMIN && role && role !== ROLES.ADMIN) {
            if (!isSelf) {
                return res.status(403).json({ message: 'An admin cannot demote another admin' });
            }
            if ((await User.countDocuments({ role: ROLES.ADMIN })) <= 1) {
                return res.status(400).json({ message: 'The last admin cannot be demoted' });
            }
        }

        if (email && email !== user.email && (await User.exists({ email }))) {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (password) user.password = password;

        await user.save();
        return res.json(toSafeUser(user));
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }
        return res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (req.params.id === req.user.id) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === ROLES.ADMIN) {
            return res.status(403).json({ message: 'An admin cannot delete another admin' });
        }

        await user.deleteOne();
        return res.json({ message: 'User deleted' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };
