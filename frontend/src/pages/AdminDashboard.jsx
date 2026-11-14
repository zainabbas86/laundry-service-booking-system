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
      <p className="text-sm text-gray-600">Admin users placeholder. User management and role changes will appear here.</p>
    </section>
  </main>
);

export default AdminDashboard;
