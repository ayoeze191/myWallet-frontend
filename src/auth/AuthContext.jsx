import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAuthToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('wallet_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('wallet_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const persist = useCallback((newToken, newUser) => {
    localStorage.setItem('wallet_token', newToken);
    localStorage.setItem('wallet_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const register = useCallback(
    async (name, email, password) => {
      const data = await api.register(name, email, password);
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const login = useCallback(
    async (email, password) => {
      const data = await api.login(email, password);
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
