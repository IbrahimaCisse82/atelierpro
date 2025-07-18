import React, { useState, useEffect } from 'react';
import { AccessControl } from '@/components/common/AccessControl';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Send,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Building,
  Users,
  Truck,
  Package,
  FileText,
  CreditCard,
  ArrowRight,
  Play,
  Pause,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { formatFCFA, formatFCFAWithDecimals } from '@/lib/utils';

// Types pour les workflows
interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'blocked';
  instruction: string;
  actionRequired: boolean;
  completedAt?: string;
  completedBy?: string;
  icon: React.ComponentType<any>;
}

interface ClientWorkflow {
  id: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  steps: WorkflowStep[];
  currentStep: number;
  isCompleted: boolean;
}

interface SupplierWorkflow {
  id: string;
  purchaseOrderNumber: string;
  supplierName: string;
  supplierEmail: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  steps: WorkflowStep[];
  currentStep: number;
  isCompleted: boolean;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Données simulées - Workflows clients
const mockClientWorkflows: ClientWorkflow[] = [
  {
    id: '1',
    orderNumber: 'CMD-2024-001',
    clientName: 'Marie Dupont',
    clientEmail: 'marie.dupont@email.com',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-25',
    totalAmount: 45000,
    advanceAmount: 15000,
    remainingAmount: 30000,
    currentStep: 2,
    isCompleted: false,
    steps: [
      {
        id: 'order',
        name: 'Commande',
        status: 'completed',
        instruction: 'Commande confirmée et en production',
        actionRequired: false,
        completedAt: '2024-01-15T10:30:00Z',
        completedBy: 'Alice Couture',
        icon: ShoppingCart
      },
      {
        id: 'delivery',
        name: 'Livraison',
        status: 'active',
        instruction: 'Action requise : Confirmer la livraison pour la commande #CMD-2024-001',
        actionRequired: true,
        icon: Truck
      },
      {
        id: 'invoicing',
        name: 'Facturation',
        status: 'pending',
        instruction: 'En attente de la livraison',
        actionRequired: false,
        icon: FileText
      },
      {
        id: 'payment',
        name: 'Paiement',
        status: 'pending',
        instruction: 'En attente de la facturation',
        actionRequired: false,
        icon: CreditCard
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'CMD-2024-002',
    clientName: 'Jean Martin',
    clientEmail: 'jean.martin@email.com',
    orderDate: '2024-01-16',
    deliveryDate: '2024-01-28',
    totalAmount: 32000,
    advanceAmount: 0,
    remainingAmount: 32000,
    currentStep: 3,
    isCompleted: false,
    steps: [
      {
        id: 'order',
        name: 'Commande',
        status: 'completed',
        instruction: 'Commande confirmée et en production',
        actionRequired: false,
        completedAt: '2024-01-16T14:20:00Z',
        completedBy: 'Marc Tailleur',
        icon: ShoppingCart
      },
      {
        id: 'delivery',
        name: 'Livraison',
        status: 'completed',
        instruction: 'Livraison confirmée',
        actionRequired: false,
        completedAt: '2024-01-25T16:45:00Z',
        completedBy: 'Marc Tailleur',
        icon: Truck
      },
      {
        id: 'invoicing',
        name: 'Facturation',
        status: 'active',
        instruction: 'Action requise : Générer la facture pour la livraison #LIV-2024-002',
        actionRequired: true,
        icon: FileText
      },
      {
        id: 'payment',
        name: 'Paiement',
        status: 'pending',
        instruction: 'En attente de la facturation',
        actionRequired: false,
        icon: CreditCard
      }
    ]
  },
  {
    id: '3',
    orderNumber: 'CMD-2024-003',
    clientName: 'Sophie Bernard',
    clientEmail: 'sophie.bernard@email.com',
    orderDate: '2024-01-10',
    deliveryDate: '2024-01-20',
    totalAmount: 28000,
    advanceAmount: 10000,
    remainingAmount: 18000,
    currentStep: 4,
    isCompleted: true,
    steps: [
      {
        id: 'order',
        name: 'Commande',
        status: 'completed',
        instruction: 'Commande confirmée et en production',
        actionRequired: false,
        completedAt: '2024-01-10T09:15:00Z',
        completedBy: 'Emma Style',
        icon: ShoppingCart
      },
      {
        id: 'delivery',
        name: 'Livraison',
        status: 'completed',
        instruction: 'Livraison confirmée',
        actionRequired: false,
        completedAt: '2024-01-20T11:30:00Z',
        completedBy: 'Emma Style',
        icon: Truck
      },
      {
        id: 'invoicing',
        name: 'Facturation',
        status: 'completed',
        instruction: 'Facture générée et envoyée',
        actionRequired: false,
        completedAt: '2024-01-21T15:20:00Z',
        completedBy: 'Emma Style',
        icon: FileText
      },
      {
        id: 'payment',
        name: 'Paiement',
        status: 'completed',
        instruction: 'Paiement reçu',
        actionRequired: false,
        completedAt: '2024-01-22T10:45:00Z',
        completedBy: 'Sophie Bernard',
        icon: CreditCard
      }
    ]
  }
];

// Données simulées - Workflows fournisseurs
const mockSupplierWorkflows: SupplierWorkflow[] = [
  {
    id: '1',
    purchaseOrderNumber: 'ACH-2024-001',
    supplierName: 'Tissus Premium SARL',
    supplierEmail: 'contact@tissuspremium.com',
    orderDate: '2024-01-10',
    deliveryDate: '2024-01-20',
    totalAmount: 125000,
    currentStep: 2,
    isCompleted: false,
    steps: [
      {
        id: 'purchase',
        name: 'Achat',
        status: 'completed',
        instruction: 'Commande d\'achat confirmée',
        actionRequired: false,
        completedAt: '2024-01-10T08:30:00Z',
        completedBy: 'AtelierPro',
        icon: ShoppingCart
      },
      {
        id: 'delivery',
        name: 'Livraison',
        status: 'active',
        instruction: 'Action requise : Confirmer la réception pour l\'achat #ACH-2024-001',
        actionRequired: true,
        icon: Package
      },
      {
        id: 'invoicing',
        name: 'Facturation',
        status: 'pending',
        instruction: 'En attente de la réception',
        actionRequired: false,
        icon: FileText
      },
      {
        id: 'payment',
        name: 'Paiement',
        status: 'pending',
        instruction: 'En attente de la facturation',
        actionRequired: false,
        icon: CreditCard
      }
    ]
  },
  {
    id: '2',
    purchaseOrderNumber: 'ACH-2024-002',
    supplierName: 'Accessoires Couture',
    supplierEmail: 'info@accessoirescouture.com',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-25',
    totalAmount: 45000,
    currentStep: 3,
    isCompleted: false,
    steps: [
      {
        id: 'purchase',
        name: 'Achat',
        status: 'completed',
        instruction: 'Commande d\'achat confirmée',
        actionRequired: false,
        completedAt: '2024-01-15T11:20:00Z',
        completedBy: 'AtelierPro',
        icon: ShoppingCart
      },
      {
        id: 'delivery',
        name: 'Livraison',
        status: 'completed',
        instruction: 'Réception confirmée',
        actionRequired: false,
        completedAt: '2024-01-22T14:15:00Z',
        completedBy: 'AtelierPro',
        icon: Package
      },
      {
        id: 'invoicing',
        name: 'Facturation',
        status: 'active',
        instruction: 'Action requise : Enregistrer la facture fournisseur pour l\'achat #ACH-2024-002',
        actionRequired: true,
        icon: FileText
      },
      {
        id: 'payment',
        name: 'Paiement',
        status: 'pending',
        instruction: 'En attente de la facturation',
        actionRequired: false,
        icon: CreditCard
      }
    ]
  }
];

export function InvoicesPage() {
  const { user } = useAuth();
  const [clientWorkflows, setClientWorkflows] = useState<ClientWorkflow[]>(mockClientWorkflows);
  const [supplierWorkflows, setSupplierWorkflows] = useState<SupplierWorkflow[]>(mockSupplierWorkflows);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('client');

  // Permissions
  const canManageInvoices = ['owner', 'orders', 'finance'].includes(user?.role || '');
  const canViewInvoices = ['owner', 'orders', 'customer_service', 'finance'].includes(user?.role || '');

  // Filtrer les workflows
  const filteredClientWorkflows = clientWorkflows.filter(workflow => {
    const matchesSearch = 
      workflow.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !workflow.isCompleted) ||
      (statusFilter === 'completed' && workflow.isCompleted);
    
    return matchesSearch && matchesStatus;
  });

  const filteredSupplierWorkflows = supplierWorkflows.filter(workflow => {
    const matchesSearch = 
      workflow.purchaseOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !workflow.isCompleted) ||
      (statusFilter === 'completed' && workflow.isCompleted);
    
    return matchesSearch && matchesStatus;
  });

  // Handlers pour les workflows clients
  const handleClientStepAction = (workflowId: string, stepId: string) => {
    const workflow = mockClientWorkflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step || !step.actionRequired) return;

    // Traitement selon l'étape
    switch (stepId) {
      case 'delivery':
        // Confirmer la livraison
        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        step.completedBy = user?.email || 'Utilisateur';
        workflow.currentStep = 3;
        
        // Activer l'étape suivante
        const invoicingStep = workflow.steps.find(s => s.id === 'invoicing');
        if (invoicingStep) {
          invoicingStep.status = 'active';
          invoicingStep.actionRequired = true;
          invoicingStep.instruction = `Action requise : Générer la facture pour la livraison #${workflow.orderNumber}`;
        }
        
        toast({
          title: "Livraison confirmée",
          description: `La livraison pour ${workflow.clientName} a été confirmée.`,
        });
        break;

      case 'invoicing':
        // Générer la facture
        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        step.completedBy = user?.email || 'Utilisateur';
        workflow.currentStep = 4;
        
        // Activer l'étape suivante
        const paymentStep = workflow.steps.find(s => s.id === 'payment');
        if (paymentStep) {
          paymentStep.status = 'active';
          paymentStep.actionRequired = true;
          paymentStep.instruction = `Action requise : Enregistrer le paiement pour la facture #FAC-${workflow.orderNumber}`;
        }
        
        toast({
          title: "Facture générée",
          description: `La facture pour ${workflow.clientName} a été générée avec succès.`,
        });
        break;

      case 'payment':
        // Enregistrer le paiement
        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        step.completedBy = user?.email || 'Utilisateur';
        workflow.currentStep = 5;
        workflow.isCompleted = true;
        
        toast({
          title: "Paiement enregistré",
          description: `Le paiement pour ${workflow.clientName} a été enregistré avec succès.`,
        });
        break;
    }
  };

