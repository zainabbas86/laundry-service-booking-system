import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { SUB_STATUSES, formatSlot, serviceLabel, shortTicketNo } from '../constants/tickets';

const apiMessage = (error, fallback) => error.response?.data?.message || fallback;

const NEXT_ACTION = {
  [SUB_STATUSES.PICKUP_ASSIGNED]: 'Mark collected',
  [SUB_STATUSES.COLLECTED]: 'Mark received at laundry',
};

const DriverDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadJobs = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/tickets/jobs');
      setJobs(response.data);
    } catch (err) {
      setError(apiMessage(err, 'Could not load your jobs.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleProgress = async (job) => {
    setError('');
    setSuccess('');
    try {
      const response = await axiosInstance.patch(`/api/tickets/${job.id}/progress`);
      setSuccess(`Ticket ${shortTicketNo(job.ticketNo)}: ${response.data.subStatus}.`);
      await loadJobs();
    } catch (err) {
      setError(apiMessage(err, 'Could not update the job.'));
    }
  };

  return (
    <main className="page">
      <h1 className="page-title">My jobs</h1>
      <p className="page-lead">Pickups assigned to you, in pickup order.</p>

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

      <section className="card">
        {loading ? (
          <p className="text-sm text-gray-600">Loading your jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-600">No jobs assigned to you right now.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <li key={job.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">#{shortTicketNo(job.ticketNo)}</span>
                      <span className="text-sm text-gray-600">{job.customer?.name}</span>
                      <span className="text-xs font-semibold text-gray-500">{job.subStatus}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-800">Pickup {formatSlot(job.pickupSlot)}</p>
                    <p className="text-sm text-gray-600">{job.pickupAddress}</p>
                    <p className="text-sm text-gray-600">{serviceLabel(job.service)}</p>
                    <p className="text-sm text-gray-600">
                      Drop at {job.store?.name}{job.store?.address ? `, ${job.store.address}` : ''}
                    </p>
                  </div>

                  {NEXT_ACTION[job.subStatus] && (
                    <button type="button" className="btn-primary" onClick={() => handleProgress(job)}>
                      {NEXT_ACTION[job.subStatus]}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};



export default DriverDashboard;
