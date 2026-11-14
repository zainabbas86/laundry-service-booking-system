const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    address: { type: String, trim: true },
});

module.exports = mongoose.model('Store', storeSchema);
