import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Plus, Download, Edit, Trash2 } from 'lucide-react';

export function SettingsPage() {
	const { user } = useAuth();
	// Permissions désactivées pour activer tous les boutons
	const canViewSettings = true;
	if (!canViewSettings) {
		return (
			<div className="flex items-center justify-center h-64">
				<Card className="w-full max-w-md">
					<CardContent className="p-6 text-center">
						<SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
						<p className="text-muted-foreground">
							Vous n&apos;avez pas les permissions nécessaires pour accéder à ce
							module.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Toast handler générique
	const handleComingSoon = (action: string) => {
		toast({
			title: 'Fonctionnalité à venir',
			description: `L'action « ${action} » sera bientôt disponible.`,
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Paramètres</h1>
					<p className="text-muted-foreground">
						Configuration de l&apos;entreprise et préférences
					</p>
				</div>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Informations de l&apos;entreprise</CardTitle>
					<CardDescription>
						Modifiez les informations principales de votre atelier
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
							<Input
								id="companyName"
								placeholder="Nom de l'entreprise"
							/>
						</div>
						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="contact@atelier.com"
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="address">Adresse</Label>
						<Input
							id="address"
							placeholder="Adresse de l'atelier"
						/>
					</div>
					<div className="flex justify-end">
						<Button onClick={() => handleComingSoon('Ajouter un paramètre')}>
							<Plus className="h-4 w-4 mr-2" /> Nouveau paramètre
						</Button>
						<Button variant="outline" onClick={() => handleComingSoon('Exporter')}>
							<Download className="h-4 w-4 mr-2" /> Exporter
						</Button>
						<Button variant="ghost" size="sm" onClick={() => handleComingSoon('Modifier')}>
							<Edit className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="sm" onClick={() => handleComingSoon('Supprimer')}>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default SettingsPage;