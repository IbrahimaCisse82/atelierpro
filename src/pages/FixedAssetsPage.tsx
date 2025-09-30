import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFixedAssets } from '@/hooks/use-fixed-assets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building, Plus, Search, TrendingDown } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';

export function FixedAssetsPage() {
  const { user } = useAuth();
  const { assets, depreciations, isLoading, createAsset } = useFixedAssets();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    asset_name: '',
    asset_category: '',
    acquisition_date: new Date().toISOString().split('T')[0],
    acquisition_cost: 0,
    useful_life: 5,
    salvage_value: 0,
    depreciation_type: 'linear',
    is_active: true,
    notes: '',
  });

  const canManage = user?.role === 'owner';

  const filteredAssets = assets.filter(asset => 
    asset.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset(formData as any);
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      asset_name: '',
      asset_category: '',
      acquisition_date: new Date().toISOString().split('T')[0],
      acquisition_cost: 0,
      useful_life: 5,
      salvage_value: 0,
      depreciation_type: 'linear',
      is_active: true,
      notes: '',
    });
  };

  const totalValue = assets.reduce((sum, a) => sum + (a.net_book_value || 0), 0);
  const totalDepreciation = assets.reduce((sum, a) => sum + (a.accumulated_depreciation || 0), 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Immobilisations</h1>
        </div>

        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" /> Nouvelle immobilisation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle immobilisation</DialogTitle>
                <DialogDescription>Enregistrez un nouvel actif immobilisé</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="asset_name">Nom de l'actif *</Label>
                    <Input
                      id="asset_name"
                      value={formData.asset_name}
                      onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="asset_category">Catégorie *</Label>
                    <Input
                      id="asset_category"
                      value={formData.asset_category}
                      onChange={(e) => setFormData({ ...formData, asset_category: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="acquisition_date">Date d'acquisition *</Label>
                    <Input
                      id="acquisition_date"
                      type="date"
                      value={formData.acquisition_date}
                      onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="acquisition_cost">Coût d'acquisition (F CFA) *</Label>
                    <Input
                      id="acquisition_cost"
                      type="number"
                      step="0.01"
                      value={formData.acquisition_cost}
                      onChange={(e) => setFormData({ ...formData, acquisition_cost: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="useful_life">Durée d'utilité (années) *</Label>
                    <Input
                      id="useful_life"
                      type="number"
                      value={formData.useful_life}
                      onChange={(e) => setFormData({ ...formData, useful_life: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="salvage_value">Valeur résiduelle (F CFA)</Label>
                    <Input
                      id="salvage_value"
                      type="number"
                      step="0.01"
                      value={formData.salvage_value}
                      onChange={(e) => setFormData({ ...formData, salvage_value: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="depreciation_type">Méthode d'amortissement</Label>
                    <Select 
                      value={formData.depreciation_type} 
                      onValueChange={(value) => setFormData({ ...formData, depreciation_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linéaire</SelectItem>
                        <SelectItem value="declining_balance">Dégressif</SelectItem>
                      </SelectContent>
                    </Select>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valeur Nette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatFCFA(totalValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Amortissements Cumulés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatFCFA(totalDepreciation)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table des immobilisations */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des immobilisations</CardTitle>
          <CardDescription>{filteredAssets.length} actif(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Valeur d'achat</TableHead>
                <TableHead className="text-right">Amortissements</TableHead>
                <TableHead className="text-right">Valeur nette</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucune immobilisation trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-sm">{asset.asset_code}</TableCell>
                    <TableCell className="font-medium">{asset.asset_name}</TableCell>
                    <TableCell>{asset.asset_category}</TableCell>
                    <TableCell className="text-right">{formatFCFA(asset.acquisition_cost)}</TableCell>
                    <TableCell className="text-right text-orange-600">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingDown className="h-4 w-4" />
                        {formatFCFA(asset.accumulated_depreciation)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatFCFA(asset.net_book_value)}
                    </TableCell>
                    <TableCell>
                      {asset.is_active ? (
                        <Badge variant="default">Actif</Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
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

export default FixedAssetsPage;