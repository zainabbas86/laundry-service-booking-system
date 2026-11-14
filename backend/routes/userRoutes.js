const express = require('express');
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/', protect, authorize(ROLES.ADMIN), getUsers);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), createUser);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateUser);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteUser);

module.exports = router;
