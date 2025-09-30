import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Calculator,
  Download,
  Plus,
  UserCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';

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
  hire_date: string;
}

// Types pour les rémunérations
interface Remuneration {
  id: string;
  employee_id: string;
  employee_name: string;
  production_task_id: string;
  order_id: string;
  order_number: string;
  task_name: string;
  amount: number;
  payment_type: 'task' | 'fixed';
  status: 'pending' | 'approved' | 'paid';
  payment_date?: string;
  notes?: string;
  completion_date: string;
  hours_worked: number;
  created_at: string;
}

// Types pour les commandes
interface Order {
  id: string;
  order_number: string;
  description: string;
  client_name: string;
  completion_date: string;
  total_amount: number;
}

// Données mockées pour les employés
const mockEmployees: Employee[] = [
  {
    id: '1',
    first_name: 'Aissatou',
    last_name: 'Diallo',
    role: 'tailor',
    payment_type: 'task',
    task_rate: 2500,
    is_active: true,
    hire_date: '2023-01-15'
  },
  {
    id: '2',
    first_name: 'Mamadou',
    last_name: 'Camara',
    role: 'tailor',
    payment_type: 'task',
    task_rate: 2200,
    is_active: true,
    hire_date: '2023-03-20'
  },
  {
    id: '3',
    first_name: 'Fatoumata',
    last_name: 'Keita',
    role: 'tailor',
    payment_type: 'fixed',
    fixed_salary: 180000,
    is_active: true,
    hire_date: '2022-11-10'
  },
  {
    id: '4',
    first_name: 'Ibrahim',
    last_name: 'Sow',
    role: 'manager',
    payment_type: 'fixed',
    fixed_salary: 250000,
    is_active: true,
    hire_date: '2022-06-01'
  }
];

// Données mockées pour les rémunérations
const mockRemunerations: Remuneration[] = [
  {
    id: '1',
    employee_id: '1',
    employee_name: 'Aissatou Diallo',
    production_task_id: 'task-1',
    order_id: 'order-1',
    order_number: 'ATL-000001',
    task_name: 'Coupe et assemblage robe',
    amount: 15000,
    payment_type: 'task',
    status: 'pending',
    completion_date: '2024-07-18',
    hours_worked: 6,
    created_at: '2024-07-18T16:00:00Z'
  },
  {
    id: '2',
    employee_id: '1',
    employee_name: 'Aissatou Diallo',
    production_task_id: 'task-2',
    order_id: 'order-2',
    order_number: 'ATL-000002',
    task_name: 'Broderies et finitions',
    amount: 22000,
    payment_type: 'task',
    status: 'approved',
    payment_date: '2024-07-20',
    completion_date: '2024-07-19',
    hours_worked: 8,
    created_at: '2024-07-19T14:30:00Z'
  },
  {
    id: '3',
    employee_id: '2',
    employee_name: 'Mamadou Camara',
    production_task_id: 'task-3',
    order_id: 'order-3',
    order_number: 'ATL-000003',
    task_name: 'Confection costume',
    amount: 17600,
    payment_type: 'task',
    status: 'paid',
    payment_date: '2024-07-15',
    completion_date: '2024-07-14',
    hours_worked: 8,
    created_at: '2024-07-14T12:00:00Z'
  },
  {
    id: '4',
    employee_id: '3',
    employee_name: 'Fatoumata Keita',
    production_task_id: 'task-4',
    order_id: 'order-4',
    order_number: 'ATL-000004',
    task_name: 'Confection jupe crayon',
    amount: 3937.5,
    payment_type: 'fixed',
    status: 'pending',
    completion_date: '2024-07-16',
    hours_worked: 3.5,
    created_at: '2024-07-16T10:00:00Z'
  }
];

