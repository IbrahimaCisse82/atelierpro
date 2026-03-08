import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePatterns } from '@/hooks/use-patterns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Scissors, Plus, Search, Layers } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function PatternsPage() {
  const { user } = useAuth();
  const { models, patterns, isLoadingModels, isLoadingPatterns, createModel, createPattern } = usePatterns();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('patterns');
  const [createType, setCreateType] = useState<'model' | 'pattern' | null>(null);

  const [newModel, setNewModel] = useState({ name: '', description: '', category: '' });
  const [newPattern, setNewPattern] = useState({ name: '', description: '', model_id: '', size: '' });

  const filteredPatterns = (patterns || []).filter((p: any) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || (p.model?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModels = (models || []).filter((m: any) =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateModel = async () => {
    if (!newModel.name) { toast({ title: 'Erreur', description: 'Nom requis.', variant: 'destructive' }); return; }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', authUser.id).single();
    if (!profile) return;
    createModel({ name: newModel.name, description: newModel.description || null, category: newModel.category || null, company_id: profile.company_id, created_by: authUser.id } as any);
    setCreateType(null);
    setNewModel({ name: '', description: '', category: '' });
  };

  const handleCreatePattern = async () => {
    if (!newPattern.name) { toast({ title: 'Erreur', description: 'Nom requis.', variant: 'destructive' }); return; }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', authUser.id).single();
    if (!profile) return;
    createPattern({ name: newPattern.name, description: newPattern.description || null, model_id: newPattern.model_id || null, size: newPattern.size || null, company_id: profile.company_id, created_by: authUser.id } as any);
    setCreateType(null);
    setNewPattern({ name: '', description: '', model_id: '', size: '' });
  };

  if (isLoadingModels || isLoadingPatterns) {
    return <div className="flex items-center justify-center h-64"><p>Chargement...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Patronnages</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={createType === 'model'} onOpenChange={o => setCreateType(o ? 'model' : null)}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Nouveau modèle</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer un modèle</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nom *</Label><Input value={newModel.name} onChange={e => setNewModel(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Catégorie</Label><Input value={newModel.category} onChange={e => setNewModel(p => ({ ...p, category: e.target.value }))} placeholder="Ex: Robes, Costumes..." /></div>
                <div><Label>Description</Label><Textarea value={newModel.description} onChange={e => setNewModel(p => ({ ...p, description: e.target.value }))} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setCreateType(null)}>Annuler</Button><Button onClick={handleCreateModel}>Créer</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={createType === 'pattern'} onOpenChange={o => setCreateType(o ? 'pattern' : null)}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Nouveau patron</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer un patron</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nom *</Label><Input value={newPattern.name} onChange={e => setNewPattern(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Modèle associé</Label>
                  <Select value={newPattern.model_id} onValueChange={v => setNewPattern(p => ({ ...p, model_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {(models || []).map((m: any) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Taille</Label><Input value={newPattern.size} onChange={e => setNewPattern(p => ({ ...p, size: e.target.value }))} placeholder="Ex: S, M, L, 38, 40..." /></div>
                <div><Label>Description</Label><Textarea value={newPattern.description} onChange={e => setNewPattern(p => ({ ...p, description: e.target.value }))} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setCreateType(null)}>Annuler</Button><Button onClick={handleCreatePattern}>Créer</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Modèles</p><p className="text-2xl font-bold">{(models || []).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Patrons</p><p className="text-2xl font-bold">{(patterns || []).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Catégories</p><p className="text-2xl font-bold">{new Set((models || []).map((m: any) => m.category).filter(Boolean)).size}</p></CardContent></Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="patterns"><Scissors className="h-4 w-4 mr-2" /> Patrons ({(patterns || []).length})</TabsTrigger>
          <TabsTrigger value="models"><Layers className="h-4 w-4 mr-2" /> Modèles ({(models || []).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Patrons</CardTitle></CardHeader>
            <CardContent>
              {filteredPatterns.length === 0 ? (
                <div className="text-center py-8"><Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucun patron</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Modèle</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatterns.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-semibold">{p.name}</TableCell>
                        <TableCell><Badge variant="outline">{p.model?.name || '-'}</Badge></TableCell>
                        <TableCell>{p.size || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{p.description || '-'}</TableCell>
                        <TableCell>{new Date(p.created_at).toLocaleDateString('fr-FR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Modèles</CardTitle></CardHeader>
            <CardContent>
              {filteredModels.length === 0 ? (
                <div className="text-center py-8"><Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucun modèle</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-semibold">{m.name}</TableCell>
                        <TableCell><Badge variant="outline">{m.category || '-'}</Badge></TableCell>
                        <TableCell className="max-w-[200px] truncate">{m.description || '-'}</TableCell>
                        <TableCell>{new Date(m.created_at).toLocaleDateString('fr-FR')}</TableCell>
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

export default PatternsPage;
