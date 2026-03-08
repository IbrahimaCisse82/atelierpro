import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMeasurements } from '@/hooks/use-measurements';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Ruler, Plus, Search, Eye, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const measurementLabels: Record<string, string> = {
  chest: 'Tour de poitrine',
  waist: 'Tour de taille',
  hips: 'Tour de hanches',
  shoulder_width: 'Largeur épaule',
  arm_length: 'Longueur bras',
  inseam: 'Entre-jambes',
  neck: 'Tour de cou',
  back_length: 'Longueur dos',
};

export function MeasurementsPage() {
  const { user } = useAuth();
  const { measurements, isLoadingMeasurements, createMeasurement } = useMeasurements();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    client_id: '',
    measurement_type: 'standard',
    chest: '',
    waist: '',
    hips: '',
    shoulder_width: '',
    arm_length: '',
    inseam: '',
    neck: '',
    back_length: '',
    notes: '',
  });

  // Clients for dropdown
  const [clients, setClients] = React.useState<any[]>([]);
  React.useEffect(() => {
    supabase.from('clients').select('id, first_name, last_name').then(({ data }) => {
      if (data) setClients(data);
    });
  }, []);

  const filteredMeasurements = (measurements as any[]).filter((m: any) => {
    const clientName = `${m.client?.first_name || ''} ${m.client?.last_name || ''}`.toLowerCase();
    return clientName.includes(searchTerm.toLowerCase()) || (m.measurement_type || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreate = () => {
    if (!newMeasurement.client_id) {
      toast({ title: 'Erreur', description: 'Sélectionnez un client.', variant: 'destructive' });
      return;
    }

    // Get company_id from profile
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) return;
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', authUser.id).single();
      if (!profile) return;

      createMeasurement({
        client_id: newMeasurement.client_id,
        company_id: profile.company_id,
        measurement_type: newMeasurement.measurement_type,
        chest: newMeasurement.chest ? Number(newMeasurement.chest) : null,
        waist: newMeasurement.waist ? Number(newMeasurement.waist) : null,
        hips: newMeasurement.hips ? Number(newMeasurement.hips) : null,
        shoulder_width: newMeasurement.shoulder_width ? Number(newMeasurement.shoulder_width) : null,
        arm_length: newMeasurement.arm_length ? Number(newMeasurement.arm_length) : null,
        inseam: newMeasurement.inseam ? Number(newMeasurement.inseam) : null,
        neck: newMeasurement.neck ? Number(newMeasurement.neck) : null,
        back_length: newMeasurement.back_length ? Number(newMeasurement.back_length) : null,
        notes: newMeasurement.notes || null,
        created_by: authUser.id,
      });
    });

    setCreateDialogOpen(false);
    setNewMeasurement({ client_id: '', measurement_type: 'standard', chest: '', waist: '', hips: '', shoulder_width: '', arm_length: '', inseam: '', neck: '', back_length: '', notes: '' });
  };

  if (isLoadingMeasurements) {
    return <div className="flex items-center justify-center h-64"><p>Chargement...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Mesures Clients</h1>
          <Badge variant="outline">{measurements.length} fiche(s)</Badge>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nouvelle mesure</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Prendre de nouvelles mesures</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client *</Label>
                  <Select value={newMeasurement.client_id} onValueChange={v => setNewMeasurement(p => ({ ...p, client_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newMeasurement.measurement_type} onValueChange={v => setNewMeasurement(p => ({ ...p, measurement_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="robe">Robe</SelectItem>
                      <SelectItem value="costume">Costume</SelectItem>
                      <SelectItem value="pantalon">Pantalon</SelectItem>
                      <SelectItem value="chemise">Chemise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(measurementLabels).map(([key, label]) => (
                  <div key={key}>
                    <Label className="text-xs">{label} (cm)</Label>
                    <Input type="number" min={0} value={(newMeasurement as any)[key]} onChange={e => setNewMeasurement(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div><Label>Notes</Label><Textarea value={newMeasurement.notes} onChange={e => setNewMeasurement(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleCreate}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par client ou type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader><CardTitle>Fiches de mesures</CardTitle><CardDescription>{filteredMeasurements.length} fiche(s)</CardDescription></CardHeader>
        <CardContent>
          {filteredMeasurements.length === 0 ? (
            <div className="text-center py-8"><Ruler className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucune mesure enregistrée</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Poitrine</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Hanches</TableHead>
                  <TableHead>Épaule</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeasurements.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.client?.first_name || ''} {m.client?.last_name || ''}</TableCell>
                    <TableCell><Badge variant="outline">{m.measurement_type || 'standard'}</Badge></TableCell>
                    <TableCell>{m.chest ? `${m.chest} cm` : '-'}</TableCell>
                    <TableCell>{m.waist ? `${m.waist} cm` : '-'}</TableCell>
                    <TableCell>{m.hips ? `${m.hips} cm` : '-'}</TableCell>
                    <TableCell>{m.shoulder_width ? `${m.shoulder_width} cm` : '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{m.notes || '-'}</TableCell>
                    <TableCell>{new Date(m.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MeasurementsPage;
