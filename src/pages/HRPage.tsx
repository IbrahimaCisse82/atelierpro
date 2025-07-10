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
	Plus,
	Download,
	Eye,
	Edit,
	Trash2,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function HRPage() {
	const { user } = useAuth();
	const role = user?.role;

	// Permissions désactivées pour activer tous les boutons
	const canViewAll = true;
	const canViewPlanning = true;
	const canViewPersonal = true;

	// Toast handler générique
	const handleComingSoon = (action: string) => {
		toast({
			title: 'Fonctionnalité à venir',
			description: `L'action « ${action} » sera bientôt disponible.`,
		});
	};

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
						<div className="flex items-center gap-2 mb-4">
							<h2 className="text-2xl font-semibold">Employés</h2>
							<Badge variant="outline">
								{/* TODO: Get total employees count */}
								{'0'} employés
							</Badge>
						</div>
						<div className="flex items-center gap-2 mb-4">
							<Button onClick={() => handleComingSoon('Ajouter un employé')}>
								<Plus className="h-4 w-4 mr-2" /> Nouvel employé
							</Button>
							<Button variant="outline" onClick={() => handleComingSoon('Exporter')}>
								<Download className="h-4 w-4 mr-2" /> Exporter
							</Button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card>
								<CardHeader>
									<CardTitle>Fiches de présence</CardTitle>
									<CardDescription>
										Visualisez et gérez les fiches de présence des employés.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-2 mb-4">
										<h3 className="text-xl font-bold">Présence</h3>
										<Badge variant="outline">
											{/* TODO: Get total absences count */}
											{'0'} absences
										</Badge>
									</div>
									<div className="flex items-center gap-2 mb-4">
										<Button variant="ghost" size="sm" onClick={() => handleComingSoon('Voir')}>
											<Eye className="h-4 w-4" />
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
							<Card>
								<CardHeader>
									<CardTitle>Bulletins de paie</CardTitle>
									<CardDescription>
										Accédez aux bulletins de paie et aux détails de la paie.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-2 mb-4">
										<h3 className="text-xl font-bold">Paie</h3>
										<Badge variant="outline">
											{/* TODO: Get total payrolls count */}
											{'0'} bulletins
										</Badge>
									</div>
									<div className="flex items-center gap-2 mb-4">
										<Button variant="ghost" size="sm" onClick={() => handleComingSoon('Voir')}>
											<Eye className="h-4 w-4" />
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
							<Card>
								<CardHeader>
									<CardTitle>Évaluations</CardTitle>
									<CardDescription>
										Suivez et gérez les évaluations des employés.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-2 mb-4">
										<h3 className="text-xl font-bold">Évaluations</h3>
										<Badge variant="outline">
											{/* TODO: Get total evaluations count */}
											{'0'} évaluations
										</Badge>
									</div>
									<div className="flex items-center gap-2 mb-4">
										<Button variant="ghost" size="sm" onClick={() => handleComingSoon('Voir')}>
											<Eye className="h-4 w-4" />
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
							<Card>
								<CardHeader>
									<CardTitle>Documents RH</CardTitle>
									<CardDescription>
										Accédez aux documents RH et gérez les fichiers.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-2 mb-4">
										<h3 className="text-xl font-bold">Documents</h3>
										<Badge variant="outline">
											{/* TODO: Get total documents count */}
											{'0'} documents
										</Badge>
									</div>
									<div className="flex items-center gap-2 mb-4">
										<Button variant="ghost" size="sm" onClick={() => handleComingSoon('Voir')}>
											<Eye className="h-4 w-4" />
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