import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const savedAdmin = localStorage.getItem('admin');
    
    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (e) {
        console.error('Failed to parse saved admin:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/admin/login', {
        username,
        password,
      });

      if (response.code === 200) {
        const { token, admin } = response.data;
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin', JSON.stringify(admin));
        setAdmin(admin);
        return { success: true };
      } else {
        return { success: false, message: response.msg };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.msg || '登录失败，请稍后重试' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  const updateAdmin = (newAdmin) => {
    setAdmin(newAdmin);
    localStorage.setItem('admin', JSON.stringify(newAdmin));
  };

  const value = {
    admin,
    login,
    logout,
    updateAdmin,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};