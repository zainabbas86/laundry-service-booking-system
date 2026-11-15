import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import {
  RETURN_METHODS,
  STATUSES,
  SUB_STATUSES,
  formatSlot,
  returnMethodLabel,
  serviceLabel,
  shortTicketNo,
} from '../constants/tickets';

const apiMessage = (error, fallback) => error.response?.data?.message || fallback;

const COLLECTED_SUB_STATUSES = [SUB_STATUSES.COLLECTED, SUB_STATUSES.RECEIVED_AT_LAUNDRY];

const BADGE = {
  [STATUSES.AWAITING_PICKUP]: 'bg-amber-100 text-amber-800',
  [STATUSES.PROCESSING]: 'bg-blue-100 text-blue-800',
  [STATUSES.READY_FOR_COLLECTION]: 'bg-indigo-100 text-indigo-800',
  [STATUSES.AWAITING_DELIVERY]: 'bg-indigo-100 text-indigo-800',
  [STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
  [STATUSES.CANCELLED]: 'bg-gray-100 text-gray-600',
};

const canCancel = (ticket) =>
  ticket.status === STATUSES.AWAITING_PICKUP && !COLLECTED_SUB_STATUSES.includes(ticket.subStatus);

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
      BADGE[status] || 'bg-gray-100 text-gray-700'
    }`}
  >
    {status}
  </span>
);

const CustomerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  const loadTickets = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/tickets/mine');
      setTickets(response.data);
    } catch (err) {
      setError(apiMessage(err, 'Could not load your tickets.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleCancel = async (ticket) => {
    if (!window.confirm(`Cancel ticket ${shortTicketNo(ticket.ticketNo)}?`)) return;

    setError('');
    try {
      await axiosInstance.patch(`/api/tickets/${ticket.id}/cancel`);
      await loadTickets();
    } catch (err) {
      setError(apiMessage(err, 'Could not cancel the ticket.'));
    }
  };

  const awaiting = tickets.filter((ticket) => ticket.status === STATUSES.AWAITING_PICKUP).length;
  const completed = tickets.filter((ticket) => ticket.status === STATUSES.COMPLETED).length;
  const processing = tickets.filter(
    (ticket) =>
      ![STATUSES.AWAITING_PICKUP, STATUSES.COMPLETED, STATUSES.CANCELLED].includes(ticket.status)
  ).length;

  return (
    <main className="page">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title mb-0">My laundry</h1>
          <p className="page-lead mb-0">Book a pickup and follow your tickets.</p>
        </div>
        <Link to="/book" className="btn-primary">Book a pickup</Link>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Awaiting', value: awaiting },
          { label: 'Processing', value: processing },
          { label: 'Completed', value: completed },
        ].map((count) => (
          <div key={count.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[13px] font-semibold text-gray-600">{count.label}</p>
            <p className="text-2xl font-bold">{count.value}</p>
          </div>
        ))}
      </div>

      <section className="card">
        {loading ? (
          <p className="text-sm text-gray-600">Loading your tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-gray-600">
            No tickets yet. Book a pickup and your ticket will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">#{shortTicketNo(ticket.ticketNo)}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-800">{serviceLabel(ticket.service)}</p>
                    <p className="text-sm text-gray-600">Pickup {formatSlot(ticket.pickupSlot)}</p>
                    <p className="text-sm text-gray-600">
                      {returnMethodLabel(ticket.returnMethod)}
                      {ticket.returnMethod === RETURN_METHODS.DELIVERY && ticket.deliverySlot
                        ? ` | Delivery ${formatSlot(ticket.deliverySlot)}`
                        : ''}
                    </p>
                    <p className="text-sm text-gray-600">{ticket.store?.name}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-sm">
                    {canCancel(ticket) && (
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() => handleCancel(ticket)}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setOpenId(openId === ticket.id ? null : ticket.id)}
                    >
                      {openId === ticket.id ? 'Hide ticket' : 'View ticket'}
                    </button>
                  </div>
                </div>

                {openId === ticket.id && (
                  <ol className="mt-3 space-y-1 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                    {ticket.log.map((entry, index) => (
                      <li key={`${entry.action}-${index}`}>
                        {entry.action} | {entry.byName} | {formatSlot(entry.at)}
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-3 text-xs text-gray-500">
        You can cancel until the driver collects your laundry.
      </p>
    </main>
  );
};

export default CustomerDashboard;
