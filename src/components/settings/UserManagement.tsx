import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, UserPlus, Shield, ShieldAlert, Mail } from 'lucide-react';
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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', firstName: '', lastName: '', role: 'tailor' });
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
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, is_active, created_at')
        .eq('company_id', user!.companyId);

      if (pErr) throw pErr;

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

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }

    if (isDemo) {
      toast({ title: 'Mode démo', description: 'Invitation non disponible en mode démo.' });
      return;
    }

    setInviting(true);
    try {
      // Create a new user via signUp (they'll get a confirmation email)
      const tempPassword = crypto.randomUUID().slice(0, 16) + 'A1!';
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: inviteForm.email,
        password: tempPassword,
        options: {
          data: {
            company_name: '', // Won't create a new company since we'll override
            first_name: inviteForm.firstName,
            last_name: inviteForm.lastName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Wait a moment for the trigger to create profile + company
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update the user's profile to point to THIS company
        await supabase
          .from('profiles')
          .update({ company_id: user!.companyId })
          .eq('user_id', signUpData.user.id);

        // Update their role to the selected one
        await supabase
          .from('user_roles')
          .update({ 
            company_id: user!.companyId,
            role: inviteForm.role as any 
          })
          .eq('user_id', signUpData.user.id);
      }

      toast({ 
        title: 'Invitation envoyée', 
        description: `Un email de confirmation a été envoyé à ${inviteForm.email}. L'utilisateur devra confirmer son email puis se connecter.` 
      });

      setInviteOpen(false);
      setInviteForm({ email: '', firstName: '', lastName: '', role: 'tailor' });
      loadUsers();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setInviting(false);
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
                ? 'Consultez, modifiez les rôles et invitez des membres'
                : 'Consultez les membres de votre entreprise'}
            </CardDescription>
          </div>
          {isOwner && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inviter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Inviter un utilisateur
                  </DialogTitle>
                  <DialogDescription>
                    L'utilisateur recevra un email pour confirmer son compte et pourra ensuite se connecter.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prénom *</Label>
                      <Input
                        value={inviteForm.firstName}
                        onChange={e => setInviteForm(f => ({ ...f, firstName: e.target.value }))}
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <Label>Nom *</Label>
                      <Input
                        value={inviteForm.lastName}
                        onChange={e => setInviteForm(f => ({ ...f, lastName: e.target.value }))}
                        placeholder="Nom"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={inviteForm.email}
                      onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <div>
                    <Label>Rôle</Label>
                    <Select value={inviteForm.role} onValueChange={val => setInviteForm(f => ({ ...f, role: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'owner').map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>Annuler</Button>
                  <Button onClick={handleInvite} disabled={inviting}>
                    {inviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Envoyer l'invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
