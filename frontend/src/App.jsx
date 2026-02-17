import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import Dashboard from './components/Dashboard/Dashboard';
import UploadResource from './components/Resources/UploadResource';
import ResourceDetail from './components/Resources/ResourceDetail';
import PrivateRoute from './components/Routing/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-gray-900 via-slate-900 to-black pt-16">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><UploadResource /></PrivateRoute>} />
          <Route path="/resource/:id" element={<PrivateRoute><ResourceDetail /></PrivateRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<div className="text-white text-center mt-20">404 - Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
