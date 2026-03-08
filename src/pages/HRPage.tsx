import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/use-employees';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Plus, Download, DollarSign, Eye, Edit, Trash2, Calendar, Clock, 
  TrendingUp, UserCheck, FileText, Search
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function HRPage() {
  const { user } = useAuth();
  const { employees, isLoadingEmployees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('employees');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employee_number: '',
    hire_date: '',
    hourly_rate: 0,
  });

  const activeEmployees = employees?.filter((e: any) => e.is_active) || [];
  const totalPayroll = activeEmployees.reduce((sum: number, e: any) => sum + (e.hourly_rate || 0) * 160, 0); // ~160h/mois

  const filteredEmployees = activeEmployees.filter((e: any) => {
    const name = `${e.profiles?.first_name || ''} ${e.profiles?.last_name || ''} ${e.employee_number || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const handleCreate = async () => {
    if (!newEmployee.employee_number) {
      toast({ title: 'Erreur', description: 'Numéro employé requis.', variant: 'destructive' });
      return;
    }
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Non authentifié');

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', authUser.id)
        .single();

      if (!profile) throw new Error('Profil non trouvé');

      const { error } = await supabase.from('employees').insert({
        company_id: profile.company_id,
        employee_number: newEmployee.employee_number,
        hire_date: newEmployee.hire_date || null,
        hourly_rate: newEmployee.hourly_rate,
        created_by: authUser.id,
      });

      if (error) throw error;

      toast({ title: 'Employé créé', description: 'L\'employé a été ajouté avec succès.' });
      setCreateDialogOpen(false);
      setNewEmployee({ employee_number: '', hire_date: '', hourly_rate: 0 });
      // Refetch would happen via the hook
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const exportEmployees = () => {
    const BOM = '\uFEFF';
    const csv = BOM + [
      ['N° Employé', 'Prénom', 'Nom', 'Email', 'Date embauche', 'Taux horaire', 'Actif'].join(','),
      ...activeEmployees.map((e: any) => [
        e.employee_number || '',
        e.profiles?.first_name || '',
        e.profiles?.last_name || '',
        e.profiles?.email || '',
        e.hire_date || '',
        e.hourly_rate || 0,
        e.is_active ? 'Oui' : 'Non',
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export terminé' });
  };

  if (isLoadingEmployees) {
    return <div className="flex items-center justify-center h-64"><p>Chargement...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Ressources Humaines</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportEmployees}>
            <Download className="h-4 w-4 mr-2" /> Exporter
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Nouvel employé</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Ajouter un employé</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>N° Employé *</Label><Input value={newEmployee.employee_number} onChange={e => setNewEmployee(p => ({ ...p, employee_number: e.target.value }))} placeholder="EMP-001" /></div>
                <div><Label>Date d'embauche</Label><Input type="date" value={newEmployee.hire_date} onChange={e => setNewEmployee(p => ({ ...p, hire_date: e.target.value }))} /></div>
                <div><Label>Taux horaire (FCFA)</Label><Input type="number" min={0} value={newEmployee.hourly_rate} onChange={e => setNewEmployee(p => ({ ...p, hourly_rate: Number(e.target.value) }))} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleCreate}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Employés actifs</p><p className="text-2xl font-bold">{activeEmployees.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Masse salariale est.</p><p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(totalPayroll)} FCFA</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Taux moyen</p><p className="text-2xl font-bold">{activeEmployees.length > 0 ? Math.round(activeEmployees.reduce((s: number, e: any) => s + (e.hourly_rate || 0), 0) / activeEmployees.length) : 0} FCFA/h</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total employés</p><p className="text-2xl font-bold">{employees?.length || 0}</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees"><Users className="h-4 w-4 mr-2" /> Employés</TabsTrigger>
          <TabsTrigger value="payroll"><DollarSign className="h-4 w-4 mr-2" /> Paie</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un employé..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Liste des employés</CardTitle><CardDescription>{filteredEmployees.length} employé(s)</CardDescription></CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8"><Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucun employé trouvé</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Employé</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Embauche</TableHead>
                      <TableHead>Taux horaire</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((emp: any) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-mono">{emp.employee_number || '-'}</TableCell>
                        <TableCell>{emp.profiles?.first_name || ''} {emp.profiles?.last_name || ''}</TableCell>
                        <TableCell>{emp.profiles?.email || '-'}</TableCell>
                        <TableCell>{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                        <TableCell>{emp.hourly_rate ? `${emp.hourly_rate} FCFA/h` : '-'}</TableCell>
                        <TableCell><Badge variant={emp.is_active ? 'default' : 'secondary'}>{emp.is_active ? 'Actif' : 'Inactif'}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Simulation de paie mensuelle</CardTitle><CardDescription>Basée sur 160h/mois par employé</CardDescription></CardHeader>
            <CardContent>
              {activeEmployees.length === 0 ? (
                <div className="text-center py-8"><DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucun employé pour la simulation</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Taux horaire</TableHead>
                      <TableHead>Heures/mois</TableHead>
                      <TableHead>Salaire brut est.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeEmployees.map((emp: any) => (
                      <TableRow key={emp.id}>
                        <TableCell>{emp.profiles?.first_name || ''} {emp.profiles?.last_name || emp.employee_number || '-'}</TableCell>
                        <TableCell>{emp.hourly_rate || 0} FCFA</TableCell>
                        <TableCell>160h</TableCell>
                        <TableCell className="font-bold">{new Intl.NumberFormat('fr-FR').format((emp.hourly_rate || 0) * 160)} FCFA</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold border-t-2">
                      <TableCell colSpan={3}>Total masse salariale estimée</TableCell>
                      <TableCell>{new Intl.NumberFormat('fr-FR').format(totalPayroll)} FCFA</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default HRPage;
