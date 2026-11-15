import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import {
  RETURN_METHODS,
  RETURN_METHOD_LIST,
  SERVICE_LIST,
  returnMethodLabel,
  serviceLabel,
  shortTicketNo,
} from '../constants/tickets';

const apiMessage = (error, fallback) => error.response?.data?.message || fallback;

const CARD_ON = 'flex gap-2.5 items-start rounded-xl border border-blue-600 bg-blue-50 p-3 cursor-pointer';
const CARD_OFF = 'flex gap-2.5 items-start rounded-xl border border-gray-200 bg-white p-3 cursor-pointer';

const nextSevenDays = () =>
  Array.from({ length: 7 }, (_, offset) => {
    const day = new Date();
    day.setDate(day.getDate() + offset);
    return {
      value: day.toLocaleDateString('en-CA'),
      label: day.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

const BookPickup = () => {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [pickupDays] = useState(nextSevenDays);
  const [date, setDate] = useState(() => nextSevenDays()[0].value);
  const [service, setService] = useState(SERVICE_LIST[0]);
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState('');
  const [address, setAddress] = useState('');
  const [returnMethod, setReturnMethod] = useState(RETURN_METHODS.DELIVERY);
  const [deliverySlot, setDeliverySlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [storeResponse, profileResponse] = await Promise.all([
          axiosInstance.get('/api/stores'),
          axiosInstance.get('/api/auth/profile'),
        ]);
        setStores(storeResponse.data);
        setStoreId(storeResponse.data[0]?.id || '');
        setAddress(profileResponse.data.address || '');
      } catch (err) {
        setError(apiMessage(err, 'Could not load the booking form.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const refreshSlots = useCallback(async () => {
    if (!storeId || !date) return;

    try {
      const response = await axiosInstance.get('/api/tickets/slots', {
        params: { store: storeId, date },
      });
      const offered = response.data.slots || [];
      setSlots(offered);
      setSlot((current) => (offered.some((item) => item.start === current) ? current : ''));
    } catch (err) {
      setError(apiMessage(err, 'Could not load pickup slots.'));
    }
  }, [storeId, date]);

  useEffect(() => {
    refreshSlots();
  }, [refreshSlots]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!storeId || !slot) {
      setError('Choose a pickup slot.');
      return;
    }
    if (!address.trim()) {
      setError('Pickup address is required.');
      return;
    }
    if (returnMethod === RETURN_METHODS.DELIVERY && !deliverySlot) {
      setError('Choose a delivery slot.');
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.post('/api/tickets', {
        store: storeId,
        service,
        pickupSlot: slot,
        pickupAddress: address.trim(),
        returnMethod,
        deliverySlot:
          returnMethod === RETURN_METHODS.DELIVERY ? new Date(deliverySlot).toISOString() : null,
      });
      setBooked(response.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('That slot was just taken, pick another.');
        setSlot('');
        await refreshSlots();
      } else {
        setError(apiMessage(err, 'Could not book the pickup.'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (booked) {
    return (
      <main className="page">
        <h1 className="page-title">Book a pickup</h1>
        <p className="page-lead">
          We collect from your address. You get a ticket number as soon as you confirm.
        </p>

        <section className="card">
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3.5 text-[13px] text-green-800"
          >
            <span>
              <strong>Booking received.</strong> Ticket {shortTicketNo(booked.ticketNo)}
              <span className="mt-1 block">
                {booked.status}. A manager will assign a driver.
              </span>
              <Link to="/dashboard" className="mt-2 inline-block font-semibold text-green-700 hover:underline">
                Track my ticket
              </Link>
            </span>
          </div>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <p className="text-sm text-gray-600">Loading the booking form...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1 className="page-title">Book a pickup</h1>
      <p className="page-lead">
        We collect from your address. You get a ticket number as soon as you confirm.
      </p>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="card" noValidate>
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="store" className="label">Store</label>
            <select id="store" className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="label">Pickup date</span>
            <div className="flex flex-wrap gap-2">
              {pickupDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  aria-pressed={date === day.value}
                  onClick={() => setDate(day.value)}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    date === day.value
                      ? 'border-blue-600 bg-blue-600 font-semibold text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <fieldset className="mb-5 border-0 p-0">
          <legend className="label">Service</legend>
          <div className="grid gap-2.5">
            {SERVICE_LIST.map((option) => (
              <label key={option} className={service === option ? CARD_ON : CARD_OFF}>
                <input
                  type="radio"
                  name="service"
                  value={option}
                  checked={service === option}
                  onChange={() => setService(option)}
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-sm font-semibold">{serviceLabel(option)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mb-5">
          <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
            <span className="label mb-0">Pickup slot</span>
            <span className="text-xs text-gray-500">One pickup per slot</span>
          </div>

          {slots.length === 0 ? (
            <p className="text-sm text-gray-600">No slots left on this day</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {slots.map((item) => (
                <button
                  key={item.start}
                  type="button"
                  aria-pressed={slot === item.start}
                  onClick={() => setSlot(item.start)}
                  className={`rounded-lg border px-2 py-2.5 text-[13px] ${
                    slot === item.start
                      ? 'border-blue-600 bg-blue-600 font-semibold text-white'
                      : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="address" className="label">Pickup address</label>
          <input
            id="address"
            type="text"
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <fieldset className="border-0 p-0">
          <legend className="label">Return method</legend>
          <div className="grid gap-2.5">
            {RETURN_METHOD_LIST.map((option) => (
              <label key={option} className={returnMethod === option ? CARD_ON : CARD_OFF}>
                <input
                  type="radio"
                  name="returnMethod"
                  value={option}
                  checked={returnMethod === option}
                  onChange={() => setReturnMethod(option)}
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-sm font-semibold">{returnMethodLabel(option)}</span>
              </label>
            ))}
          </div>

          {returnMethod === RETURN_METHODS.DELIVERY && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3.5">
              <label htmlFor="deliverySlot" className="label">Delivery slot</label>
              <input
                id="deliverySlot"
                type="datetime-local"
                className="input"
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
              />
            </div>
          )}
        </fieldset>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 mt-5">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Booking...' : 'Confirm booking'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default BookPickup;
