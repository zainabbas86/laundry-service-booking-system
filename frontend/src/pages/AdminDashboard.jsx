import { Link } from 'react-router-dom';

const AdminDashboard = () => (
  <main className="page">
    <h1 className="page-title">Admin</h1>
    <p className="page-lead">All bookings and user accounts.</p>

    <section className="card mb-5">
      <h2 className="text-lg font-semibold mb-1">All bookings</h2>
      <p className="text-sm text-gray-600">Admin bookings placeholder. Every booking and its status will appear here.</p>
    </section>

    <section className="card">
      <h2 className="text-lg font-semibold mb-1">Users</h2>
      <p className="text-sm text-gray-600 mb-4">Add, edit and remove accounts, change roles and reset passwords.</p>
      <Link to="/users" className="btn-primary inline-block">Manage users</Link>
    </section>
  </main>
);

export default AdminDashboard;
