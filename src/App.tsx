import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d6a4f]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard tab="inicio" />} />
      <Route path="/reservas" element={<Dashboard tab="reservas" />} />
      <Route path="/solicitacoes" element={<Dashboard tab="solicitacoes" />} />
      <Route path="/votacoes" element={<Dashboard tab="votacoes" />} />
      <Route path="/documentos" element={<Dashboard tab="documentos" />} />
      <Route path="/sindico" element={<Dashboard tab="sindico" />} />
      <Route path="/cadastro" element={<Dashboard tab="cadastro" />} />
      <Route path="/hospedagem" element={<Dashboard tab="hospedagem" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
