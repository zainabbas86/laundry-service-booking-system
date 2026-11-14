const express = require('express');
const { getStores } = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getStores);

module.exports = router;
