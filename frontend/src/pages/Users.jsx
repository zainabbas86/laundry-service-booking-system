import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { ROLE_LIST, ROLES, roleLabel } from '../constants/roles';

const EMPTY_FORM = { name: '', email: '', role: ROLES.CUSTOMER, password: '' };

const apiMessage = (error, fallback) => error.response?.data?.message || fallback;

const Users = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError(apiMessage(err, 'Could not load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (user) => {
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setEditingId(user.id);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (!editingId && !form.password) {
      setError('A password is required for a new user.');
      return;
    }

    const body = { name: form.name.trim(), email: form.email.trim(), role: form.role };
    if (form.password) body.password = form.password;

    setSaving(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/api/users/${editingId}`, body);
        setSuccess(`${body.name} updated.`);
      } else {
        await axiosInstance.post('/api/users', body);
        setSuccess(`${body.name} added.`);
      }
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(apiMessage(err, 'Could not save the user.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setError('');
    setSuccess('');
    try {
      await axiosInstance.delete(`/api/users/${user.id}`);
      setSuccess(`${user.name} deleted.`);
      if (editingId === user.id) resetForm();
      await loadUsers();
    } catch (err) {
      setError(apiMessage(err, 'Could not delete the user.'));
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <main className="page">
      <h1 className="page-title">Users</h1>
      <p className="page-lead">Add, edit and remove accounts, and reset passwords.</p>

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

      <form onSubmit={handleSubmit} className="card mb-5 grid gap-4 sm:grid-cols-2" noValidate>
        <h2 className="text-lg font-semibold sm:col-span-2">{editingId ? 'Edit user' : 'Add user'}</h2>
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" type="text" className="input" {...field('name')} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" className="input" {...field('email')} />
        </div>
        <div>
          <label htmlFor="role" className="label">Role</label>
          <select id="role" className="input" {...field('role')}>
            {ROLE_LIST.map((role) => (
              <option key={role} value={role}>{roleLabel(role)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="password" className="label">{editingId ? 'New password' : 'Password'}</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={editingId ? 'Leave blank to keep the current password' : ''}
            className="input"
            {...field('password')}
          />
        </div>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add user'}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      <section className="card overflow-x-auto">
        {loading ? (
          <p className="text-sm text-gray-600">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-600">No users yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">Email</th>
                <th className="py-2 pr-4 font-semibold">Role</th>
                <th className="py-2 font-semibold"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 pr-4">{user.name}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{user.email}</td>
                  <td className="py-2.5 pr-4">{roleLabel(user.role)}</td>
                  <td className="py-2.5 text-right whitespace-nowrap">
                    <button type="button" className="text-blue-600 hover:underline mr-4" onClick={() => startEdit(user)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline disabled:text-gray-300 disabled:no-underline"
                      onClick={() => handleDelete(user)}
                      disabled={user.id === me?.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
};

export default Users;
