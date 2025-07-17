import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { User, Settings, Users, Shield, Download, Upload, Save, RefreshCw, Building2, Globe, Palette, Bell, KeyRound, Mail, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function SettingsPage() {
	const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('company');

  // États pour le formulaire Entreprise
  const [company, setCompany] = useState({
    name: 'AtelierPro',
    logo: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    ninea: '',
    rccm: '',
    legal: ''
  });

  // États pour Préférences
  const [preferences, setPreferences] = useState({
    language: 'fr',
    currency: 'XOF',
    theme: 'light',
    notifications: true
  });

  // Permissions (exemple)
  const canManageSettings = ['owner', 'manager'].includes(user?.role || '');

  // Handlers de sauvegarde (mock)
  const handleSaveCompany = () => {
    toast({ title: 'Succès', description: 'Informations de l’entreprise enregistrées.' });
  };
  const handleSavePreferences = () => {
    toast({ title: 'Succès', description: 'Préférences enregistrées.' });
  };
  const handleBackup = () => {
    toast({ title: 'Export', description: 'Sauvegarde exportée.' });
  };
  const handleRestore = () => {
    toast({ title: 'Import', description: 'Restauration effectuée.' });
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configuration de l’entreprise, des utilisateurs et du système</p>
				</div>
			</div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company"><Building2 className="inline h-4 w-4 mr-1" />Entreprise</TabsTrigger>
          <TabsTrigger value="users"><Users className="inline h-4 w-4 mr-1" />Utilisateurs</TabsTrigger>
          <TabsTrigger value="preferences"><Settings className="inline h-4 w-4 mr-1" />Préférences</TabsTrigger>
          <TabsTrigger value="backup"><Save className="inline h-4 w-4 mr-1" />Sauvegarde</TabsTrigger>
        </TabsList>

        {/* Onglet Entreprise */}
        <TabsContent value="company" className="space-y-4">
			<Card>
				<CardHeader>
              <CardTitle>Informations de l’entreprise</CardTitle>
              <CardDescription>Modifiez les informations légales et de contact de votre atelier</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Nom de l’entreprise *</Label>
                  <Input id="company-name" value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="company-logo">Logo</Label>
                  <Input id="company-logo" type="file" />
                </div>
                <div>
                  <Label htmlFor="company-address">Adresse *</Label>
                  <Input id="company-address" value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="company-city">Ville *</Label>
                  <Input id="company-city" value={company.city} onChange={e => setCompany(c => ({ ...c, city: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="company-country">Pays *</Label>
                  <Input id="company-country" value={company.country} onChange={e => setCompany(c => ({ ...c, country: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="company-phone">Téléphone *</Label>
                  <Input id="company-phone" value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="company-email">Email *</Label>
                  <Input id="company-email" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} />
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
                <Button onClick={handleSaveCompany} disabled={!canManageSettings}>Enregistrer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Utilisateurs */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>Invitez, modifiez ou désactivez les utilisateurs de l’atelier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center py-8">
                (Gestion des utilisateurs à connecter à la base Supabase)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Préférences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences système</CardTitle>
              <CardDescription>Personnalisez l’expérience de l’application</CardDescription>
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
                <div>
                  <Label htmlFor="pref-theme">Thème</Label>
                  <Input id="pref-theme" value={preferences.theme} onChange={e => setPreferences(p => ({ ...p, theme: e.target.value }))} />
					</div>
					<div>
                  <Label htmlFor="pref-notif">Notifications</Label>
                  <Input id="pref-notif" type="checkbox" checked={preferences.notifications} onChange={e => setPreferences(p => ({ ...p, notifications: e.target.checked }))} />
                </div>
					</div>
					<div className="flex justify-end">
                <Button onClick={handleSavePreferences} disabled={!canManageSettings}>Enregistrer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sauvegarde/Restauration */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sauvegarde & Restauration</CardTitle>
              <CardDescription>Exportez ou importez les données de l’atelier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleBackup}>
                  <Download className="h-4 w-4 mr-2" />Exporter les données
						</Button>
                <Button variant="outline" onClick={handleRestore}>
                  <Upload className="h-4 w-4 mr-2" />Importer une sauvegarde
						</Button>
					</div>
              <div className="text-muted-foreground text-xs mt-2">
                (Fonctionnalités avancées à connecter à la logique métier et à la base de données)
              </div>
				</CardContent>
			</Card>
        </TabsContent>
      </Tabs>
		</div>
	);
}

export default SettingsPage;