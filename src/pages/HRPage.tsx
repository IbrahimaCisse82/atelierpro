import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	AlertTriangle,
	Users,
	DollarSign,
	Calendar,
	CheckCircle,
} from 'lucide-react';

export function HRPage() {
	const { user } = useAuth();
	const role = user?.role;

	// Permissions désactivées pour activer tous les boutons
	const canViewAll = true;
	const canViewPlanning = true;
	const canViewPersonal = true;

	if (!role) {
		return <div className="p-8 text-center">Chargement...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 mb-4">
				<Users className="h-6 w-6 text-primary" />
				<h1 className="text-3xl font-bold">Ressources Humaines</h1>
				<Badge variant="outline">{role}</Badge>
			</div>
			{canViewAll && (
				<Card>
					<CardHeader>
						<CardTitle>Gestion des employés</CardTitle>
						<CardDescription>
							Accès complet aux fiches, paie, statistiques et documents RH.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* TODO: Table des employés, actions CRUD, calcul paie, stats, etc. */}
						<div className="text-muted-foreground">
							Module RH complet à implémenter.
						</div>
					</CardContent>
				</Card>
			)}
			{canViewPlanning && !canViewAll && (
				<Card>
					<CardHeader>
						<CardTitle>Planning des tailleurs</CardTitle>
						<CardDescription>
							Visualisation du planning et des performances (sans données
							salariales).
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* TODO: Planning, stats, absences, etc. */}
						<div className="text-muted-foreground">
							Planning RH à implémenter.
						</div>
					</CardContent>
				</Card>
			)}
			{canViewPersonal && !canViewAll && !canViewPlanning && (
				<Card>
					<CardHeader>
						<CardTitle>Mon Profil RH</CardTitle>
						<CardDescription>
							Accès à vos données personnelles, bulletins de paie et
							évaluations.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* TODO: Fiche personnelle, paie, évaluations, etc. */}
						<div className="text-muted-foreground">
							Profil RH personnel à implémenter.
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}