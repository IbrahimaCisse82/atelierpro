import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserPlus, Shield, ShieldAlert } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CompanyUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  manager: 'Manager',
  tailor: 'Tailleur',
  orders: 'Commandes',
  stocks: 'Stocks',
  customer_service: 'Service Client',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-destructive/10 text-destructive',
  manager: 'bg-primary/10 text-primary',
  tailor: 'bg-accent/10 text-accent-foreground',
  orders: 'bg-muted text-muted-foreground',
  stocks: 'bg-muted text-muted-foreground',
  customer_service: 'bg-muted text-muted-foreground',
};

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const isDemo = user ? isDemoMode(user.id) : false;
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    if (!user || isDemo) {
      setLoading(false);
      if (isDemo) {
        setUsers([
          { userId: 'demo-user-id', email: 'demo@atelierpro.app', firstName: 'Utilisateur', lastName: 'Démo', role: 'owner', isActive: true, createdAt: new Date().toISOString() },
          { userId: 'demo-tailor-1', email: 'tailleur@atelierpro.app', firstName: 'Moussa', lastName: 'Diop', role: 'tailor', isActive: true, createdAt: new Date().toISOString() },
        ]);
      }
      return;
    }

    loadUsers();
  }, [user, isDemo]);

  const loadUsers = async () => {
    try {
      // Get all profiles for this company
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, is_active, created_at')
        .eq('company_id', user!.companyId);

      if (pErr) throw pErr;

      // Get all roles for this company
      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('company_id', user!.companyId);

      if (rErr) throw rErr;

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      setUsers(
        (profiles || []).map(p => ({
          userId: p.user_id,
          email: p.email,
          firstName: p.first_name,
          lastName: p.last_name,
          role: (roleMap.get(p.user_id) as string) || 'tailor',
          isActive: p.is_active,
          createdAt: p.created_at,
        }))
      );
    } catch (err: any) {
      console.error('Error loading users:', err);
      toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (isDemo) {
      toast({ title: 'Mode démo', description: 'Les modifications ne sont pas sauvegardées.' });
      return;
    }
    if (targetUserId === user?.id) {
      toast({ title: 'Interdit', description: 'Vous ne pouvez pas changer votre propre rôle.', variant: 'destructive' });
      return;
    }

    setUpdatingUserId(targetUserId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', targetUserId)
        .eq('company_id', user!.companyId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.userId === targetUserId ? { ...u, role: newRole } : u));
      toast({ title: 'Succès', description: 'Rôle mis à jour.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Gestion des utilisateurs
            </CardTitle>
            <CardDescription>
              {isOwner
                ? 'Consultez et modifiez les rôles des membres de votre entreprise'
                : 'Consultez les membres de votre entreprise'}
            </CardDescription>
          </div>
          {isOwner && (
            <Button variant="outline" size="sm" disabled>
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter (bientôt)
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Aucun utilisateur trouvé.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.userId}>
                  <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {isOwner && u.userId !== user?.id ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={u.role}
                          onValueChange={(val) => handleRoleChange(u.userId, val)}
                          disabled={updatingUserId === u.userId}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'owner').map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {updatingUserId === u.userId && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                    ) : (
                      <Badge variant="outline" className={ROLE_COLORS[u.role] || ''}>
                        {u.role === 'owner' && <ShieldAlert className="h-3 w-3 mr-1" />}
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? 'default' : 'secondary'}>
                      {u.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
