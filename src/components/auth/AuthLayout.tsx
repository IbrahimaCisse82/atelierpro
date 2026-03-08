import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import { Login } from './Login';
import { CompanyRegistration } from './CompanyRegistration';

export function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    location.pathname === '/register' ? 'register' : 'login'
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return authMode === 'login' ? (
    <Login onSwitchToRegister={() => setAuthMode('register')} />
  ) : (
    <CompanyRegistration onSwitchToLogin={() => setAuthMode('login')} />
  );
}