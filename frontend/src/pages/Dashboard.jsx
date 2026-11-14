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
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow-md">
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-sm text-gray-600 mt-2">
            No dashboard is set up for this role{user.role ? ` (${user.role})` : ''}.
          </p>
        </div>
      );
  }
};

export default Dashboard;