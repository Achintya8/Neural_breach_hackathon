import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import Dashboard from './components/Dashboard/Dashboard';
import UploadResource from './components/Resources/UploadResource';
import ResourceDetail from './components/Resources/ResourceDetail';
import Profile from './components/Profile/Profile';
import CollectionList from './components/Collections/CollectionList';
import CollectionDetail from './components/Collections/CollectionDetail';
import PrivateRoute from './components/Routing/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-stone-50 bg-linear-to-br from-amber-50 via-orange-50 to-stone-100 pt-16">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><UploadResource /></PrivateRoute>} />
          <Route path="/resource/:id" element={<PrivateRoute><ResourceDetail /></PrivateRoute>} />
          <Route path="/resources/:id" element={<PrivateRoute><ResourceDetail /></PrivateRoute>} />
          <Route path="/collections" element={<PrivateRoute><CollectionList /></PrivateRoute>} />
          <Route path="/collections/:id" element={<PrivateRoute><CollectionDetail /></PrivateRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<div className="text-stone-900 text-center mt-20">404 - Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
