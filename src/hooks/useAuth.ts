import { useState, useEffect } from 'react';
import { isAuthenticated, login, logout } from '../services/auth';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  return {
    authenticated,
    login: handleLogin,
    logout: handleLogout
  };
}
