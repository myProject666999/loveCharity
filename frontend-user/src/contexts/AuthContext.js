import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/user/login', {
        username,
        password,
      });

      if (response.code === 200) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
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

  const register = async (username, password, email, phone) => {
    try {
      const response = await api.post('/api/user/register', {
        username,
        password,
        email,
        phone,
      });

      if (response.code === 200) {
        return { success: true };
      } else {
        return { success: false, message: response.msg };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.msg || '注册失败，请稍后重试' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
