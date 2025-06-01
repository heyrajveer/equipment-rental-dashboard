import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { EquipmentProvider } from './contexts/EquipmentContext';
import { RentalProvider } from './contexts/RentalContext';
import { MaintenanceProvider } from './contexts/MaintenanceContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/Authentication/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import RentalsPage from './pages/RentalsPage';
import RentalCalendarPage from './pages/RentalCalendarPage';
import MaintenancePage from './pages/MaintenancePage';
import NotFoundPage from './pages/NotFoundPage';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <EquipmentProvider>
            <RentalProvider>
              <MaintenanceProvider>
                <Toaster position="top-right" />
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/equipment" 
                    element={
                      <ProtectedRoute>
                        <EquipmentPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/equipment/:id" 
                    element={
                      <ProtectedRoute>
                        <EquipmentDetailPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/rentals" 
                    element={
                      <ProtectedRoute>
                        <RentalsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/calendar" 
                    element={
                      <ProtectedRoute>
                        <RentalCalendarPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/maintenance" 
                    element={
                      <ProtectedRoute>
                        <MaintenancePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/" element={<Navigate to="/login\" replace />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </MaintenanceProvider>
            </RentalProvider>
          </EquipmentProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;