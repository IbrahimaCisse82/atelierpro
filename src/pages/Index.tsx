import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardContent />;
};

export default Index;
