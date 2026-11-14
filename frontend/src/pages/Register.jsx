import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { UserIcon, MailIcon, LockIcon, ArrowRightIcon } from '../components/Icons';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/auth/register', formData);
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 pt-10 pb-16">
      <img src="/logo192.png" alt="LSBS logo" className="w-20 h-20 mb-6" />

      <h1 className="text-3xl font-bold">Register Account</h1>
      <p className="text-gray-600 mt-1 mb-6">Join our laundry service to book a wash now</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="auth-field">
          <UserIcon className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Full name"
            aria-label="Full name"
            autoComplete="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </label>
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
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </label>

        <button type="submit" className="btn-primary w-full py-3.5 rounded-xl text-base mt-4">
          Sign Up
        </button>
      </form>

      <p className="text-center text-gray-600 mt-10">
        Already have an account?{' '}
        <Link to="/login" className="auth-link inline-flex items-center gap-1 text-sm">
          Log In <ArrowRightIcon />
        </Link>
      </p>
    </div>
  );
};

export default Register;
