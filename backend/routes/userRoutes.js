const express = require('express');
const { createUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.post('/', protect, authorize(ROLES.ADMIN, ROLES.MANAGER), createUser);

module.exports = router;
