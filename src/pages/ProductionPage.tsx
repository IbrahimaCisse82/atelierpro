import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/use-supabase-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, Plus, Search, Scissors, Users, Clock, CheckCircle, 
  AlertTriangle, TrendingUp, ArrowRight, GripVertical, Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type Employee = Database['public']['Tables']['employees']['Row'];
type ProductionTask = Database['public']['Tables']['production_tasks']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

const KANBAN_COLUMNS = [
  { key: 'pending', label: 'En attente', icon: Clock, color: 'border-t-muted-foreground bg-muted/30' },
  { key: 'assigned', label: 'Assignée', icon: Users, color: 'border-t-primary bg-primary/5' },
  { key: 'in_progress', label: 'En cours', icon: Scissors, color: 'border-t-warning bg-warning/5' },
  { key: 'completed', label: 'Terminée', icon: CheckCircle, color: 'border-t-success bg-success/5' },
];

function KanbanCard({ task, orderNumber, clientName, employeeName, onMove }: {
  task: ProductionTask;
  orderNumber: string;
  clientName: string;
  employeeName: string;
  onMove: (taskId: string, newStatus: string) => void;
}) {
  const nextStatus: Record<string, string> = {
    pending: 'assigned',
    assigned: 'in_progress',
    in_progress: 'completed',
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <Card className={`mb-3 hover:shadow-md transition-shadow cursor-default ${isOverdue ? 'ring-2 ring-destructive/50' : ''}`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-sm leading-tight">{task.task_name}</p>
          {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive shrink-0 ml-1" />}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          <span className="font-mono">{orderNumber}</span>
          {clientName !== '-' && <span>• {clientName}</span>}
        </div>
        {employeeName !== 'Non assigné' && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{employeeName}</span>
          </div>
        )}
        {task.due_date && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            <Clock className="h-3 w-3" />
            <span>{new Date(task.due_date).toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        {task.notes && <p className="text-xs text-muted-foreground line-clamp-2">{task.notes}</p>}
        {nextStatus[task.status] && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs mt-1"
            onClick={() => onMove(task.id, nextStatus[task.status])}
          >
            Avancer <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function ProductionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const { data: orders, loading: ordersLoading } = useSupabaseQuery<Order>('orders', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: employees } = useSupabaseQuery<Employee>('employees', { filters: { is_active: true } });
  const { data: tasks, loading: tasksLoading, refetch: refetchTasks } = useSupabaseQuery<ProductionTask>('production_tasks', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: profiles } = useSupabaseQuery<Profile>('profiles', { select: 'user_id, first_name, last_name' });
  const { data: clients } = useSupabaseQuery<Database['public']['Tables']['clients']['Row']>('clients', { select: 'id, first_name, last_name' });

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

  const getOrderNumber = (orderId: string | null) => {
    if (!orderId) return '-';
    return ordersList.find(o => o.id === orderId)?.order_number || '-';
  };

  const getOrderClientName = (orderId: string | null) => {
    if (!orderId) return '-';
    const order = ordersList.find(o => o.id === orderId);
    return order ? getClientName(order.client_id) : '-';
  };

  const filteredTasks = tasksList.filter(task =>
    task.task_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalTasks: tasksList.length,
    pendingTasks: tasksList.filter(t => t.status === 'pending').length,
    inProgressTasks: tasksList.filter(t => t.status === 'in_progress' || t.status === 'assigned').length,
    completedTasks: tasksList.filter(t => t.status === 'completed').length,
    overdueTasks: tasksList.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
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
      setNewTaskName(''); setNewTaskNotes(''); setNewTaskDueDate('');
      setSelectedOrderId(''); setSelectedEmployeeId('');
      refetchTasks();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus } as any);
      toast({ title: "Succès", description: "Statut mis à jour." });
      refetchTasks();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const loading = ordersLoading || tasksLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suivi de Production</h1>
          <p className="text-muted-foreground">Vue Kanban et gestion des tâches</p>
        </div>
        <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nouvelle tâche</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une tâche de production</DialogTitle>
              <DialogDescription>Assigner une étape (Découpe, Couture, Finition...)</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                    <SelectContent>
                      {employeesList.map(e => (
                        <SelectItem key={e.id} value={e.id}>{getEmployeeName(e.profile_id)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Étape / Tâche *</Label>
                <Select value={newTaskName} onValueChange={setNewTaskName}>
                  <SelectTrigger><SelectValue placeholder="Choisir une étape" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Découpe">✂️ Découpe</SelectItem>
                    <SelectItem value="Couture">🧵 Couture</SelectItem>
                    <SelectItem value="Assemblage">🔧 Assemblage</SelectItem>
                    <SelectItem value="Finition">✨ Finition</SelectItem>
                    <SelectItem value="Contrôle Qualité">🔍 Contrôle Qualité</SelectItem>
                    <SelectItem value="Repassage">🔥 Repassage</SelectItem>
                    <SelectItem value="Emballage">📦 Emballage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={newTaskNotes} onChange={e => setNewTaskNotes(e.target.value)} /></div>
              <div><Label>Date limite</Label><Input type="date" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateTaskDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateTask}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.totalTasks}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-muted-foreground">{stats.pendingTasks}</p><p className="text-xs text-muted-foreground">En attente</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-warning">{stats.inProgressTasks}</p><p className="text-xs text-muted-foreground">En cours</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-success">{stats.completedTasks}</p><p className="text-xs text-muted-foreground">Terminées</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${stats.overdueTasks > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{stats.overdueTasks}</p><p className="text-xs text-muted-foreground">En retard</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kanban">🗂️ Kanban</TabsTrigger>
          <TabsTrigger value="list">📋 Liste</TabsTrigger>
          <TabsTrigger value="orders">📦 Commandes</TabsTrigger>
        </TabsList>

        {/* KANBAN VIEW */}
        <TabsContent value="kanban" className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 max-w-sm" />
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {KANBAN_COLUMNS.map(col => {
                const ColIcon = col.icon;
                const columnTasks = filteredTasks.filter(t => t.status === col.key);
                return (
                  <div key={col.key} className={`rounded-lg border-t-4 ${col.color} p-3 min-h-[300px]`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ColIcon className="h-4 w-4" />
                        <span className="font-semibold text-sm">{col.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{columnTasks.length}</Badge>
                    </div>
                    <ScrollArea className="max-h-[60vh]">
                      {columnTasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">Aucune tâche</p>
                      ) : (
                        columnTasks.map(task => (
                          <KanbanCard
                            key={task.id}
                            task={task}
                            orderNumber={getOrderNumber(task.order_id)}
                            clientName={getOrderClientName(task.order_id)}
                            employeeName={getEmployeeName(task.assigned_to)}
                            onMove={handleMoveTask}
                          />
                        ))
                      )}
                    </ScrollArea>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* LIST VIEW */}
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les tâches</CardTitle>
              <CardDescription>{filteredTasks.length} tâche(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map(task => {
                    const statusInfo = KANBAN_COLUMNS.find(c => c.key === task.status);
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                    return (
                      <div key={task.id} className={`flex items-center justify-between p-3 border rounded-lg ${isOverdue ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{task.task_name}</p>
                            <Badge variant="outline" className="text-xs">{statusInfo?.label || task.status}</Badge>
                            {isOverdue && <Badge variant="destructive" className="text-xs">En retard</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getOrderNumber(task.order_id)} • {getOrderClientName(task.order_id)} • {getEmployeeName(task.assigned_to)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {task.status !== 'completed' && (
                            <Button variant="ghost" size="sm" onClick={() => {
                              const next: Record<string, string> = { pending: 'assigned', assigned: 'in_progress', in_progress: 'completed' };
                              if (next[task.status]) handleMoveTask(task.id, next[task.status]);
                            }}>
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORDERS VIEW */}
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes de l'atelier</CardTitle>
              <CardDescription>{ordersList.length} commande(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : (
                <div className="space-y-2">
                  {ordersList.map(order => {
                    const orderTasks = tasksList.filter(t => t.order_id === order.id);
                    const completedCount = orderTasks.filter(t => t.status === 'completed').length;
                    const progress = orderTasks.length > 0 ? Math.round((completedCount / orderTasks.length) * 100) : 0;
                    return (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{order.order_number}</span>
                            <span className="text-sm text-muted-foreground">{getClientName(order.client_id)}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">{formatFCFA(Number(order.total_amount))}</span>
                            {order.due_date && <span className="text-xs text-muted-foreground">Échéance: {new Date(order.due_date).toLocaleDateString('fr-FR')}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{completedCount}/{orderTasks.length} tâches</p>
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-success transition-all" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          <Badge variant="outline">{progress}%</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProductionPage;
