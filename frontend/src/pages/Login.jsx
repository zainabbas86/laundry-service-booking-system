import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { MailIcon, LockIcon, ArrowRightIcon } from '../components/Icons';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Already signed in: no reason to show the login form.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 pt-10 pb-16">
      <img src="/logo192.png" alt="LSBS logo" className="w-28 h-28 mx-auto mb-6" />

      <h1 className="text-3xl font-bold">Log In</h1>
      <p className="text-gray-600 mt-1 mb-6">Welcome Back!</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="auth-field">
          <MailIcon className="text-gray-400 shrink-0" />
          <input
            type="email"
            placeholder="Your email"
            aria-label="Email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </label>
        <label className="auth-field">
          <LockIcon className="text-gray-400 shrink-0" />
          <input
            type="password"
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </label>

        <button type="submit" className="btn-primary w-full py-3.5 rounded-xl text-base mt-4">
          Sign In
        </button>
      </form>

      <p className="text-center text-gray-600 mt-10">
        Don't have an account?{' '}
        <Link to="/register" className="auth-link inline-flex items-center gap-1 text-sm">
          Register <ArrowRightIcon />
        </Link>
      </p>
    </div>
  );
};

export default Login;
