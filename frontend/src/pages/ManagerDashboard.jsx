import { useCallback, useEffect, useState } from 'react';
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

const ManagerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [picked, setPicked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [ticketRes, driverRes] = await Promise.all([
        axiosInstance.get('/api/tickets'),
        axiosInstance.get('/api/users/drivers'),
      ]);
      setTickets(ticketRes.data);
      setDrivers(driverRes.data);
    } catch (err) {
      setError(apiMessage(err, 'Could not load bookings.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (ticket, driverId) => {
    setError('');
    setSuccess('');
    try {
      await axiosInstance.patch(`/api/tickets/${ticket.id}/assign`, { driver: driverId });
      setSuccess(`Ticket ${shortTicketNo(ticket.ticketNo)} assigned.`);
      setPicked({ ...picked, [ticket.id]: undefined });
      await loadData();
    } catch (err) {
      setError(apiMessage(err, 'Could not assign the driver.'));
    }
  };

  const handleCancel = async (ticket) => {
    if (!window.confirm(`Cancel ticket ${shortTicketNo(ticket.ticketNo)}?`)) return;

    setError('');
    setSuccess('');
    try {
      await axiosInstance.patch(`/api/tickets/${ticket.id}/cancel`);
      setSuccess(`Ticket ${shortTicketNo(ticket.ticketNo)} cancelled.`);
      await loadData();
    } catch (err) {
      setError(apiMessage(err, 'Could not cancel the ticket.'));
    }
  };

  return (
    <main className="page">
      <h1 className="page-title">Bookings</h1>
      <p className="page-lead">Every booking. Assign a driver to new bookings, or cancel them.</p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      )}

      {!loading && drivers.length === 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No drivers yet. Add a driver account first.
        </p>
      )}

      <section className="card">
        {loading ? (
          <p className="text-sm text-gray-600">Loading bookings...</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-gray-600">No bookings yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tickets.map((ticket) => {
              const selected = picked[ticket.id] ?? ticket.driver?.id ?? '';
              const canAssign =
                ticket.status === STATUSES.AWAITING_PICKUP && ticket.subStatus !== SUB_STATUSES.COLLECTED;
              const canCancel = ![STATUSES.COMPLETED, STATUSES.CANCELLED].includes(ticket.status);
              return (
                <li key={ticket.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">#{shortTicketNo(ticket.ticketNo)}</span>
                        <span className="text-sm text-gray-600">{ticket.customer?.name}</span>
                        <span className="text-xs font-semibold text-gray-500">{ticket.status}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-800">{serviceLabel(ticket.service)}</p>
                      <p className="text-sm text-gray-600">Pickup {formatSlot(ticket.pickupSlot)}</p>
                      <p className="text-sm text-gray-600">{ticket.pickupAddress}</p>
                      <p className="text-sm text-gray-600">
                        {returnMethodLabel(ticket.returnMethod)}
                        {ticket.returnMethod === RETURN_METHODS.DELIVERY && ticket.deliverySlot
                          ? ` | Delivery ${formatSlot(ticket.deliverySlot)}`
                          : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ticket.driver ? `${ticket.subStatus || 'Driver'}: ${ticket.driver.name}` : 'No driver yet'}
                      </p>
                    </div>

                    {(canAssign || canCancel) && (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {canAssign && (
                          <>
                            <label htmlFor={`driver-${ticket.id}`} className="sr-only">Driver</label>
                            <select
                              id={`driver-${ticket.id}`}
                              className="input w-auto"
                              value={selected}
                              onChange={(e) => setPicked({ ...picked, [ticket.id]: e.target.value })}
                            >
                              <option value="">Choose a driver</option>
                              {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>{driver.name}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="btn-primary"
                              disabled={!selected || selected === ticket.driver?.id}
                              onClick={() => handleAssign(ticket, selected)}
                            >
                              {ticket.driver ? 'Reassign' : 'Assign'}
                            </button>
                          </>
                        )}
                        {canCancel && (
                          <button
                            type="button"
                            className="btn-secondary text-red-600"
                            onClick={() => handleCancel(ticket)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
};

export default ManagerDashboard;
