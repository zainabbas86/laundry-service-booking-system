const crypto = require('crypto');
const mongoose = require('mongoose');
const { SERVICE_LIST, RETURN_METHOD_LIST, STATUSES, STATUS_LIST, SUB_STATUS_LIST } = require('../constants/tickets');

const logEntrySchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        byName: { type: String },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const ticketSchema = new mongoose.Schema(
    {
        ticketNo: {
            type: String,
            required: true,
            unique: true,
            default: () => crypto.randomUUID(),
        },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
        service: { type: String, required: true, enum: SERVICE_LIST },
        pickupSlot: { type: Date, required: true },
        pickupAddress: { type: String, required: true, trim: true },
        returnMethod: { type: String, required: true, enum: RETURN_METHOD_LIST },
        deliverySlot: { type: Date, default: null },
        status: { type: String, enum: STATUS_LIST, default: STATUSES.AWAITING_PICKUP },
        subStatus: { type: String, enum: SUB_STATUS_LIST, default: null },
        driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        occupiesSlot: { type: Boolean, default: true },
        log: { type: [logEntrySchema], default: [] },
    },
    { timestamps: true }
);

ticketSchema.index(
    { store: 1, pickupSlot: 1 },
    { unique: true, partialFilterExpression: { occupiesSlot: true } }
);

module.exports = mongoose.model('Ticket', ticketSchema);
