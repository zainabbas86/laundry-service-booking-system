const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Store = require('../models/Store');
const { ROLES } = require('../constants/roles');
const {
    SERVICE_LIST,
    RETURN_METHODS,
    RETURN_METHOD_LIST,
    STATUSES,
    SUB_STATUSES,
    SLOT,
} = require('../constants/tickets');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const today = () => new Date().toLocaleDateString('en-CA');

const parseDay = (value) => {
    if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day
    ) {
        return null;
    }
    return parsed;
};

const slotsForDay = (day) => {
    const slots = [];
    for (let hour = SLOT.OPEN_HOUR; hour < SLOT.CLOSE_HOUR; hour += 1) {
        for (let minute = 0; minute < 60; minute += SLOT.MINUTES) {
            slots.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute));
        }
    }
    return slots;
};

const storeSummary = (store) => {
    if (!store) return null;
    if (store.name) return { id: store.id, name: store.name, address: store.address };
    return store.toString();
};

const userSummary = (user) => {
    if (!user) return null;
    if (user.name) return { id: user.id, name: user.name };
    return user.toString();
};

const toTicket = (ticket) => ({
    id: ticket.id,
    ticketNo: ticket.ticketNo,
    customer: userSummary(ticket.customer),
    store: storeSummary(ticket.store),
    service: ticket.service,
    pickupSlot: ticket.pickupSlot,
    pickupAddress: ticket.pickupAddress,
    returnMethod: ticket.returnMethod,
    deliverySlot: ticket.deliverySlot,
    status: ticket.status,
    subStatus: ticket.subStatus,
    driver: userSummary(ticket.driver),
    log: (ticket.log || []).map((entry) => ({
        action: entry.action,
        by: entry.by ? entry.by.toString() : null,
        byName: entry.byName,
        at: entry.at,
    })),
    createdAt: ticket.createdAt,
});

const populateTicket = (ticket) =>
    ticket.populate([
        { path: 'store', select: 'name address' },
        { path: 'customer', select: 'name email' },
        { path: 'driver', select: 'name' },
    ]);

const takenSlotStarts = async (storeId, day) => {
    const nextDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    const booked = await Ticket.find({
        store: storeId,
        occupiesSlot: true,
        pickupSlot: { $gte: day, $lt: nextDay },
    }).select('pickupSlot');

    return new Set(booked.map((ticket) => ticket.pickupSlot.toISOString()));
};

const freeSlots = async (storeId, day) => {
    const taken = await takenSlotStarts(storeId, day);
    const now = Date.now();

    return slotsForDay(day)
        .filter((slot) => slot.getTime() > now && !taken.has(slot.toISOString()))
        .map((slot) => ({ start: slot.toISOString(), label: slot.toTimeString().slice(0, 5) }));
};

const getSlots = async (req, res) => {
    const { store: storeId } = req.query;
    const date = req.query.date || today();

    if (!mongoose.isValidObjectId(storeId)) {
        return res.status(400).json({ message: 'A valid store is required' });
    }
    const day = parseDay(date);
    if (!day) {
        return res.status(400).json({ message: 'Date must be YYYY-MM-DD' });
    }

    try {
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(400).json({ message: 'Unknown store' });
        }

        return res.json({
            store: { id: store.id, name: store.name },
            date,
            slots: await freeSlots(store._id, day),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createTicket = async (req, res) => {
    const { service, pickupSlot, pickupAddress, returnMethod, deliverySlot } = req.body;

    if (!mongoose.isValidObjectId(req.body.store)) {
        return res.status(400).json({ message: 'A valid store is required' });
    }
    if (!SERVICE_LIST.includes(service)) {
        return res.status(400).json({ message: 'Choose one of the offered services' });
    }
    if (typeof pickupAddress !== 'string' || !pickupAddress.trim()) {
        return res.status(400).json({ message: 'Pickup address is required' });
    }

    const pickup = toDate(pickupSlot);
    if (!pickup) {
        return res.status(400).json({ message: 'Pickup slot is required' });
    }

    if (!RETURN_METHOD_LIST.includes(returnMethod)) {
        return res.status(400).json({ message: 'Return method must be delivery or collection' });
    }

    let delivery = null;
    if (returnMethod === RETURN_METHODS.DELIVERY) {
        delivery = toDate(deliverySlot);
        if (!delivery) {
            return res.status(400).json({ message: 'Delivery slot is required for a delivery return' });
        }
        if (delivery.getTime() <= pickup.getTime()) {
            return res.status(400).json({ message: 'Delivery slot must be after the pickup slot' });
        }
    }

    try {
        const store = await Store.findById(req.body.store);
        if (!store) {
            return res.status(400).json({ message: 'Unknown store' });
        }

        const day = new Date(pickup.getFullYear(), pickup.getMonth(), pickup.getDate());
        if (!slotsForDay(day).some((slot) => slot.getTime() === pickup.getTime())) {
            return res.status(400).json({ message: 'Pickup slot must be one of the offered slots' });
        }
        if ((await takenSlotStarts(store._id, day)).has(pickup.toISOString())) {
            return res.status(409).json({ message: 'That pickup slot is no longer available' });
        }
        if (pickup.getTime() <= Date.now()) {
            return res.status(400).json({ message: 'Pickup slot must be in the future' });
        }

        const ticket = new Ticket({
            customer: req.user.id,
            store: store._id,
            service,
            pickupSlot: pickup,
            pickupAddress: pickupAddress.trim(),
            returnMethod,
            deliverySlot: delivery,
            status: STATUSES.AWAITING_PICKUP,
            log: [{ action: 'Booked', by: req.user.id, byName: req.user.name }],
        });
        await ticket.save();
        await populateTicket(ticket);

        return res.status(201).json(toTicket(ticket));
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'That pickup slot is no longer available' });
        }
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message });
    }
};

const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ customer: req.user.id })
            .sort({ pickupSlot: -1 })
            .populate([
                { path: 'store', select: 'name address' },
                { path: 'driver', select: 'name' },
            ]);

        return res.json(tickets.map(toTicket));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const cancelTicket = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ message: 'Ticket not found' });
    }

    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const isStaff = [ROLES.MANAGER, ROLES.ADMIN].includes(req.user.role);
        if (!isStaff && ticket.customer.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        if (ticket.status === STATUSES.CANCELLED) {
            return res.status(400).json({ message: 'Ticket is already cancelled' });
        }
        if (ticket.status === STATUSES.COMPLETED) {
            return res.status(400).json({ message: 'A completed ticket cannot be cancelled' });
        }
        const collected = [SUB_STATUSES.COLLECTED, SUB_STATUSES.RECEIVED_AT_LAUNDRY].includes(
            ticket.subStatus
        );
        if (!isStaff && (ticket.status !== STATUSES.AWAITING_PICKUP || collected)) {
            return res.status(400).json({ message: 'A ticket cannot be cancelled after collection' });
        }

        ticket.status = STATUSES.CANCELLED;
        ticket.subStatus = null;
        ticket.occupiesSlot = false;
        ticket.log.push({ action: 'Cancelled', by: req.user.id, byName: req.user.name });

        await ticket.save();
        await populateTicket(ticket);

        return res.json(toTicket(ticket));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getSlots, createTicket, getMyTickets, cancelTicket };
