import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MaterialInPage from './pages/MaterialInPage';
import MaterialOutPage from './pages/MaterialOutPage';
import InventoryPage from './pages/InventoryPage';
import HistoryPage from './pages/HistoryPage';
import ReportPage from './pages/ReportPage';
import VendorsPage from './pages/VendorsPage';
import PurchaseOrderPage from './pages/PurchaseOrderPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-base)]">
      <div className="animate-spin w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="material-in" element={<MaterialInPage />} />
        <Route path="material-out" element={<MaterialOutPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="purchase-orders" element={<PurchaseOrderPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="report" element={<ReportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a2236',
              color: '#f1f5f9',
              border: '1px solid #243156',
              borderRadius: '12px',
              fontSize: '13px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
