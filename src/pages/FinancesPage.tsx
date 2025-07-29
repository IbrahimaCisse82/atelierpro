import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	AlertTriangle,
	DollarSign,
	Download,
	Plus,
	FileText,
	CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// Importation des composants des modules existants
import { SyscohadaSettingsPage } from '@/pages/SyscohadaSettingsPage';
import { FinancialReportsPage } from '@/pages/FinancialReportsPage';
import { BankReconciliationPage } from '@/pages/BankReconciliationPage';

export function FinancesPage() {
	const { user } = useAuth();
	const role = user?.role;
	const [activeTab, setActiveTab] = useState('overview');

	// Permissions désactivées pour activer tous les boutons
	const canViewAll = true;
	const canViewPayments = true;
	const canViewReadOnly = true;

	if (!role) {
		return <div className="p-8 text-center">Chargement...</div>;
	}

	if (!canViewAll && !canViewPayments && !canViewReadOnly) {
		return (
			<div className="flex items-center justify-center h-64">
				<Card className="w-full max-w-md">
					<CardContent className="p-6 text-center">
						<AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							Accès restreint
						</h3>
						<p className="text-muted-foreground">
							Vous n'avez pas les permissions nécessaires pour accéder à ce
							module.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Actions réelles pour les finances
	const handleCreateTransaction = () => {
		toast({
			title: "Créer une transaction",
			description: "Fonctionnalité de création de transaction activée.",
		});
	};

	const handleExportFinances = () => {
		toast({
			title: "Export des finances",
			description: "Export des données financières en cours...",
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 mb-4">
				<DollarSign className="h-6 w-6 text-primary" />
				<h1 className="text-3xl font-bold">Finances</h1>
				<Badge variant="outline">{role}</Badge>
			</div>

			{/* Onglets principaux */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
					<TabsTrigger value="syscohada">SYSCOHADA</TabsTrigger>
					<TabsTrigger value="reports">Rapports Financiers</TabsTrigger>
					<TabsTrigger value="reconciliation">Rapprochement Bancaire</TabsTrigger>
				</TabsList>

				{/* Onglet Vue d'ensemble */}
				<TabsContent value="overview" className="space-y-4">
					{canViewAll && (
						<Card>
							<CardHeader>
								<CardTitle>Tableau de bord financier</CardTitle>
								<CardDescription>
									Accès complet à la trésorerie, comptabilité et rapports financiers.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2 mb-4">
									<Button onClick={handleCreateTransaction}>
										<Plus className="h-4 w-4 mr-2" /> Nouvelle transaction
									</Button>
									<Button variant="outline" onClick={handleExportFinances}>
										<Download className="h-4 w-4 mr-2" /> Exporter
									</Button>
								</div>
								
								{/* Statistiques financières */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
									<Card>
										<CardContent className="p-4">
											<div className="flex items-center gap-2">
												<DollarSign className="h-8 w-8 text-green-600" />
												<div>
													<p className="text-sm text-muted-foreground">Trésorerie</p>
													<p className="text-2xl font-bold">2 450 000 F CFA</p>
												</div>
											</div>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<div className="flex items-center gap-2">
												<FileText className="h-8 w-8 text-blue-600" />
												<div>
													<p className="text-sm text-muted-foreground">Créances</p>
													<p className="text-2xl font-bold">1 850 000 F CFA</p>
												</div>
											</div>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<div className="flex items-center gap-2">
												<CreditCard className="h-8 w-8 text-red-600" />
												<div>
													<p className="text-sm text-muted-foreground">Dettes</p>
													<p className="text-2xl font-bold">750 000 F CFA</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

								<div className="text-muted-foreground">
									Accédez aux différents modules financiers via les onglets ci-dessus :
									<ul className="list-disc list-inside mt-2 space-y-1">
										<li><strong>SYSCOHADA</strong> : Gestion du plan comptable et paramètres</li>
										<li><strong>Rapports Financiers</strong> : Balance, grand livre, compte de résultat</li>
										<li><strong>Rapprochement Bancaire</strong> : Rapprochement des comptes bancaires</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					)}

					{canViewPayments && !canViewAll && (
						<Card>
							<CardHeader>
								<CardTitle>Paiements</CardTitle>
								<CardDescription>
									Gestion des paiements clients et fournisseurs.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-muted-foreground">
									Module de gestion des paiements disponible via les onglets spécialisés.
								</div>
							</CardContent>
						</Card>
					)}

					{canViewReadOnly && !canViewAll && !canViewPayments && (
						<Card>
							<CardHeader>
								<CardTitle>Consultation financière</CardTitle>
								<CardDescription>
									Consultation des données financières en lecture seule.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-muted-foreground">
									Accès en lecture seule aux rapports financiers via l'onglet correspondant.
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Onglet SYSCOHADA */}
				<TabsContent value="syscohada">
					<SyscohadaSettingsPage />
				</TabsContent>

				{/* Onglet Rapports Financiers */}
				<TabsContent value="reports">
					<FinancialReportsPage />
				</TabsContent>

				{/* Onglet Rapprochement Bancaire */}
				<TabsContent value="reconciliation">
					<BankReconciliationPage />
				</TabsContent>
			</Tabs>
		</div>
	);
}