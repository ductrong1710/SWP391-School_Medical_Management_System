import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import './assets/styles/global.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './context/AuthContext';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HealthRecord from './pages/HealthRecord';
import HealthCheckManagement from './pages/HealthCheckManagement';
import VaccinationManagement from './pages/VaccinationManagement';
import SendMedicine from './pages/SendMedicine';
import RecordProcess from './pages/RecordProcess';
import DocumentsBlog from './pages/DocumentsBlog';
import Notifications from './pages/Notifications';
import VaccinationPlanStudents from './pages/VaccinationPlanStudents';
import VaccinationPlanRecord from './pages/VaccinationPlanRecord';
import MedicalHistory from './pages/MedicalHistory';
import MedicalIncidentManagement from './pages/MedicalIncidentManagement';
import MedicalIncidentHistory from './pages/MedicalIncidentHistory';

function App() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Define routes where Sidebar should be shown
  const sidebarRoutes = [
    '/dashboard',
    '/health-declaration',
    '/health-record',
    '/health-check-management',
    '/vaccination-management',
    '/send-medicine',
    '/record-process',
    '/documents-blog',
    '/notifications',
    '/medical-history',
    '/medical-incident-management',
    '/medical-incident-history'
  ];
  
  // Define routes where Navbar and Footer should be hidden
  // All routes with sidebar plus login/register should hide navbar
  const noNavbarRoutes = ['/login', '/register', ...sidebarRoutes, '/vaccination-plan/record', '/vaccination-plan/'];
  
  // Ẩn navbar cho các route động như /vaccination-plan/:id/record
  const showNavbar = !noNavbarRoutes.some(route => location.pathname === route || location.pathname.startsWith('/vaccination-plan/') && (location.pathname.endsWith('/record') || location.pathname.includes('/record')));
  const showSidebar = sidebarRoutes.includes(location.pathname);
  
  // Handle sidebar toggle from Sidebar component
  const handleSidebarToggle = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };
    return (
    <AuthProvider>
      <div className="App">
        {showNavbar && <Navbar />}        <div className={`app-container ${showSidebar ? 'with-sidebar' : ''}`}>
          {showSidebar && <Sidebar onSidebarToggle={handleSidebarToggle} />}
          <main className={`content-container${!showNavbar ? ' full-height' : ''}`}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              {/* <Route path="/register" element={<Register />} /> */}
              
              {/* Các route có sidebar */}
              <Route path="/dashboard" element={
                <div className="page-wrapper">
                  <Dashboard />
                </div>
              } />
              <Route path="/health-declaration" element={
                <div className="page-wrapper">
                  <HealthRecord />
                </div>
              } />
              <Route path="/health-record" element={
                <div className="page-wrapper">
                  <HealthRecord />
                </div>
              } />
              <Route path="/health-check-management" element={
                <div className="page-wrapper">
                  <HealthCheckManagement />
                </div>
              } />
              <Route path="/vaccination-management" element={
                <div className="page-wrapper">
                  <VaccinationManagement />
                </div>
              } />
              <Route path="/send-medicine" element={
                <div className="page-wrapper">
                  <SendMedicine />
                </div>
              } />
              <Route path="/record-process" element={
                <div className="page-wrapper">
                  <RecordProcess />
                </div>
              } />
              <Route path="/documents-blog" element={
                <div className="page-wrapper">
                  <DocumentsBlog />
                </div>
              } />
              <Route path="/notifications" element={
                <div className="page-wrapper">
                  <Notifications />
                </div>
              } />
              <Route path="/vaccination-plan/:id/students" element={<VaccinationPlanStudents />} />
              <Route path="/vaccination-plan/:id/record" element={<VaccinationPlanRecord />} />
              <Route path="/medical-history" element={
                <div className="page-wrapper">
                  <MedicalHistory />
                </div>
              } />
              <Route path="/medical-incident-management" element={<div className="page-wrapper"><MedicalIncidentManagement /></div>} />
              <Route path="/medical-incident-history" element={<div className="page-wrapper"><MedicalIncidentHistory /></div>} />
            </Routes>
          </main>
        </div>
        {showNavbar && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
