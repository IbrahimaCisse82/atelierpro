import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Plus, Search, Filter, Eye, Download, Scissors, Users,
  Clock, CheckCircle, AlertTriangle, TrendingUp, UserCheck, DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type Employee = Database['public']['Tables']['employees']['Row'];
type ProductionTask = Database['public']['Tables']['production_tasks']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export function ProductionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const { data: orders, loading: ordersLoading } = useSupabaseQuery<Order>('orders', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: employees } = useSupabaseQuery<Employee>('employees', {
    filters: { is_active: true }
  });
  const { data: tasks, loading: tasksLoading, refetch: refetchTasks } = useSupabaseQuery<ProductionTask>('production_tasks', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: profiles } = useSupabaseQuery<Profile>('profiles', {
    select: 'user_id, first_name, last_name'
  });
  const { data: clients } = useSupabaseQuery<Database['public']['Tables']['clients']['Row']>('clients', {
    select: 'id, first_name, last_name'
  });

  const { create: createTask, update: updateTask } = useSupabaseMutation<ProductionTask>('production_tasks');

  const ordersList = orders || [];
  const employeesList = employees || [];
  const tasksList = tasks || [];
  const profilesList = profiles || [];
  const clientsList = clients || [];

  const getEmployeeName = (profileId: string | null) => {
    if (!profileId) return 'Non assigné';
    const profile = profilesList.find(p => p.user_id === profileId);
    return profile ? `${profile.first_name} ${profile.last_name}` : 'Inconnu';
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return '-';
    const client = clientsList.find(c => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : '-';
  };

  const filteredTasks = tasksList.filter(task => {
    const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalOrders: ordersList.length,
    pendingOrders: ordersList.filter(o => o.status === 'order_created').length,
    totalTasks: tasksList.length,
    pendingTasks: tasksList.filter(t => t.status === 'pending').length,
    inProgressTasks: tasksList.filter(t => t.status === 'in_progress').length,
    completedTasks: tasksList.filter(t => t.status === 'completed').length,
    activeEmployees: employeesList.length,
  };

  const handleCreateTask = async () => {
    if (!selectedOrderId || !newTaskName) {
      toast({ title: "Erreur", description: "Commande et nom de tâche obligatoires.", variant: "destructive" });
      return;
    }
    try {
      await createTask({
        order_id: selectedOrderId,
        task_name: newTaskName,
        notes: newTaskNotes || null,
        due_date: newTaskDueDate || null,
        assigned_to: selectedEmployeeId || null,
        status: selectedEmployeeId ? 'assigned' : 'pending',
      } as any);
      toast({ title: "Succès", description: "Tâche créée." });
      setIsCreateTaskDialogOpen(false);
      setNewTaskName('');
      setNewTaskNotes('');
      setNewTaskDueDate('');
      setSelectedOrderId('');
      setSelectedEmployeeId('');
      refetchTasks();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus } as any);
      toast({ title: "Succès", description: `Statut mis à jour.` });
      refetchTasks();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: 'En attente', color: 'bg-gray-500' },
      assigned: { label: 'Assignée', color: 'bg-blue-500' },
      in_progress: { label: 'En cours', color: 'bg-yellow-500' },
      completed: { label: 'Terminée', color: 'bg-green-500' },
      cancelled: { label: 'Annulée', color: 'bg-red-500' },
    };
    return map[status] || map.pending;
  };

  const getOrderStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      order_created: 'Créée',
      fabric_selected: 'Tissu sélectionné',
      cutting: 'Coupe',
      sewing: 'Couture',
      fitting: 'Essayage',
      finishing: 'Finition',
      ready: 'Prête',
      delivered: 'Livrée',
    };
    return map[status] || status;
  };

  const loading = ordersLoading || tasksLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion de la Production</h1>
          <p className="text-muted-foreground">Suivi des commandes et tâches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Commandes</p><p className="text-2xl font-bold">{stats.totalOrders}</p><p className="text-xs text-muted-foreground">{stats.pendingOrders} en attente</p></div><Package className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Tâches</p><p className="text-2xl font-bold">{stats.totalTasks}</p><p className="text-xs text-muted-foreground">{stats.inProgressTasks} en cours</p></div><Scissors className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Terminées</p><p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p></div><CheckCircle className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Employés actifs</p><p className="text-2xl font-bold">{stats.activeEmployees}</p></div><Users className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tâches de Production</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher une tâche..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="assigned">Assignée</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tâches de Production</CardTitle>
                  <CardDescription>{filteredTasks.length} tâche(s)</CardDescription>
                </div>
                <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Nouvelle tâche</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Créer une tâche</DialogTitle>
                      <DialogDescription>Assigner une tâche de production</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Commande *</Label>
                        <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                          <SelectContent>
                            {ordersList.map(o => (
                              <SelectItem key={o.id} value={o.id}>{o.order_number} - {getClientName(o.client_id)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Employé</Label>
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner (optionnel)" /></SelectTrigger>
                          <SelectContent>
                            {employeesList.map(e => (
                              <SelectItem key={e.id} value={e.id}>{getEmployeeName(e.profile_id)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Nom de la tâche *</Label><Input value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} placeholder="Ex: Coupe et assemblage" /></div>
                      <div><Label>Notes</Label><Textarea value={newTaskNotes} onChange={(e) => setNewTaskNotes(e.target.value)} /></div>
                      <div><Label>Date limite</Label><Input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateTaskDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleCreateTask}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tâche</TableHead>
                    <TableHead>Commande</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map(task => {
                    const order = ordersList.find(o => o.id === task.order_id);
                    const statusInfo = getStatusInfo(task.status);
                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.task_name}</p>
                            {task.notes && <p className="text-sm text-muted-foreground">{task.notes}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{order?.order_number || '-'}</TableCell>
                        <TableCell><Badge className={statusInfo.color}>{statusInfo.label}</Badge></TableCell>
                        <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {task.status === 'pending' && (
                              <Button variant="ghost" size="sm" onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')} title="Démarrer">
                                <TrendingUp className="h-4 w-4" />
                              </Button>
                            )}
                            {(task.status === 'assigned' || task.status === 'in_progress') && (
                              <Button variant="ghost" size="sm" onClick={() => handleUpdateTaskStatus(task.id, 'completed')} title="Terminer">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes</CardTitle>
              <CardDescription>Toutes les commandes de l'atelier</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Échéance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersList.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.order_number}</TableCell>
                      <TableCell>{getClientName(order.client_id)}</TableCell>
                      <TableCell><Badge>{getOrderStatusLabel(order.status)}</Badge></TableCell>
                      <TableCell>{formatFCFA(Number(order.total_amount))}</TableCell>
                      <TableCell>{order.due_date ? new Date(order.due_date).toLocaleDateString('fr-FR') : '-'}</TableCell>
                    </TableRow>
                  ))}
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

export default ProductionPage;
