import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isDemoMode } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Users, Settings, Save, Calculator, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SyscohadaSettingsPage } from '@/pages/SyscohadaSettingsPage';
import { UserManagement } from '@/components/settings/UserManagement';
import { DataExport } from '@/components/settings/DataExport';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const isDemo = user ? isDemoMode(user.id) : false;

  const [company, setCompany] = useState({
    name: '', address: '', city: '', country: '', phone: '', email: '',
    ninea: '', rccm: '', legal: ''
  });

  const [preferences, setPreferences] = useState({
    language: 'fr', currency: 'XOF', theme: 'light', notifications: true
  });

  const canManageSettings = ['owner', 'manager'].includes(user?.role || '');

  useEffect(() => {
    if (!user || isDemo) {
      setLoadingCompany(false);
      if (isDemo) setCompany(c => ({ ...c, name: 'Atelier Démo' }));
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.companyId)
          .single();

        if (error) throw error;
        if (data) {
          setCompany({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            country: data.country || '',
            ninea: data.ninea || '',
            rccm: data.rccm || '',
            legal: data.legal_notice || '',
          });
        }
      } catch (err: any) {
        console.error('Error loading company:', err);
      } finally {
        setLoadingCompany(false);
      }
    })();
  }, [user, isDemo]);

  const handleSaveCompany = async () => {
    if (!user || isDemo) {
      toast({ title: 'Mode démo', description: 'Les modifications ne sont pas sauvegardées.' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: company.name,
          email: company.email,
          phone: company.phone || null,
          address: company.address || null,
          city: company.city || null,
          country: company.country || null,
          ninea: company.ninea || null,
          rccm: company.rccm || null,
          legal_notice: company.legal || null,
        })
        .eq('id', user.companyId);

      if (error) throw error;
      toast({ title: 'Succès', description: 'Informations de l\'entreprise enregistrées.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = () => {
    toast({ title: 'Succès', description: 'Préférences enregistrées.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configuration de l'entreprise, des utilisateurs et du système</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company"><Building2 className="inline h-4 w-4 mr-1" />Entreprise</TabsTrigger>
          <TabsTrigger value="users"><Users className="inline h-4 w-4 mr-1" />Utilisateurs</TabsTrigger>
          <TabsTrigger value="syscohada"><Calculator className="inline h-4 w-4 mr-1" />SYSCOHADA</TabsTrigger>
          <TabsTrigger value="preferences"><Settings className="inline h-4 w-4 mr-1" />Préférences</TabsTrigger>
          <TabsTrigger value="backup"><Save className="inline h-4 w-4 mr-1" />Sauvegarde</TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>Modifiez les informations légales et de contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingCompany ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company-name">Nom de l'entreprise *</Label>
                      <Input id="company-name" value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="company-email">Email</Label>
                      <Input id="company-email" type="email" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="company-phone">Téléphone</Label>
                      <Input id="company-phone" value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="company-address">Adresse</Label>
                      <Input id="company-address" value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="company-city">Ville</Label>
                      <Input id="company-city" value={company.city} onChange={e => setCompany(c => ({ ...c, city: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="company-country">Pays</Label>
                      <Input id="company-country" value={company.country} onChange={e => setCompany(c => ({ ...c, country: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="company-ninea">NINEA</Label>
                      <Input id="company-ninea" value={company.ninea} onChange={e => setCompany(c => ({ ...c, ninea: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="company-rccm">RCCM</Label>
                      <Input id="company-rccm" value={company.rccm} onChange={e => setCompany(c => ({ ...c, rccm: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="company-legal">Mentions légales</Label>
                      <Textarea id="company-legal" value={company.legal} onChange={e => setCompany(c => ({ ...c, legal: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveCompany} disabled={!canManageSettings || saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Enregistrer
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        {/* SYSCOHADA Tab */}
        <TabsContent value="syscohada">
          <SyscohadaSettingsPage />
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences système</CardTitle>
              <CardDescription>Personnalisez l'expérience de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pref-lang">Langue</Label>
                  <Input id="pref-lang" value={preferences.language} onChange={e => setPreferences(p => ({ ...p, language: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="pref-currency">Devise</Label>
                  <Input id="pref-currency" value={preferences.currency} onChange={e => setPreferences(p => ({ ...p, currency: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} disabled={!canManageSettings}>Enregistrer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4">
          <DataExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
