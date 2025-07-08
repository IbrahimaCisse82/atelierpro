import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AccessControlProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AccessControl({ allowedRoles, children, fallback }: AccessControlProps) {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600 font-semibold mt-10">
          Accès refusé : vous n'avez pas les droits pour accéder à ce module.
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
