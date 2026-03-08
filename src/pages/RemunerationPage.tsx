import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, Users, Search, Clock, CheckCircle, Download, Plus, Calendar
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';

export function RemunerationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('hours');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    employee_id: '', work_date: new Date().toISOString().split('T')[0],
    start_time: '08:00', end_time: '17:00', total_hours: 8, notes: ''
  });

  // Données réelles
  const { data: employees } = useSupabaseQuery('employees', {
    select: '*', orderBy: { column: 'created_at', ascending: false }
  });
  const { data: profiles } = useSupabaseQuery('profiles', { select: '*' });
  const { data: workHours, refetch: refetchHours } = useSupabaseQuery('work_hours', {
    select: '*', orderBy: { column: 'work_date', ascending: false }, limit: 200
  });

  const { create: createWorkHour } = useSupabaseMutation('work_hours');

  const canManage = ['owner', 'manager'].includes(user?.role || '');

  // Helper: get employee display name
  const getEmployeeName = (empId: string) => {
    const emp = employees?.find((e: any) => e.id === empId);
    if (!emp) return 'Employé inconnu';
    const profile = profiles?.find((p: any) => p.user_id === emp.profile_id);
    if (profile) return `${profile.first_name} ${profile.last_name}`;
    return emp.employee_number || emp.id.slice(0, 8);
  };

  // Stats
  const totalHours = workHours?.reduce((s: number, w: any) => s + Number(w.total_hours || 0), 0) || 0;
  const activeEmployees = employees?.filter((e: any) => e.is_active).length || 0;
  const totalCost = useMemo(() => {
    if (!workHours || !employees) return 0;
    return workHours.reduce((sum: number, w: any) => {
      const emp = employees.find((e: any) => e.id === w.employee_id);
      const rate = Number(emp?.hourly_rate || 0);
      return sum + (Number(w.total_hours || 0) * rate);
    }, 0);
  }, [workHours, employees]);

  const filteredHours = useMemo(() => {
    if (!workHours) return [];
    return workHours.filter((w: any) => {
      const name = getEmployeeName(w.employee_id).toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });
  }, [workHours, searchTerm, employees, profiles]);

  const handleAddWorkHour = async () => {
    if (!newEntry.employee_id) {
      toast({ title: "Erreur", description: "Sélectionnez un employé.", variant: "destructive" });
      return;
    }
    try {
      await createWorkHour({
        employee_id: newEntry.employee_id,
        work_date: newEntry.work_date,
        start_time: newEntry.start_time,
        end_time: newEntry.end_time,
        total_hours: newEntry.total_hours,
        notes: newEntry.notes || null,
      });
      toast({ title: "Heures ajoutées", description: "Les heures de travail ont été enregistrées." });
      setShowAddDialog(false);
      setNewEntry({ employee_id: '', work_date: new Date().toISOString().split('T')[0], start_time: '08:00', end_time: '17:00', total_hours: 8, notes: '' });
      refetchHours();
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les heures.", variant: "destructive" });
    }
  };

  if (!canManage) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">Seuls les propriétaires et gérants peuvent gérer les rémunérations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Rémunérations</h1>
          <p className="text-muted-foreground">Suivi des heures et calcul de paie</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Saisir des heures
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Employés actifs</p>
                <p className="text-2xl font-bold">{activeEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total heures</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Coût total estimé</p>
                <p className="text-2xl font-bold">{formatFCFA(totalCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Entrées ce mois</p>
                <p className="text-2xl font-bold">{workHours?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hours">Heures de travail</TabsTrigger>
          <TabsTrigger value="employees">Taux horaires</TabsTrigger>
        </TabsList>

        <TabsContent value="hours" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un employé..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>Heures de travail</CardTitle></CardHeader>
            <CardContent>
              {!filteredHours.length ? (
                <p className="text-center text-muted-foreground py-8">Aucune heure enregistrée.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Début</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Heures</TableHead>
                      <TableHead>Coût</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHours.map((w: any) => {
                      const emp = employees?.find((e: any) => e.id === w.employee_id);
                      const cost = Number(w.total_hours || 0) * Number(emp?.hourly_rate || 0);
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="font-medium">{getEmployeeName(w.employee_id)}</TableCell>
                          <TableCell>{new Date(w.work_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>{w.start_time || '-'}</TableCell>
                          <TableCell>{w.end_time || '-'}</TableCell>
                          <TableCell><Badge variant="outline">{Number(w.total_hours || 0).toFixed(1)}h</Badge></TableCell>
                          <TableCell>{formatFCFA(cost)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{w.notes || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Employés et taux horaires</CardTitle></CardHeader>
            <CardContent>
              {!employees?.length ? (
                <p className="text-center text-muted-foreground py-8">Aucun employé. Ajoutez-en dans le module RH.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>N° Employé</TableHead>
                      <TableHead>Taux horaire</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date embauche</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp: any) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{getEmployeeName(emp.id)}</TableCell>
                        <TableCell>{emp.employee_number || '-'}</TableCell>
                        <TableCell>{formatFCFA(Number(emp.hourly_rate || 0))}/h</TableCell>
                        <TableCell>
                          <Badge variant={emp.is_active ? 'default' : 'secondary'}>
                            {emp.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog ajout heures */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Saisir des heures de travail</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employé</Label>
              <Select value={newEntry.employee_id} onValueChange={v => setNewEntry({ ...newEntry, employee_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {employees?.filter((e: any) => e.is_active).map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>{getEmployeeName(e.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={newEntry.work_date} onChange={e => setNewEntry({ ...newEntry, work_date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Heure début</Label>
                <Input type="time" value={newEntry.start_time} onChange={e => setNewEntry({ ...newEntry, start_time: e.target.value })} />
              </div>
              <div>
                <Label>Heure fin</Label>
                <Input type="time" value={newEntry.end_time} onChange={e => setNewEntry({ ...newEntry, end_time: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Total heures</Label>
              <Input type="number" step="0.5" value={newEntry.total_hours} onChange={e => setNewEntry({ ...newEntry, total_hours: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} placeholder="Notes optionnelles..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddWorkHour}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RemunerationPage;
