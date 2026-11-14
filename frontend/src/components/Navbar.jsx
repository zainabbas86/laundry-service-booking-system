import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Roles, { roleLabel } from '../constants/roles';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const navClass = ({ isActive }) =>
  `py-1 border-b-2 ${
    isActive ? 'text-white border-white font-semibold' : 'text-blue-100 border-transparent hover:text-white'
  }`;

// One menu per role
const MENU = {
  [Roles.CUSTOMER]: [{ to: '/dashboard', label: 'My laundry' }],
  [Roles.MANAGER]: [{ to: '/dashboard', label: 'Bookings' }],
  [Roles.DRIVER]: [{ to: '/dashboard', label: 'My jobs' }],
  [Roles.ADMIN]: [{ to: '/dashboard', label: 'Dashboard' }],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = (user && MENU[user.role]) || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 text-lg font-bold">
          <span className="w-[34px] h-[34px] rounded-lg bg-white grid place-items-center">
            <img src="/favicon-64.png" alt="" className="w-7 h-7" />
          </span>
          <span>LSBS</span>
        </Link>

        {user ? (
          <>
            <nav aria-label="Main" className="flex gap-5 text-sm">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/profile" className={navClass}>Profile</NavLink>
            </nav>

            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-2 bg-white/15 rounded-full py-1.5 pl-1.5 pr-3">
                <span className="w-[26px] h-[26px] rounded-full bg-white/25 grid place-items-center text-[11px] font-bold">
                  {initials(user.name)}
                </span>
                <span>
                  {user.name}
                  <span className="text-blue-200"> | {roleLabel(user.role)}</span>
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-white/40 hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <nav aria-label="Account" className="flex items-center gap-4 text-sm">
            <NavLink to="/login" className={navClass}>Log In</NavLink>
            <NavLink to="/register" className={navClass}>Register</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
