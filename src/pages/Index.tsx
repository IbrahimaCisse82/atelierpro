import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  // Si pas connecté, afficher la page d'authentification
  if (!user) {
    return <AuthLayout />;
  }

  // Si connecté, rediriger vers le dashboard
  // (cette page ne devrait jamais s'afficher pour un utilisateur connecté)
  return null;
};

export default Index;
