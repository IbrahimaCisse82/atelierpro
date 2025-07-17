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
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Scissors, 
  Download, 
  Trash2,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';

// Types pour les commandes
interface Order {
  id: string;
  order_number: string;
  description: string;
  status: 'pending' | 'in_production' | 'completed' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  start_date: string;
  due_date: string;
  completion_date?: string;
  total_amount: number;
  advance_amount: number;
  client_name?: string;
  created_at: string;
}

// Types pour les tâches de production
interface ProductionTask {
  id: string;
  order_id: string;
  order_number: string;
  employee_id?: string;
  employee_name?: string;
  task_name: string;
  description?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  completion_date?: string;
  remuneration_amount: number;
  remuneration_status: 'pending' | 'approved' | 'paid';
  created_at: string;
}

// Types pour les employés
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  payment_type: 'task' | 'fixed';
  task_rate?: number;
  fixed_salary?: number;
  is_active: boolean;
}

// Données mockées pour les commandes
const mockOrders: Order[] = [
  {
    id: '1',
    order_number: 'ATL-000001',
    description: 'Robe de mariée élégante avec broderies',
    status: 'pending',
    priority: 'high',
    start_date: '2024-07-15',
    due_date: '2024-07-25',
    total_amount: 150000,
    advance_amount: 50000,
    client_name: 'Mariam Diallo',
    created_at: '2024-07-10T10:30:00Z'
  },
  {
    id: '2',
    order_number: 'ATL-000002',
    description: 'Costume 3 pièces pour cérémonie',
    status: 'pending',
    priority: 'normal',
    start_date: '2024-07-16',
    due_date: '2024-07-28',
    total_amount: 85000,
    advance_amount: 30000,
    client_name: 'Ousmane Traoré',
    created_at: '2024-07-11T14:20:00Z'
  },
  {
    id: '3',
    order_number: 'ATL-000003',
    description: 'Jupe crayon professionnelle',
    status: 'in_production',
    priority: 'low',
    start_date: '2024-07-12',
    due_date: '2024-07-20',
    total_amount: 28000,
    advance_amount: 10000,
    client_name: 'Fatou Sall',
    created_at: '2024-07-09T09:15:00Z'
  }
];

// Données mockées pour les employés
const mockEmployees: Employee[] = [
  {
    id: '1',
    first_name: 'Aissatou',
    last_name: 'Diallo',
    role: 'tailor',
    payment_type: 'task',
    task_rate: 2500,
    is_active: true
  },
  {
    id: '2',
    first_name: 'Mamadou',
    last_name: 'Camara',
    role: 'tailor',
    payment_type: 'task',
    task_rate: 2200,
    is_active: true
  },
  {
    id: '3',
    first_name: 'Fatoumata',
    last_name: 'Keita',
    role: 'tailor',
    payment_type: 'fixed',
    fixed_salary: 180000,
    is_active: true
  },
  {
    id: '4',
    first_name: 'Ibrahim',
    last_name: 'Sow',
    role: 'manager',
    payment_type: 'fixed',
    fixed_salary: 250000,
    is_active: true
  }
];

// Données mockées pour les tâches de production
const mockProductionTasks: ProductionTask[] = [
  {
    id: '1',
    order_id: '1',
    order_number: 'ATL-000001',
    employee_id: '1',
    employee_name: 'Aissatou Diallo',
    task_name: 'Coupe et assemblage robe',
    description: 'Coupe du tissu et assemblage de la robe de mariée',
    status: 'in_progress',
    priority: 'high',
    estimated_hours: 8,
    actual_hours: 6,
    start_date: '2024-07-15',
    due_date: '2024-07-18',
    remuneration_amount: 15000,
    remuneration_status: 'pending',
    created_at: '2024-07-15T08:00:00Z'
  },
  {
    id: '2',
    order_id: '1',
    order_number: 'ATL-000001',
    employee_id: '2',
    employee_name: 'Mamadou Camara',
    task_name: 'Broderies et finitions',
    description: 'Réalisation des broderies et finitions',
    status: 'assigned',
    priority: 'high',
    estimated_hours: 12,
    start_date: '2024-07-19',
    due_date: '2024-07-22',
    remuneration_amount: 26400,
    remuneration_status: 'pending',
    created_at: '2024-07-15T10:00:00Z'
  },
  {
    id: '3',
    order_id: '3',
    order_number: 'ATL-000003',
    employee_id: '3',
    employee_name: 'Fatoumata Keita',
    task_name: 'Confection jupe crayon',
    description: 'Confection complète de la jupe crayon',
    status: 'completed',
    priority: 'low',
    estimated_hours: 4,
    actual_hours: 3.5,
    start_date: '2024-07-12',
    completion_date: '2024-07-14',
    remuneration_amount: 3937.5,
    remuneration_status: 'approved',
    created_at: '2024-07-12T09:00:00Z'
  }
];

