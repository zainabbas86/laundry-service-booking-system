const express = require('express');
const { getSlots, createTicket, getMyTickets, cancelTicket } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/slots', protect, getSlots);
router.get('/mine', protect, authorize(ROLES.CUSTOMER), getMyTickets);
router.post('/', protect, authorize(ROLES.CUSTOMER), createTicket);
router.patch('/:id/cancel', protect, authorize(ROLES.CUSTOMER, ROLES.MANAGER, ROLES.ADMIN), cancelTicket);

module.exports = router;
