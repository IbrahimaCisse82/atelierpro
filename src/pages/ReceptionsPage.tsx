import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReceptions } from '@/hooks/use-receptions';
import { useSuppliers } from '@/hooks/use-suppliers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Eye, 
  CheckCircle,
  Clock,
  Package,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatFCFA } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ReceptionsPage() {
  const { user } = useAuth();
  const { receptions, isLoading, createReception, updateReception, validateReception } = useReceptions();
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    supplier_id: '',
    reception_date: new Date().toISOString().split('T')[0],
    delivery_note_reference: '',
    invoice_reference: '',
    total_amount: 0,
    discount_amount: 0,
    tax_amount: 0,
    notes: '',
  });

  // Permissions - Respecte la ségrégation des tâches
  const canManage = ['owner', 'manager', 'stocks'].includes(user?.role || '');

  const statuses = [
    { value: 'all', label: 'Tous les statuts', icon: Package },
    { value: 'draft', label: 'Brouillon', icon: Clock, color: 'bg-gray-500' },
    { value: 'received', label: 'Reçu', icon: Package, color: 'bg-blue-500' },
    { value: 'inspected', label: 'Inspecté', icon: Eye, color: 'bg-orange-500' },
    { value: 'validated', label: 'Validé', icon: CheckCircle, color: 'bg-green-500' },
    { value: 'rejected', label: 'Rejeté', icon: XCircle, color: 'bg-red-500' },
  ];

  const filteredReceptions = receptions.filter(reception => {
    const matchesSearch = reception.reception_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reception.delivery_note_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reception.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status);
    if (!statusConfig) return null;
    
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalWithTax = formData.total_amount - formData.discount_amount + formData.tax_amount;
    
    createReception({
      ...formData,
      total_with_tax: totalWithTax,
      status: 'draft' as any,
    } as any);
    
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      reception_date: new Date().toISOString().split('T')[0],
      delivery_note_reference: '',
      invoice_reference: '',
      total_amount: 0,
      discount_amount: 0,
      tax_amount: 0,
      notes: '',
    });
  };

  const handleValidate = (id: string) => {
    if (confirm('Valider cette réception et mettre à jour le stock ?')) {
      validateReception(id);
    }
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateReception({ id, status });
  };

  // Statistiques
  const stats = {
    total: receptions.length,
    draft: receptions.filter(r => r.status === 'draft').length,
    pending: receptions.filter(r => ['received', 'inspected'].includes(r.status)).length,
    validated: receptions.filter(r => r.status === 'validated').length,
    rejected: receptions.filter(r => r.status === 'rejected').length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Réceptions de marchandises</h1>
        </div>

        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" /> Nouvelle réception
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle réception</DialogTitle>
                <DialogDescription>
                  Enregistrez une nouvelle réception de marchandises
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier_id">Fournisseur *</Label>
                    <Select 
                      value={formData.supplier_id} 
                      onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reception_date">Date de réception *</Label>
                    <Input
                      id="reception_date"
                      type="date"
                      value={formData.reception_date}
                      onChange={(e) => setFormData({ ...formData, reception_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="delivery_note_reference">Bon de livraison</Label>
                    <Input
                      id="delivery_note_reference"
                      value={formData.delivery_note_reference}
                      onChange={(e) => setFormData({ ...formData, delivery_note_reference: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="invoice_reference">Facture fournisseur</Label>
                    <Input
                      id="invoice_reference"
                      value={formData.invoice_reference}
                      onChange={(e) => setFormData({ ...formData, invoice_reference: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="total_amount">Montant HT (F CFA) *</Label>
                    <Input
                      id="total_amount"
                      type="number"
                      step="0.01"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount_amount">Remise (F CFA)</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      step="0.01"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tax_amount">TVA (F CFA)</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      step="0.01"
                      value={formData.tax_amount}
                      onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label>Total TTC (F CFA)</Label>
                    <div className="text-2xl font-bold text-primary">
                      {formatFCFA(formData.total_amount - formData.discount_amount + formData.tax_amount)}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Validées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou bon de livraison..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des réceptions */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des réceptions</CardTitle>
          <CardDescription>{filteredReceptions.length} réception(s) trouvée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>BL / Facture</TableHead>
                <TableHead className="text-right">Montant TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucune réception trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceptions.map((reception) => (
                  <TableRow key={reception.id}>
                    <TableCell className="font-mono text-sm">{reception.reception_number}</TableCell>
                    <TableCell>
                      {format(new Date(reception.reception_date), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {(reception as any).suppliers?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {reception.delivery_note_reference && (
                          <div className="text-muted-foreground">BL: {reception.delivery_note_reference}</div>
                        )}
                        {reception.invoice_reference && (
                          <div>Fact: {reception.invoice_reference}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatFCFA(reception.total_with_tax)}
                    </TableCell>
                    <TableCell>{getStatusBadge(reception.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canManage && reception.status === 'inspected' && (
                          <Button
                            size="sm"
                            onClick={() => handleValidate(reception.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Valider
                          </Button>
                        )}
                        {canManage && reception.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(reception.id, 'received')}
                          >
                            Marquer reçu
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReceptionsPage;