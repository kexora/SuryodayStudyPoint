/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './common/components/ui/Header';
import { Footer } from './common/components/ui/Footer';
import { ScrollToTop } from './common/components/ui/ScrollToTop';
import { FloatingQuickLinks } from './common/components/ui/FloatingQuickLinks';
import { AdmissionOpenPopup } from './common/components/AdmissionOpenPopup';
import { Home } from './common/pages/Home';
import { About } from './common/pages/About';
import { Academics } from './common/pages/Academics';
import { Facilities } from './common/pages/Facilities';
import { Admissions } from './common/pages/Admissions';
import { Gallery } from './common/pages/Gallery';
import { NoticesPage } from './common/pages/NoticesPage';
import { Login } from './common/pages/Login';
import { Contact } from './common/pages/Contact';
import { Unauthorized } from './common/pages/Unauthorized';
import { Dashboard } from './common/pages/Dashboard';
import { AdmissionProvider } from './context/AdmissionContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProtectedRoute } from './common/components/ui/ProtectedRoute';

import { AdminLayout } from './admin/pages/AdminLayout';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminApplications } from './admin/pages/AdminApplications';
import { AdminCampaignsPage } from './admin/pages/AdminCampaignsPage';
import { AdminSettingsPage } from './admin/pages/AdminSettingsPage';
import { AdminTechnicalSettingsPage } from './admin/pages/AdminTechnicalSettingsPage';
import { AdminGalleryPage } from './admin/pages/AdminGalleryPage';
import { AdminNoticesPage } from './admin/pages/AdminNoticesPage';
import { AdminHeroBannersPage } from './admin/pages/AdminHeroBannersPage';
import { AdminCommunicationPage } from './admin/pages/AdminCommunicationPage';
import { AdminUserManagement } from './admin/pages/AdminUserManagement';
import { AdminLetterManagementPage } from './admin/pages/AdminLetterManagementPage';
import { AdminAlertsPage } from './admin/pages/AdminAlertsPage';
import { AdminCoursesPage } from './admin/pages/AdminCoursesPage';



import { LanguageProvider } from './context/LanguageContext';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <FloatingQuickLinks />
      <AdmissionOpenPopup />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AdmissionProvider>
          <LanguageProvider>
            <Router>
              <Layout>
                <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['__kx_0x5', '__kx_0x4', '__kx_0x3', '__kx_0x2', '__kx_0x1']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['__kx_0x2', '__kx_0x1']}>
                  <AdminLayout />
                </ProtectedRoute>
              } 
            >
              <Route index element={<AdminDashboard />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="campaigns" element={<ProtectedRoute allowedRoles={['__kx_0x1']}><AdminCampaignsPage /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['__kx_0x1']}><AdminSettingsPage /></ProtectedRoute>} />
              <Route path="technical-settings" element={<ProtectedRoute allowedRoles={['__kx_0x1']}><AdminTechnicalSettingsPage /></ProtectedRoute>} />
              <Route path="communication" element={<ProtectedRoute allowedRoles={['__kx_0x1']}><AdminCommunicationPage /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute allowedRoles={['__kx_0x1']}><AdminUserManagement /></ProtectedRoute>} />
              <Route path="letters" element={<ProtectedRoute allowedRoles={['__kx_0x1', '__kx_0x2']}><AdminLetterManagementPage /></ProtectedRoute>} />
              <Route path="alerts" element={<ProtectedRoute allowedRoles={['__kx_0x1', '__kx_0x2']}><AdminAlertsPage /></ProtectedRoute>} />
              <Route path="gallery" element={<AdminGalleryPage />} />
              <Route path="notices" element={<AdminNoticesPage />} />
              <Route path="hero-banners" element={<AdminHeroBannersPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
            </Route>
            <Route path="*" element={<div className="p-20 text-center font-bold text-2xl text-crhs-navy">404 - Page Not Found</div>} />
          </Routes>
        </Layout>
      </Router>
      </LanguageProvider>
      </AdmissionProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
