const SERVICES = Object.freeze({
    WASH_AND_FOLD: 'wash and fold',
    DRY_CLEANING: 'dry cleaning',
    IRONING: 'ironing',
});

const RETURN_METHODS = Object.freeze({
    DELIVERY: 'delivery',
    COLLECTION: 'collection',
});

const STATUSES = Object.freeze({
    AWAITING_PICKUP: 'Awaiting pickup',
    PROCESSING: 'Processing',
    READY_FOR_COLLECTION: 'Ready for collection',
    AWAITING_DELIVERY: 'Awaiting delivery',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
});

const SUB_STATUSES = Object.freeze({
    PICKUP_ASSIGNED: 'Pickup assigned',
    COLLECTED: 'Collected',
    RECEIVED_AT_LAUNDRY: 'Received at laundry',
});

const SLOT = Object.freeze({
    MINUTES: 30,
    OPEN_HOUR: 8,
    CLOSE_HOUR: 18,
});

module.exports = {
    SERVICES,
    SERVICE_LIST: Object.values(SERVICES),
    RETURN_METHODS,
    RETURN_METHOD_LIST: Object.values(RETURN_METHODS),
    STATUSES,
    STATUS_LIST: Object.values(STATUSES),
    SUB_STATUSES,
    SUB_STATUS_LIST: Object.values(SUB_STATUSES),
    SLOT,
};
