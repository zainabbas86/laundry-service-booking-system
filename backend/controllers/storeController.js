const Store = require('../models/Store');

// GET /api/stores - any signed-in user (customers pick a store when booking)
const getStores = async (req, res) => {
    try {
        const stores = await Store.find().sort({ name: 1 });
        return res.json(stores.map((s) => ({ id: s.id, name: s.name, address: s.address })));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getStores };
