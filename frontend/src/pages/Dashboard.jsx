import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdminDashboard from './AdminDashboard';
import DriverDashboard from './DriverDashboard';
import Roles from '../constants/roles';


const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case Roles.CUSTOMER:
      return <CustomerDashboard />;
    case Roles.MANAGER:
      return <ManagerDashboard />;
    case Roles.DRIVER:
      return <DriverDashboard />;
    case Roles.ADMIN:
      return <AdminDashboard />;
    default:
      return (
        <main className="page">
          <h1 className="page-title">Welcome, {user.name}</h1>
          <div className="card text-sm text-gray-600">
            No dashboard is set up for this role{user.role ? ` (${user.role})` : ''}.
          </div>
        </main>
      );
  }
};

export default Dashboard;