// Données mockées pour les commandes
const mockOrders: Order[] = [
  {
    id: 'order-1',
    order_number: 'ATL-000001',
    description: 'Robe de mariée élégante avec broderies',
    client_name: 'Mariam Diallo',
    completion_date: '2024-07-18',
    total_amount: 150000
  },
  {
    id: 'order-2',
    order_number: 'ATL-000002',
    description: 'Costume 3 pièces pour cérémonie',
    client_name: 'Ousmane Traoré',
    completion_date: '2024-07-19',
    total_amount: 85000
  },
  {
    id: 'order-3',
    order_number: 'ATL-000003',
    description: 'Costume classique',
    client_name: 'Fatou Sall',
    completion_date: '2024-07-14',
    total_amount: 65000
  },
  {
    id: 'order-4',
    order_number: 'ATL-000004',
    description: 'Jupe crayon professionnelle',
    client_name: 'Aminata Ba',
    completion_date: '2024-07-16',
    total_amount: 28000
  }
];

export function RemunerationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('remunerations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // États pour la modification de rémunération
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRemuneration, setSelectedRemuneration] = useState<Remuneration | null>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  // Permissions
  const canViewRemunerations = ['owner', 'manager', 'hr'].includes(user?.role || '');
  const canManageRemunerations = ['owner', 'manager'].includes(user?.role || '');

  if (!canViewRemunerations) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrage des rémunérations
  const filteredRemunerations = mockRemunerations.filter(remuneration => {
    const matchesSearch = remuneration.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         remuneration.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         remuneration.task_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || remuneration.status === statusFilter;
    const matchesEmployee = employeeFilter === 'all' || remuneration.employee_id === employeeFilter;
    
    return matchesSearch && matchesStatus && matchesEmployee;
  });

  // Statistiques
  const stats = {
    totalRemunerations: mockRemunerations.length,
    pendingRemunerations: mockRemunerations.filter(r => r.status === 'pending').length,
    approvedRemunerations: mockRemunerations.filter(r => r.status === 'approved').length,
    paidRemunerations: mockRemunerations.filter(r => r.status === 'paid').length,
    totalAmount: mockRemunerations.reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: mockRemunerations.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0),
    approvedAmount: mockRemunerations.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0),
    paidAmount: mockRemunerations.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0)
  };

  // Handlers
  const handleEditRemuneration = (remuneration: Remuneration) => {
    setSelectedRemuneration(remuneration);
    setEditAmount(remuneration.amount);
    setEditNotes(remuneration.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveRemuneration = async () => {
    if (!selectedRemuneration) return;

    // Trouver et mettre à jour la rémunération
    const remunerationIndex = mockRemunerations.findIndex(r => r.id === selectedRemuneration.id);
    if (remunerationIndex !== -1) {
      mockRemunerations[remunerationIndex].amount = editAmount;
      mockRemunerations[remunerationIndex].notes = editNotes;
    }

    toast({
      title: "Succès",
      description: "Rémunération mise à jour avec succès.",
    });
    setIsEditDialogOpen(false);
    setSelectedRemuneration(null);
  };

  const handleApproveRemuneration = async (remunerationId: string) => {
    // Trouver et approuver la rémunération
    const remunerationIndex = mockRemunerations.findIndex(r => r.id === remunerationId);
    if (remunerationIndex !== -1) {
      mockRemunerations[remunerationIndex].status = 'approved';
    }

    toast({
      title: "Succès",
      description: "Rémunération approuvée avec succès.",
    });
  };

  const handlePayRemuneration = async (remunerationId: string) => {
    // Trouver et marquer comme payée
    const remunerationIndex = mockRemunerations.findIndex(r => r.id === remunerationId);
    if (remunerationIndex !== -1) {
      mockRemunerations[remunerationIndex].status = 'paid';
      mockRemunerations[remunerationIndex].payment_date = new Date().toISOString().split('T')[0];
    }

    toast({
      title: "Succès",
      description: "Rémunération marquée comme payée.",
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
      approved: { label: 'Approuvée', color: 'bg-blue-500', icon: UserCheck },
      paid: { label: 'Payée', color: 'bg-green-500', icon: CheckCircle }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getPaymentTypeInfo = (type: string) => {
    return type === 'task' ? 'À la tâche' : 'Forfaitaire';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Rémunérations</h1>
          <p className="text-muted-foreground">
            Suivi des rémunérations et paiements des employés
          </p>
        </div>
        {canManageRemunerations && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
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
                <p className="text-sm font-medium text-muted-foreground">Total rémunérations</p>
                <p className="text-2xl font-bold">{stats.totalRemunerations}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFCFA(stats.totalAmount)}
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
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingRemunerations}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFCFA(stats.pendingAmount)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approuvées</p>
                <p className="text-2xl font-bold text-blue-600">{stats.approvedRemunerations}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFCFA(stats.approvedAmount)}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payées</p>
                <p className="text-2xl font-bold text-green-600">{stats.paidRemunerations}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFCFA(stats.paidAmount)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="remunerations">Rémunérations</TabsTrigger>
          <TabsTrigger value="employees">Employés</TabsTrigger>
        </TabsList>

        <TabsContent value="remunerations" className="space-y-4">
          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une rémunération..."
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
                      <SelectItem value="approved">Approuvées</SelectItem>
                      <SelectItem value="paid">Payées</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Employé" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les employés</SelectItem>
                      {mockEmployees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des rémunérations */}
          <Card>
            <CardHeader>
              <CardTitle>Rémunérations</CardTitle>
              <CardDescription>Gestion des rémunérations des employés</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Commande</TableHead>
                    <TableHead>Tâche</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Heures</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date fin</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRemunerations.map((remuneration) => {
                    const statusInfo = getStatusInfo(remuneration.status);
                    const StatusIcon = statusInfo.icon;
                    const order = mockOrders.find(o => o.id === remuneration.order_id);
                    
                    return (
                      <TableRow key={remuneration.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{remuneration.employee_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {getPaymentTypeInfo(remuneration.payment_type)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-mono">{remuneration.order_number}</p>
                            {order && (
                              <p className="text-sm text-muted-foreground">
                                {order.client_name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{remuneration.task_name}</p>
                            {order && (
                              <p className="text-sm text-muted-foreground">
                                {order.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getPaymentTypeInfo(remuneration.payment_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {remuneration.hours_worked}h
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatFCFA(remuneration.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {remuneration.completion_date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditRemuneration(remuneration)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {remuneration.status === 'pending' && canManageRemunerations && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleApproveRemuneration(remuneration.id)}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {remuneration.status === 'approved' && canManageRemunerations && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePayRemuneration(remuneration.id)}
                              >
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          {/* Liste des employés */}
          <Card>
            <CardHeader>
              <CardTitle>Employés</CardTitle>
              <CardDescription>Types de rémunération et taux des employés</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Type de paiement</TableHead>
                    <TableHead>Taux/Salaire</TableHead>
                    <TableHead>Date d'embauche</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {employee.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {employee.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.payment_type === 'task' ? 'default' : 'secondary'}>
                          {getPaymentTypeInfo(employee.payment_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {employee.payment_type === 'task' 
                            ? `${formatFCFA(employee.task_rate || 0)}/h`
                            : formatFCFA(employee.fixed_salary || 0)
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.hire_date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                          {employee.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManageRemunerations && (
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de modification de rémunération */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la rémunération</DialogTitle>
            <DialogDescription>
              Ajuster le montant et les notes de la rémunération
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRemuneration && (
              <div className="space-y-4">
                <div>
                  <Label>Employé</Label>
                  <p className="text-sm font-medium">{selectedRemuneration.employee_name}</p>
                </div>
                <div>
                  <Label>Commande</Label>
                  <p className="text-sm font-medium">{selectedRemuneration.order_number}</p>
                </div>
                <div>
                  <Label>Tâche</Label>
                  <p className="text-sm font-medium">{selectedRemuneration.task_name}</p>
                </div>
                <div>
                  <Label htmlFor="amount">Montant (FCFA) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Notes optionnelles..."
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveRemuneration}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RemunerationPage;