export function ProductionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // États pour la création de tâche
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [newTask, setNewTask] = useState<{
    task_name: string;
    description: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    estimated_hours: number;
    due_date: string;
  }>({
    task_name: '',
    description: '',
    priority: 'normal',
    estimated_hours: 0,
    due_date: ''
  });

  // États pour la saisie des heures travaillées
  const [isHoursDialogOpen, setIsHoursDialogOpen] = useState(false);
  const [selectedTaskForHours, setSelectedTaskForHours] = useState<ProductionTask | null>(null);
  const [actualHours, setActualHours] = useState(0);

  // Permissions
  const canViewProduction = ['owner', 'manager', 'tailor', 'production'].includes(user?.role || '');
  const canManageProduction = ['owner', 'manager', 'production'].includes(user?.role || '');
  const canAssignTasks = ['owner', 'manager'].includes(user?.role || '');
  
  if (!canViewProduction) {
    return (
        <div className="flex items-center justify-center h-64">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
              <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette section.
              </p>
            </CardContent>
          </Card>
        </div>
    );
  }

  // Filtrage des commandes
  const pendingOrders = mockOrders.filter(order => order.status === 'pending');
  const inProductionOrders = mockOrders.filter(order => order.status === 'in_production');

  // Filtrage des tâches
  const filteredTasks = mockProductionTasks.filter(task => {
    const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.employee_name && task.employee_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Statistiques
  const stats = {
    totalOrders: mockOrders.length,
    pendingOrders: pendingOrders.length,
    inProductionOrders: inProductionOrders.length,
    totalTasks: mockProductionTasks.length,
    pendingTasks: mockProductionTasks.filter(t => t.status === 'pending').length,
    inProgressTasks: mockProductionTasks.filter(t => t.status === 'in_progress').length,
    completedTasks: mockProductionTasks.filter(t => t.status === 'completed').length,
    totalRemuneration: mockProductionTasks.reduce((sum, t) => sum + t.remuneration_amount, 0),
    pendingRemuneration: mockProductionTasks.filter(t => t.remuneration_status === 'pending').reduce((sum, t) => sum + t.remuneration_amount, 0)
  };

  // Handlers
  const handleCreateTask = async () => {
    if (!selectedOrder || !selectedEmployee || !newTask.task_name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Simulation de création avec données réelles
    const newProductionTask: ProductionTask = {
      id: `task-${Date.now()}`,
      order_id: selectedOrder.id,
      order_number: selectedOrder.order_number,
      employee_id: selectedEmployee,
      employee_name: mockEmployees.find(e => e.id === selectedEmployee)?.first_name + ' ' + 
                    mockEmployees.find(e => e.id === selectedEmployee)?.last_name,
      task_name: newTask.task_name,
      description: newTask.description,
      status: 'assigned',
      priority: newTask.priority,
      estimated_hours: newTask.estimated_hours,
      start_date: newTask.due_date,
      due_date: newTask.due_date,
      remuneration_amount: 0, // Sera calculé automatiquement
      remuneration_status: 'pending',
      created_at: new Date().toISOString()
    };

    // Ajouter à la liste (simulation)
    mockProductionTasks.push(newProductionTask);

    toast({
      title: "Succès",
      description: "Tâche de production créée avec succès.",
    });
    setIsCreateTaskDialogOpen(false);
    setSelectedOrder(null);
    setSelectedEmployee('');
    setNewTask({
      task_name: '',
      description: '',
      priority: 'normal',
      estimated_hours: 0,
      due_date: ''
    });
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: ProductionTask['status']) => {
    // Si on passe à "terminé", ouvrir le dialog pour saisir les heures
    if (newStatus === 'completed') {
      const task = mockProductionTasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTaskForHours(task);
        setActualHours(task.estimated_hours || 0);
        setIsHoursDialogOpen(true);
        return;
      }
    }

    // Trouver et mettre à jour la tâche
    const taskIndex = mockProductionTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      mockProductionTasks[taskIndex].status = newStatus;
      
      // Si la tâche est terminée, calculer la rémunération
      if (newStatus === 'completed') {
        const task = mockProductionTasks[taskIndex];
        const employee = mockEmployees.find(e => e.id === task.employee_id);
        
        if (employee) {
          let remuneration = 0;
          if (employee.payment_type === 'task') {
            remuneration = (task.actual_hours || task.estimated_hours || 0) * (employee.task_rate || 0);
          } else {
            // Salaire forfaitaire proportionnel
            const hoursWorked = task.actual_hours || task.estimated_hours || 0;
            remuneration = (employee.fixed_salary || 0) * (hoursWorked / 160.0); // 160h = mois standard
          }
          
          mockProductionTasks[taskIndex].remuneration_amount = remuneration;
          mockProductionTasks[taskIndex].completion_date = new Date().toISOString().split('T')[0];
        }
      }
    }

    toast({
      title: "Succès",
      description: `Statut de la tâche mis à jour vers ${newStatus}.`,
    });
  };

  const handleSaveActualHours = async () => {
    if (!selectedTaskForHours) return;

    // Trouver et mettre à jour la tâche avec les heures réelles
    const taskIndex = mockProductionTasks.findIndex(t => t.id === selectedTaskForHours.id);
    if (taskIndex !== -1) {
      mockProductionTasks[taskIndex].actual_hours = actualHours;
      mockProductionTasks[taskIndex].status = 'completed';
      
      // Calculer la rémunération
      const task = mockProductionTasks[taskIndex];
      const employee = mockEmployees.find(e => e.id === task.employee_id);
      
      if (employee) {
        let remuneration = 0;
        if (employee.payment_type === 'task') {
          remuneration = actualHours * (employee.task_rate || 0);
        } else {
          // Salaire forfaitaire proportionnel
          remuneration = (employee.fixed_salary || 0) * (actualHours / 160.0);
        }
        
        mockProductionTasks[taskIndex].remuneration_amount = remuneration;
        mockProductionTasks[taskIndex].completion_date = new Date().toISOString().split('T')[0];
      }
    }

    toast({
      title: "Succès",
      description: "Tâche terminée avec les heures saisies.",
    });
    
    setIsHoursDialogOpen(false);
    setSelectedTaskForHours(null);
    setActualHours(0);
  };

  const handleApproveRemuneration = async (taskId: string) => {
    // Trouver et approuver la rémunération
    const taskIndex = mockProductionTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      mockProductionTasks[taskIndex].remuneration_status = 'approved';
    }

    toast({
      title: "Succès",
      description: "Rémunération approuvée avec succès.",
    });
  };

  const handlePayRemuneration = async (taskId: string) => {
    // Trouver et marquer comme payée
    const taskIndex = mockProductionTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      mockProductionTasks[taskIndex].remuneration_status = 'paid';
    }

    toast({
      title: "Succès",
      description: "Rémunération marquée comme payée.",
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: 'En attente', color: 'bg-gray-500', icon: Clock },
      assigned: { label: 'Assignée', color: 'bg-blue-500', icon: UserCheck },
      in_progress: { label: 'En cours', color: 'bg-yellow-500', icon: TrendingUp },
      completed: { label: 'Terminée', color: 'bg-green-500', icon: CheckCircle },
      cancelled: { label: 'Annulée', color: 'bg-red-500', icon: AlertTriangle }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getPriorityInfo = (priority: string) => {
    const priorityMap = {
      low: { label: 'Faible', color: 'bg-gray-100 text-gray-800' },
      normal: { label: 'Normale', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'Élevée', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.normal;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion de la Production</h1>
          <p className="text-muted-foreground">
            Suivi des commandes et tâches de production
          </p>
        </div>
        {canManageProduction && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Rapport
            </Button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingOrders} en attente, {stats.inProductionOrders} en production
                </p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tâches</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.inProgressTasks} en cours, {stats.completedTasks} terminées
                </p>
              </div>
              <Scissors className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rémunération</p>
                <p className="text-2xl font-bold">{formatFCFA(stats.totalRemuneration)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFCFA(stats.pendingRemuneration)} en attente
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employés</p>
                <p className="text-2xl font-bold">{mockEmployees.filter(e => e.is_active).length}</p>
                <p className="text-xs text-muted-foreground">
                  {mockEmployees.filter(e => e.is_active && e.role === 'tailor').length} tailleurs
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tâches de Production</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                      placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="assigned">Assignée</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Élevée</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Liste des tâches */}
      <Card>
        <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tâches de Production</CardTitle>
                  <CardDescription>Gestion des tâches assignées aux employés</CardDescription>
                </div>
                {canAssignTasks && (
                  <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle tâche
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle tâche</DialogTitle>
                        <DialogDescription>
                          Assigner une commande à un employé pour la production
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="order">Commande *</Label>
                          <Select value={selectedOrder?.id || ''} onValueChange={(value) => {
                            const order = mockOrders.find(o => o.id === value);
                            setSelectedOrder(order || null);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une commande" />
                            </SelectTrigger>
                            <SelectContent>
                              {pendingOrders.map(order => (
                                <SelectItem key={order.id} value={order.id}>
                                  {order.order_number} - {order.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedOrder && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <p><strong>Client:</strong> {selectedOrder.client_name}</p>
                              <p><strong>Échéance:</strong> {selectedOrder.due_date}</p>
                              <p><strong>Montant:</strong> {formatFCFA(selectedOrder.total_amount)}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="employee">Employé *</Label>
                          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un employé" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockEmployees.filter(e => e.is_active && e.role === 'tailor').map(employee => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.first_name} {employee.last_name} 
                                  ({employee.payment_type === 'task' ? `${employee.task_rate} FCFA/h` : 'Salaire fixe'})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="task_name">Nom de la tâche *</Label>
                          <Input
                            id="task_name"
                            value={newTask.task_name}
                            onChange={(e) => setNewTask(prev => ({ ...prev, task_name: e.target.value }))}
                            placeholder="Ex: Coupe et assemblage"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newTask.description}
                            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description détaillée de la tâche..."
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="priority">Priorité</Label>
                            <Select value={newTask.priority} onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => 
                              setNewTask(prev => ({ ...prev, priority: value }))
                            }>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Faible</SelectItem>
                                <SelectItem value="normal">Normale</SelectItem>
                                <SelectItem value="high">Élevée</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="estimated_hours">Heures estimées</Label>
                            <Input
                              id="estimated_hours"
                              type="number"
                              value={newTask.estimated_hours}
                              onChange={(e) => setNewTask(prev => ({ ...prev, estimated_hours: Number(e.target.value) }))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="due_date">Date limite</Label>
                            <Input
                              id="due_date"
                              type="date"
                              value={newTask.due_date}
                              onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateTaskDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCreateTask}>
                          Créer la tâche
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                    <TableHead>Tâche</TableHead>
                    <TableHead>Commande</TableHead>
                    <TableHead>Employé</TableHead>
                <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Heures</TableHead>
                    <TableHead>Rémunération</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {filteredTasks.map((task) => {
                    const statusInfo = getStatusInfo(task.status);
                    const priorityInfo = getPriorityInfo(task.priority);
                    const StatusIcon = statusInfo.icon;
                    
                return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.task_name}</p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{task.order_number}</TableCell>
                        <TableCell>
                          {task.employee_name || (
                            <span className="text-muted-foreground">Non assigné</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                        </TableCell>
                    <TableCell>
                          <div className="text-sm">
                            {task.actual_hours ? (
                              <span>{task.actual_hours}h / {task.estimated_hours}h</span>
                            ) : (
                              <span>{task.estimated_hours}h estimées</span>
                            )}
                      </div>
                    </TableCell>
                    <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{formatFCFA(task.remuneration_amount)}</p>
                            <Badge variant={task.remuneration_status === 'paid' ? 'default' : 'secondary'}>
                              {task.remuneration_status === 'pending' ? 'En attente' : 
                               task.remuneration_status === 'approved' ? 'Approuvée' : 'Payée'}
                            </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {task.status === 'pending' && canAssignTasks && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUpdateTaskStatus(task.id, 'assigned')}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {task.status === 'assigned' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                              >
                                <TrendingUp className="h-4 w-4" />
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {task.remuneration_status === 'pending' && canManageProduction && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleApproveRemuneration(task.id)}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                            {task.remuneration_status === 'approved' && canManageProduction && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePayRemuneration(task.id)}
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            )}
                              </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {/* Liste des commandes */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes</CardTitle>
              <CardDescription>Vue d'ensemble des commandes et leur statut</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const priorityInfo = getPriorityInfo(order.priority);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_number}</TableCell>
                        <TableCell>
                              <div>
                            <p className="font-medium">{order.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Avance: {formatFCFA(order.advance_amount)}
                            </p>
                              </div>
                        </TableCell>
                        <TableCell>{order.client_name}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{order.due_date}</p>
                            <p className="text-muted-foreground">
                              {order.start_date} - {order.due_date}
                            </p>
                            </div>
                        </TableCell>
                        <TableCell>{formatFCFA(order.total_amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.status === 'pending' && canAssignTasks && (
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pour saisir les heures travaillées */}
      <Dialog open={isHoursDialogOpen} onOpenChange={setIsHoursDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Terminer la tâche</DialogTitle>
            <DialogDescription>
              Saisissez les heures réellement travaillées pour calculer la rémunération
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTaskForHours && (
              <div className="space-y-4">
                <div>
                  <Label>Tâche</Label>
                  <p className="text-sm font-medium">{selectedTaskForHours.task_name}</p>
                </div>
                <div>
                  <Label>Employé</Label>
                  <p className="text-sm font-medium">{selectedTaskForHours.employee_name}</p>
                </div>
                <div>
                  <Label>Heures estimées</Label>
                  <p className="text-sm font-medium">{selectedTaskForHours.estimated_hours}h</p>
                </div>
                <div>
                  <Label htmlFor="actual_hours">Heures travaillées *</Label>
                  <Input
                    id="actual_hours"
                    type="number"
                    step="0.5"
                    value={actualHours}
                    onChange={(e) => setActualHours(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHoursDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveActualHours}>
              Terminer la tâche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}