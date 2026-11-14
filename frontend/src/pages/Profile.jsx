import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user } = useAuth(); // The token is added by the axios interceptor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch profile data from the backend
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile');
        setFormData({
          name: response.data.name,
          email: response.data.email,
          university: response.data.university || '',
          address: response.data.address || '',
        });
      } catch (error) {
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page text-center text-gray-600">Loading...</div>;
  }

  return (
    <main className="page max-w-lg">
      <h1 className="page-title">Your profile</h1>
      <p className="page-lead">Keep your details up to date so drivers can find you.</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="university" className="label">University</label>
          <input
            id="university"
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="address" className="label">Address</label>
          <input
            id="address"
            type="text"
            placeholder="Pickup address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          {loading ? 'Updating...' : 'Update profile'}
        </button>
      </form>
    </main>
  );
};

export default Profile;
