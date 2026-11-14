import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// Shared with axiosConfig so the token can be read without a second source of truth.
export const AUTH_STORAGE_KEY = 'lsbs.user';

const readStoredUser = () => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.token) return null;

    return parsed;
  } catch (error) {
    // Anything unreadable in storage must not block the app.
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Read once on load so a refresh keeps the user signed in.
  const [user, setUser] = useState(readStoredUser);

  const login = (userData) => {
    setUser(userData);
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      // Private mode or a full quota: stay signed in for this tab only.
    }
  };

  const logout = () => {
    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      // Nothing to clean up if storage is unavailable.
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
