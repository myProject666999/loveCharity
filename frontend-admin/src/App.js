import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminLayout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Admins from './pages/Admins';
import Categories from './pages/Categories';
import News from './pages/News';
import Notices from './pages/Notices';
import Banners from './pages/Banners';
import Activities from './pages/Activities';
import Applies from './pages/Applies';
import Forums from './pages/Forums';
import Messages from './pages/Messages';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/login" />;
};

const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return !token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <AdminLayout>
                <Users />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admins" element={
            <ProtectedRoute>
              <AdminLayout>
                <Admins />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute>
              <AdminLayout>
                <Categories />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/news" element={
            <ProtectedRoute>
              <AdminLayout>
                <News />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/notices" element={
            <ProtectedRoute>
              <AdminLayout>
                <Notices />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/banners" element={
            <ProtectedRoute>
              <AdminLayout>
                <Banners />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/activities" element={
            <ProtectedRoute>
              <AdminLayout>
                <Activities />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/applies" element={
            <ProtectedRoute>
              <AdminLayout>
                <Applies />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/forums" element={
            <ProtectedRoute>
              <AdminLayout>
                <Forums />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <AdminLayout>
                <Messages />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AdminLayout>
                <Profile />
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;