  // Handlers pour les workflows fournisseurs
  const handleSupplierStepAction = (workflowId: string, stepId: string) => {
    const workflow = mockSupplierWorkflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step || !step.actionRequired) return;

    // Traitement selon l'étape
    switch (stepId) {
      case 'delivery':
        // Confirmer la réception
        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        step.completedBy = user?.email || 'Utilisateur';
        workflow.currentStep = 3;
        
        // Activer l'étape suivante
        const invoicingStep = workflow.steps.find(s => s.id === 'invoicing');
        if (invoicingStep) {
          invoicingStep.status = 'active';
          invoicingStep.actionRequired = true;
          invoicingStep.instruction = `Action requise : Traiter la facture fournisseur #${workflow.purchaseOrderNumber}`;
        }
        
        toast({
          title: "Réception confirmée",
          description: `La réception de ${workflow.supplierName} a été confirmée.`,
        });
        break;

      case 'invoicing':
        // Traiter la facture fournisseur
        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        step.completedBy = user?.email || 'Utilisateur';
        workflow.currentStep = 4;
        
        // Activer l'étape suivante
        const paymentStep = workflow.steps.find(s => s.id === 'payment');
        if (paymentStep) {
          paymentStep.status = 'active';
          paymentStep.actionRequired = true;
          paymentStep.instruction = `Action requise : Effectuer le paiement à ${workflow.supplierName}`;
        }
        
        toast({
          title: "Facture traitée",
          description: `La facture de ${workflow.supplierName} a été traitée avec succès.`,
        });
        break;

      case 'payment':
        // Effectuer le paiement
        step.status = 'completed';
        step.completedAt = new Date().toISOString();
        step.completedBy = user?.email || 'Utilisateur';
        workflow.currentStep = 5;
        workflow.isCompleted = true;
        
        toast({
          title: "Paiement effectué",
          description: `Le paiement à ${workflow.supplierName} a été effectué avec succès.`,
        });
        break;
    }
  };

  // Export des workflows
  const exportWorkflows = (type: 'client' | 'supplier') => {
    try {
      const workflows = type === 'client' ? mockClientWorkflows : mockSupplierWorkflows;
      const csvContent = [
        ['N° Commande', 'Client/Fournisseur', 'Date commande', 'Date livraison', 'Montant', 'Étape actuelle', 'Statut'],
        ...workflows.map(workflow => [
          type === 'client' ? workflow.orderNumber : workflow.purchaseOrderNumber,
          type === 'client' ? workflow.clientName : workflow.supplierName,
          workflow.orderDate,
          workflow.deliveryDate,
          formatFCFA(workflow.totalAmount),
          workflow.currentStep.toString(),
          workflow.isCompleted ? 'Terminé' : 'En cours'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}_workflows_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export terminé",
        description: `Les workflows ${type === 'client' ? 'clients' : 'fournisseurs'} ont été exportés.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export.",
        variant: "destructive"
      });
    }
  };

  // Générer facture PDF
  const generateInvoicePDF = (workflowId: string, type: 'client' | 'supplier') => {
    const workflow = type === 'client' 
      ? mockClientWorkflows.find(w => w.id === workflowId)
      : mockSupplierWorkflows.find(w => w.id === workflowId);
    
    if (!workflow) return;

    // Simulation de génération PDF
    toast({
      title: "PDF généré",
      description: `Facture PDF générée pour ${type === 'client' ? workflow.clientName : workflow.supplierName}.`,
    });
  };

  // Envoyer facture par email
  const sendInvoiceEmail = (workflowId: string, type: 'client' | 'supplier') => {
    const workflow = type === 'client' 
      ? mockClientWorkflows.find(w => w.id === workflowId)
      : mockSupplierWorkflows.find(w => w.id === workflowId);
    
    if (!workflow) return;

    // Simulation d'envoi email
    toast({
      title: "Email envoyé",
      description: `Facture envoyée par email à ${type === 'client' ? workflow.clientEmail : workflow.supplierEmail}.`,
    });
  };

  const getStepIcon = (step: WorkflowStep) => {
    const IconComponent = step.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-400 bg-gray-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'blocked': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Statistiques
  const clientStats = {
    total: clientWorkflows.length,
    active: clientWorkflows.filter(w => !w.isCompleted).length,
    completed: clientWorkflows.filter(w => w.isCompleted).length,
    totalAmount: clientWorkflows.reduce((sum, w) => sum + w.totalAmount, 0)
  };

  const supplierStats = {
    total: supplierWorkflows.length,
    active: supplierWorkflows.filter(w => !w.isCompleted).length,
    completed: supplierWorkflows.filter(w => w.isCompleted).length,
    totalAmount: supplierWorkflows.reduce((sum, w) => sum + w.totalAmount, 0)
  };

  return (
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold">Système de Facturation</h1>
            <p className="text-muted-foreground">
            Workflows clients et fournisseurs avec étapes séquentielles
            </p>
          </div>
          {canManageInvoices && (
            <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportWorkflows('client')}>
                <Download className="h-4 w-4 mr-2" />
                Exporter Workflows Clients
              </Button>
            <Button variant="outline" onClick={() => exportWorkflows('supplier')}>
                <Download className="h-4 w-4 mr-2" />
                Exporter Workflows Fournisseurs
              </Button>
            </div>
          )}
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Workflows Clients ({clientWorkflows.length})
          </TabsTrigger>
          <TabsTrigger value="supplier" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Workflows Fournisseurs ({supplierWorkflows.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client" className="space-y-4">
          {/* Statistiques workflows clients */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Total workflows</p>
                    <p className="text-2xl font-bold">{clientStats.total}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En cours</p>
                    <p className="text-2xl font-bold text-blue-600">{clientStats.active}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Terminés</p>
                    <p className="text-2xl font-bold text-green-600">{clientStats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Montant total</p>
                    <p className="text-2xl font-bold">{formatFCFA(clientStats.totalAmount)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par numéro de commande ou client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">En cours</option>
                    <option value="completed">Terminés</option>
                  </select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des workflows clients */}
          <div className="space-y-4">
            {filteredClientWorkflows.map((workflow) => (
              <Card key={workflow.id} className={cn(
                "transition-all duration-200",
                workflow.isCompleted ? "border-green-200 bg-green-50/50" : "border-blue-200 bg-blue-50/50"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {workflow.orderNumber}
                        {workflow.isCompleted && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terminé
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Client: {workflow.clientName} • {workflow.clientEmail}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatFCFA(workflow.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">
                        Avance: {formatFCFA(workflow.advanceAmount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Workflow Steps */}
                  <div className="space-y-4">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-4">
                        {/* Step Icon */}
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full",
                          getStepStatusColor(step.status)
                        )}>
                          {getStepStatusIcon(step.status)}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {getStepIcon(step)}
                                {step.name}
                                {step.actionRequired && (
                                  <Badge variant="destructive" className="ml-2">
                                    Action requise
                                  </Badge>
                                )}
                              </h4>
                              <p className={cn(
                                "text-sm mt-1",
                                step.status === 'active' ? "text-blue-700 font-medium" : "text-muted-foreground"
                              )}>
                                {step.instruction}
                              </p>
                              {step.completedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Terminé le {new Date(step.completedAt).toLocaleDateString('fr-FR')} par {step.completedBy}
                                </p>
                              )}
                            </div>
                            {step.actionRequired && (
                              <Button 
                                size="sm"
                                onClick={() => handleClientStepAction(workflow.id, step.id)}
                              >
                                Valider
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        {index < workflow.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="supplier" className="space-y-4">
          {/* Statistiques workflows fournisseurs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Total workflows</p>
                    <p className="text-2xl font-bold">{supplierStats.total}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">En cours</p>
                    <p className="text-2xl font-bold text-blue-600">{supplierStats.active}</p>
                  </div>
                  <Play className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Terminés</p>
                    <p className="text-2xl font-bold text-green-600">{supplierStats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Montant total</p>
                    <p className="text-2xl font-bold">{formatFCFA(supplierStats.totalAmount)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Filtres et recherche */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                      placeholder="Rechercher par numéro d'achat ou fournisseur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                    className="border rounded px-2 py-1"
                      value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                    <option value="active">En cours</option>
                    <option value="completed">Terminés</option>
                    </select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Liste des workflows fournisseurs */}
          <div className="space-y-4">
            {filteredSupplierWorkflows.map((workflow) => (
              <Card key={workflow.id} className={cn(
                "transition-all duration-200",
                workflow.isCompleted ? "border-green-200 bg-green-50/50" : "border-blue-200 bg-blue-50/50"
              )}>
              <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {workflow.purchaseOrderNumber}
                        {workflow.isCompleted && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terminé
                          </Badge>
                        )}
                      </CardTitle>
                <CardDescription>
                        Fournisseur: {workflow.supplierName} • {workflow.supplierEmail}
                </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatFCFA(workflow.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">
                        Date commande: {new Date(workflow.orderDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
              </CardHeader>
              <CardContent>
                  {/* Workflow Steps */}
                  <div className="space-y-4">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-4">
                        {/* Step Icon */}
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full",
                          getStepStatusColor(step.status)
                        )}>
                          {getStepStatusIcon(step.status)}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {getStepIcon(step)}
                                {step.name}
                                {step.actionRequired && (
                                  <Badge variant="destructive" className="ml-2">
                                    Action requise
                                  </Badge>
                                )}
                              </h4>
                              <p className={cn(
                                "text-sm mt-1",
                                step.status === 'active' ? "text-blue-700 font-medium" : "text-muted-foreground"
                              )}>
                                {step.instruction}
                              </p>
                              {step.completedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Terminé le {new Date(step.completedAt).toLocaleDateString('fr-FR')} par {step.completedBy}
                                </p>
                              )}
                            </div>
                            {step.actionRequired && (
                              <Button 
                                size="sm"
                                onClick={() => handleSupplierStepAction(workflow.id, step.id)}
                              >
                                Valider
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        {index < workflow.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                  </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}