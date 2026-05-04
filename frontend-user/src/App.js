import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import Forums from './pages/Forums';
import ForumDetail from './pages/ForumDetail';
import Notices from './pages/Notices';
import NoticeDetail from './pages/NoticeDetail';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import MyApplies from './pages/MyApplies';
import Messages from './pages/Messages';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/news" element={
            <Layout>
              <News />
            </Layout>
          } />
          <Route path="/news/:id" element={
            <Layout>
              <NewsDetail />
            </Layout>
          } />
          <Route path="/activities" element={
            <Layout>
              <Activities />
            </Layout>
          } />
          <Route path="/activities/:id" element={
            <Layout>
              <ActivityDetail />
            </Layout>
          } />
          <Route path="/forums" element={
            <Layout>
              <Forums />
            </Layout>
          } />
          <Route path="/forums/:id" element={
            <Layout>
              <ForumDetail />
            </Layout>
          } />
          <Route path="/notices" element={
            <Layout>
              <Notices />
            </Layout>
          } />
          <Route path="/notices/:id" element={
            <Layout>
              <NoticeDetail />
            </Layout>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <Layout>
                <Favorites />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/my-applies" element={
            <ProtectedRoute>
              <Layout>
                <MyApplies />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Layout>
                <Messages />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
