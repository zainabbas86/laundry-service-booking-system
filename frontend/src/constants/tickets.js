export const SERVICES = Object.freeze({
  WASH_AND_FOLD: 'wash and fold',
  DRY_CLEANING: 'dry cleaning',
  IRONING: 'ironing',
});

export const SERVICE_LIST = Object.values(SERVICES);

export const SERVICE_LABELS = Object.freeze({
  [SERVICES.WASH_AND_FOLD]: 'Wash and fold',
  [SERVICES.DRY_CLEANING]: 'Dry cleaning',
  [SERVICES.IRONING]: 'Ironing',
});

export const serviceLabel = (service) => SERVICE_LABELS[service] || service || 'Unknown';

export const RETURN_METHODS = Object.freeze({
  DELIVERY: 'delivery',
  COLLECTION: 'collection',
});

export const RETURN_METHOD_LIST = Object.values(RETURN_METHODS);

export const RETURN_METHOD_LABELS = Object.freeze({
  [RETURN_METHODS.DELIVERY]: 'Delivery',
  [RETURN_METHODS.COLLECTION]: 'Collection',
});

export const returnMethodLabel = (method) =>
  RETURN_METHOD_LABELS[method] || method || 'Unknown';

export const STATUSES = Object.freeze({
  AWAITING_PICKUP: 'Awaiting pickup',
  PROCESSING: 'Processing',
  READY_FOR_COLLECTION: 'Ready for collection',
  AWAITING_DELIVERY: 'Awaiting delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
});

export const STATUS_LIST = Object.values(STATUSES);

export const shortTicketNo = (no) => no.slice(0, 8);

export const formatSlot = (iso) =>
  new Date(iso).toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
