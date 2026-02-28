import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Users, DollarSign, Calendar, CheckCircle, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PayrollBarChart, PayrollDonutChart } from './PayrollCharts';

// Types employés
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'manager' | 'tailor' | 'orders' | 'stocks' | 'customer_service';
  salary: number;
  hireDate: string;
  isActive: boolean;
}
interface WorkHour {
  id: string;
  workDate: string;
  startTime: string | null;
  endTime: string | null;
  totalHours: number;
  notes: string | null;
}

export function EmployeesTable() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [workHours, setWorkHours] = useState<Record<string, WorkHour[]>>({}); // employeId -> workHours
  const [ca, setCA] = useState(0); // Chiffre d'affaires (factures payées)
  const [unpaid, setUnpaid] = useState(0); // Impayés (factures non payées)
  const [financeLoading, setFinanceLoading] = useState(false);
  const canManage = user?.role === 'owner';

  // Fetch employees from Supabase (with profile join)
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user?.companyId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select(`id, hire_date, hourly_rate, is_active, profile:profiles(id, first_name, last_name, email, role)`) // join profiles
        .eq('company_id', user.companyId);
      setLoading(false);
      if (error) {
        toast({ title: 'Erreur', description: "Impossible de charger les employés.", variant: 'destructive' });
        return;
      }
      const mapped = (data || []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        firstName: (e.profile as Record<string, unknown>)?.first_name as string || '',
        lastName: (e.profile as Record<string, unknown>)?.last_name as string || '',
        email: (e.profile as Record<string, unknown>)?.email as string || '',
        role: ((e.profile as Record<string, unknown>)?.role as string || 'tailor') as 'owner' | 'manager' | 'tailor' | 'orders' | 'stocks' | 'customer_service',
        salary: e.hourly_rate as number,
        hireDate: e.hire_date as string,
        isActive: e.is_active as boolean,
      }));
      setEmployees(mapped);
    };
    fetchEmployees();
  }, [user]);

  // Fetch work hours for all employees
  useEffect(() => {
    const fetchWorkHours = async () => {
      if (!user?.companyId || employees.length === 0) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('work_hours')
        .select('*')
        .eq('company_id', user.companyId)
        .in('employee_id', employees.map(e => e.id));
      setLoading(false);
      if (error) {
        toast({ title: 'Erreur', description: "Impossible de charger le planning.", variant: 'destructive' });
        return;
      }
      const grouped: Record<string, WorkHour[]> = {};
      (data || []).forEach((wh: Record<string, unknown>) => {
        const employeeId = wh.employee_id as string;
        if (!grouped[employeeId]) grouped[employeeId] = [];
        grouped[employeeId].push({
          id: wh.id as string,
          workDate: wh.work_date as string,
          startTime: wh.start_time as string | null,
          endTime: wh.end_time as string | null,
          totalHours: (wh.total_hours as number) || 0,
          notes: wh.notes as string | null,
        });
      });
      setWorkHours(grouped);
    };
    fetchWorkHours();
  }, [user, employees, toast]);

  // Récupération des factures clients pour stats CA/impayés
  useEffect(() => {
    const fetchFinanceStats = async () => {
      if (!user?.companyId) return;
      setFinanceLoading(true);
      const { data, error } = await supabase
        .from('customer_invoices')
        .select('amount, is_paid')
        .eq('company_id', user.companyId);
      setFinanceLoading(false);
      if (error) return;
      let caSum = 0, unpaidSum = 0;
      (data || []).forEach((inv: any) => {
        const amount = inv.total_with_tax as number || 0;
        const isPaid = inv.is_paid as boolean;
        if (isPaid) caSum += amount;
        else unpaidSum += amount;
      });
      setCA(caSum);
      setUnpaid(unpaidSum);
    };
    fetchFinanceStats();
  }, [user, toast]);

  // Calcul du total d'heures et du salaire mensuel pour chaque employé
  function getStats(empId: string) {
    const wh = workHours[empId] || [];
    const totalHours = wh.reduce((sum, w) => sum + (w.totalHours || 0), 0);
    const salary = employees.find(e => e.id === empId)?.salary || 0;
    return {
      totalHours,
      totalPay: totalHours * salary,
    };
  }

  // Ajout/édition employé
  const handleSave = async (emp: Employee) => {
    if (!user?.companyId) return;
    setLoading(true);
    if (editEmployee) {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: emp.firstName,
          last_name: emp.lastName,
          email: emp.email,
        } as any)
        .eq('user_id', editEmployee.id);
      // Update employee
      const { error: empError } = await supabase
        .from('employees')
        .update({
          hire_date: emp.hireDate,
          hourly_rate: emp.salary,
          is_active: emp.isActive,
        })
        .eq('profile_id', editEmployee.id)
        .eq('company_id', user.companyId);
      setLoading(false);
      if (profileError || empError) {
        toast({ title: 'Erreur', description: "Impossible de modifier l'employé.", variant: 'destructive' });
        return;
      }
    } else {
      // Création d'un nouveau profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          first_name: emp.firstName,
          last_name: emp.lastName,
          email: emp.email,
          company_id: user.companyId,
          is_active: true,
          user_id: crypto.randomUUID(),
        } as any)
        .select()
        .single();
      if (profileError || !profile) {
        setLoading(false);
        toast({ title: 'Erreur', description: "Impossible de créer le profil.", variant: 'destructive' });
        return;
      }
      // Création de l'employé
      const { error: empError } = await supabase
        .from('employees')
        .insert({
          company_id: user.companyId,
          profile_id: (profile as any).user_id,
          employee_number: Date.now().toString(),
          hire_date: emp.hireDate,
          hourly_rate: emp.salary,
          is_active: true,
          created_by: user.id,
          updated_by: user.id,
        });
      setLoading(false);
      if (empError) {
        toast({ title: 'Erreur', description: "Impossible de créer l'employé.", variant: 'destructive' });
        return;
      }
    }
    setIsDialogOpen(false);
    setEditEmployee(null);
    // Refresh list
    const { data, error } = await supabase
      .from('employees')
      .select(`id, hire_date, hourly_rate, is_active, profile:profiles(id, first_name, last_name, email, role)`)
      .eq('company_id', user.companyId);
    if (!error) {
      const mapped = (data || []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        firstName: (e.profile as Record<string, unknown>)?.first_name as string || '',
        lastName: (e.profile as Record<string, unknown>)?.last_name as string || '',
        email: (e.profile as Record<string, unknown>)?.email as string || '',
        role: ((e.profile as Record<string, unknown>)?.role as string || 'tailor') as 'owner' | 'manager' | 'tailor' | 'orders' | 'stocks' | 'customer_service',
        salary: e.hourly_rate as number,
        hireDate: e.hire_date as string,
        isActive: e.is_active as boolean,
      }));
      setEmployees(mapped);
    }
  };

  // Suppression employé
  const handleDelete = async (id: string) => {
    if (!user?.companyId) return;
    setLoading(true);
    const { error: empError } = await supabase
      .from('employees')
      .delete()
      .eq('profile_id', id)
      .eq('company_id', user.companyId);
    setLoading(false);
    if (empError) {
      toast({ title: 'Erreur', description: "Impossible de supprimer l'employé.", variant: 'destructive' });
      return;
    }
    // Refresh list
    const { data, error } = await supabase
      .from('employees')
      .select(`id, hire_date, hourly_rate, is_active, profile:profiles(id, first_name, last_name, email, role)`)
      .eq('company_id', user.companyId);
    if (!error) {
      const mapped = (data || []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        firstName: (e.profile as Record<string, unknown>)?.first_name as string || '',
        lastName: (e.profile as Record<string, unknown>)?.last_name as string || '',
        email: (e.profile as Record<string, unknown>)?.email as string || '',
        role: ((e.profile as Record<string, unknown>)?.role as string || 'tailor') as 'owner' | 'manager' | 'tailor' | 'orders' | 'stocks' | 'customer_service',
        salary: e.hourly_rate as number,
        hireDate: e.hire_date as string,
        isActive: e.is_active as boolean,
      }));
      setEmployees(mapped);
    }
  };

  // Total salaires (déjà calculé via getStats)
  const totalSalaries = employees.reduce((sum, e) => sum + getStats(e.id).totalPay, 0);

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Chiffre d'affaires</CardTitle>
            <CardDescription>Total factures clients payées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ca.toLocaleString()} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Impayés</CardTitle>
            <CardDescription>Factures clients non payées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unpaid.toLocaleString()} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total salaires</CardTitle>
            <CardDescription>Salaires à verser (calcul RH)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSalaries.toLocaleString()} €</div>
          </CardContent>
        </Card>
      </div>
      {/* Graphique de synthèse */}
      <div className="mb-6">
        <PayrollDonutChart
          labels={["CA", "Impayés", "Salaires"]}
          data={[ca, unpaid, totalSalaries]}
          title="Synthèse Atelier"
        />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Fiches Employés</h2>
        {canManage && (
          <Button onClick={() => { setEditEmployee(null); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        )}
      </div>
      {loading && <div className="text-center text-muted-foreground">Chargement…</div>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Salaire (€)</TableHead>
            <TableHead>Date embauche</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Stats</TableHead>
            {canManage && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map(emp => (
            <React.Fragment key={emp.id}>
              <TableRow>
                <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>{emp.salary}</TableCell>
                <TableCell>{emp.hireDate}</TableCell>
                <TableCell>{emp.isActive ? <Badge variant="default">Actif</Badge> : <Badge variant="destructive">Inactif</Badge>}</TableCell>
                <TableCell>
                  <div>
                    <span className="font-semibold">{getStats(emp.id).totalHours}h</span> /
                    <span className="ml-1">{getStats(emp.id).totalPay} €</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="mt-1">Voir planning</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Planning de {emp.firstName} {emp.lastName}</DialogTitle>
                      </DialogHeader>
                      <PlanningForm
                        employeeId={emp.id}
                        onSaved={() => {
                          // Refresh work hours après ajout/édition
                          const fetchWorkHours = async () => {
                            if (!user?.companyId) return;
                            const { data, error } = await supabase
                              .from('work_hours')
                              .select('*')
                              .eq('company_id', user.companyId)
                              .eq('employee_id', emp.id);
                            if (!error) {
                              setWorkHours(prev => ({ ...prev, [emp.id]: (data || []).map((wh: Record<string, unknown>) => ({
                                id: wh.id as string,
                                workDate: wh.work_date as string,
                                startTime: wh.start_time as string | null,
                                endTime: wh.end_time as string | null,
                                totalHours: (wh.total_hours as number) || 0,
                                notes: wh.notes as string | null,
                              })) }));
                            }
                          };
                          fetchWorkHours();
                        }}
                      />
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Début</TableHead>
                            <TableHead>Fin</TableHead>
                            <TableHead>Heures</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(workHours[emp.id] || []).map(wh => (
                            <TableRow key={wh.id}>
                              <TableCell>{wh.workDate}</TableCell>
                              <TableCell>{wh.startTime || '-'}</TableCell>
                              <TableCell>{wh.endTime || '-'}</TableCell>
                              <TableCell>{wh.totalHours}</TableCell>
                              <TableCell>{wh.notes || '-'}</TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">Éditer</Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Modifier le créneau</DialogTitle>
                                    </DialogHeader>
                                    <PlanningForm
                                      employeeId={emp.id}
                                      initial={wh}
                                      onSaved={() => {
                                        // Refresh work hours après édition
                                        const fetchWorkHours = async () => {
                                          if (!user?.companyId) return;
                                          const { data, error } = await supabase
                                            .from('work_hours')
                                            .select('*')
                                            .eq('company_id', user.companyId)
                                            .eq('employee_id', emp.id);
                                          if (!error) {
                                            setWorkHours(prev => ({ ...prev, [emp.id]: (data || []).map((wh: Record<string, unknown>) => ({
                                              id: wh.id as string,
                                              workDate: wh.work_date as string,
                                              startTime: wh.start_time as string | null,
                                              endTime: wh.end_time as string | null,
                                              totalHours: (wh.total_hours as number) || 0,
                                              notes: wh.notes as string | null,
                                            })) }));
                                          }
                                        };
                                        fetchWorkHours();
                                      }}
                                    />
                                  </DialogContent>
                                </Dialog>
                                <Button size="sm" variant="destructive" className="ml-2" onClick={async () => {
                                  if (!user?.companyId) return;
                                  const { error } = await supabase
                                    .from('work_hours')
                                    .delete()
                                    .eq('id', wh.id)
                                    .eq('company_id', user.companyId);
                                  if (!error) {
                                    setWorkHours(prev => ({
                                      ...prev,
                                      [emp.id]: (prev[emp.id] || []).filter(w => w.id !== wh.id)
                                    }));
                                  } else {
                                    toast({ title: 'Erreur', description: "Impossible de supprimer le créneau.", variant: 'destructive' });
                                  }
                                }}>
                                  Supprimer
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {(workHours[emp.id] || []).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">Aucun créneau</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                {canManage && (
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => { setEditEmployee(emp); setIsDialogOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(emp.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editEmployee ? 'Modifier' : 'Ajouter'} un employé</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={editEmployee}
            onSave={handleSave}
            onCancel={() => { setIsDialogOpen(false); setEditEmployee(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmployeeForm({ employee, onSave, onCancel }: { employee: Employee | null, onSave: (e: Employee) => void, onCancel: () => void }) {
  const [form, setForm] = useState<Employee>(employee || {
    id: '', firstName: '', lastName: '', email: '', role: 'tailor', salary: 0, hireDate: '', isActive: true
  });
  return (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Prénom" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
        <Input placeholder="Nom" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
      </div>
      <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
      <select
        className="border rounded px-2 py-1 w-full"
        value={form.role}
        onChange={e => setForm(f => ({ ...f, role: e.target.value as Employee['role'] }))}
        required
      >
        <option value="owner">Propriétaire</option>
        <option value="manager">Manager</option>
        <option value="tailor">Couturier(e)</option>
        <option value="orders">Commandes</option>
        <option value="stocks">Stocks</option>
        <option value="customer_service">Service client</option>
      </select>
      <Input placeholder="Salaire (€)" type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: Number(e.target.value) }))} required />
      <Input placeholder="Date d'embauche" type="date" value={form.hireDate} onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))} required />
      <div className="flex gap-2">
        <Button type="submit">Enregistrer</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}

// Composant PlanningForm pour CRUD planning
function PlanningForm({ employeeId, onSaved, initial }: { employeeId: string, onSaved: () => void, initial?: WorkHour | null }) {
  const [form, setForm] = useState<WorkHour>(initial || {
    id: '', workDate: '', startTime: '', endTime: '', totalHours: 0, notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!user?.companyId) return;
    if (isEdit) {
      // Update
      const { error } = await supabase
        .from('work_hours')
        .update({
          work_date: form.workDate,
          start_time: form.startTime,
          end_time: form.endTime,
          total_hours: form.totalHours,
          notes: form.notes,
          updated_by: user.id,
        })
        .eq('id', form.id)
        .eq('company_id', user.companyId);
      setLoading(false);
      if (error) {
        toast({ title: 'Erreur', description: "Impossible de modifier le créneau.", variant: 'destructive' });
        return;
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('work_hours')
        .insert({
          company_id: user.companyId,
          employee_id: employeeId,
          work_date: form.workDate,
          start_time: form.startTime,
          end_time: form.endTime,
          total_hours: form.totalHours,
          notes: form.notes,
          created_by: user.id,
          updated_by: user.id,
        });
      setLoading(false);
      if (error) {
        toast({ title: 'Erreur', description: "Impossible d'ajouter le créneau.", variant: 'destructive' });
        return;
      }
    }
    onSaved();
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <Input type="date" value={form.workDate} onChange={e => setForm(f => ({ ...f, workDate: e.target.value }))} required />
      <div className="flex gap-2">
        <Input type="time" value={form.startTime || ''} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required />
        <Input type="time" value={form.endTime || ''} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required />
        <Input type="number" min={0} step={0.25} value={form.totalHours} onChange={e => setForm(f => ({ ...f, totalHours: Number(e.target.value) }))} placeholder="Heures" required />
      </div>
      <Input placeholder="Notes" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{isEdit ? 'Modifier' : 'Ajouter'}</Button>
      </div>
    </form>
  );
}
