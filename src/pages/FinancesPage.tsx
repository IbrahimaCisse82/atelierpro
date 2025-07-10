import React, { useEffect, useState } from 'react';
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
	DollarSign,
	BarChart3,
	CheckCircle,
	Download,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  totalWithTax: number;
  isPaid: boolean;
  paidAt: string | null;
  notes: string | null;
}

interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  isPaid: boolean;
  paidAt: string | null;
  notes: string | null;
}

export function FinancesPage() {
	const { user } = useAuth();
	const role = user?.role;

	// Permissions désactivées pour activer tous les boutons
	const canViewAll = true;
	const canViewPayments = true;
	const canViewClientPayments = true;
	const canViewSupplierPayments = true;
	const canViewReadOnly = true;

	// Factures clients
	const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editInvoice, setEditInvoice] = useState<CustomerInvoice | null>(null);

	// Factures fournisseurs
	const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoice[]>([]);
	const [loadingSup, setLoadingSup] = useState(false);
	const [searchSup, setSearchSup] = useState('');
	const [filterPaidSup, setFilterPaidSup] = useState<'all' | 'paid' | 'unpaid'>('all');

	useEffect(() => {
		const fetchInvoices = async () => {
			if (!user?.companyId) return;
			setLoading(true);
			const { data, error } = await supabase
				.from('customer_invoices')
				.select('*')
				.eq('company_id', user.companyId)
				.order('invoice_date', { ascending: false });
			setLoading(false);
			if (error) return;
			setInvoices((data || []).map((inv: Record<string, unknown>) => ({
				id: inv.id as string,
				invoiceNumber: inv.invoice_number as string,
				invoiceDate: inv.invoice_date as string,
				dueDate: inv.due_date as string,
				totalAmount: inv.total_amount as number,
				totalWithTax: inv.total_with_tax as number,
				isPaid: inv.is_paid as boolean,
				paidAt: inv.paid_at as string | null,
				notes: inv.notes as string | null,
			})));
		};
		fetchInvoices();
	}, [user]);

	useEffect(() => {
		const fetchSupplierInvoices = async () => {
			if (!user?.companyId) return;
			setLoadingSup(true);
			const { data, error } = await supabase
				.from('supplier_invoices')
				.select('*')
				.eq('company_id', user.companyId)
				.order('invoice_date', { ascending: false });
			setLoadingSup(false);
			if (error) return;
			setSupplierInvoices((data || []).map((inv: Record<string, unknown>) => ({
				id: inv.id as string,
				invoiceNumber: inv.invoice_number as string,
				invoiceDate: inv.invoice_date as string,
				dueDate: inv.due_date as string,
				totalAmount: inv.total_amount as number,
				isPaid: inv.is_paid as boolean,
				paidAt: inv.paid_at as string | null,
				notes: inv.notes as string | null,
			})));
		};
		fetchSupplierInvoices();
	}, [user]);

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

	function InvoiceForm({ invoice, onSave, onCancel }: { invoice: CustomerInvoice | null, onSave: (i: CustomerInvoice) => void, onCancel: () => void }) {
		const [form, setForm] = useState<CustomerInvoice>(invoice || {
			id: '', invoiceNumber: '', invoiceDate: '', dueDate: '', totalAmount: 0, totalWithTax: 0, isPaid: false, paidAt: null, notes: ''
		});
		return (
			<form className="space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
				<div className="grid grid-cols-2 gap-2">
					<Input placeholder="N° facture" value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} required />
					<Input type="date" value={form.invoiceDate} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} required />
				</div>
				<div className="grid grid-cols-2 gap-2">
					<Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
					<Input type="number" value={form.totalWithTax} onChange={e => setForm(f => ({ ...f, totalWithTax: Number(e.target.value) }))} placeholder="Montant TTC" required />
				</div>
				<Input placeholder="Notes" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
				<div className="flex gap-2">
					<Button type="submit">Enregistrer</Button>
					<Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
				</div>
			</form>
		);
	}

	const handleSave = async (inv: CustomerInvoice) => {
		setLoading(true);
		if (!user?.companyId) return;
		if (editInvoice) {
			// Update
			await supabase.from('customer_invoices').update({
				invoice_number: inv.invoiceNumber,
				invoice_date: inv.invoiceDate,
				due_date: inv.dueDate,
				total_with_tax: inv.totalWithTax,
				notes: inv.notes,
			}).eq('id', editInvoice.id).eq('company_id', user.companyId);
		} else {
			// Insert
			await supabase.from('customer_invoices').insert({
				company_id: user.companyId,
				order_id: '', // à lier si besoin
				invoice_number: inv.invoiceNumber,
				invoice_date: inv.invoiceDate,
				due_date: inv.dueDate,
				total_amount: inv.totalWithTax, // simplifié
				total_with_tax: inv.totalWithTax,
				is_paid: false,
				created_by: user.id,
				updated_by: user.id,
			});
		}
		setIsDialogOpen(false);
		setEditInvoice(null);
		// Refresh
		const { data } = await supabase.from('customer_invoices').select('*').eq('company_id', user.companyId).order('invoice_date', { ascending: false });
		setInvoices((data || []).map((inv: Record<string, unknown>) => ({
			id: inv.id as string,
			invoiceNumber: inv.invoice_number as string,
			invoiceDate: inv.invoice_date as string,
			dueDate: inv.due_date as string,
			totalAmount: inv.total_amount as number,
			totalWithTax: inv.total_with_tax as number,
			isPaid: inv.is_paid as boolean,
			paidAt: inv.paid_at as string | null,
			notes: inv.notes as string | null,
		})));
		setLoading(false);
	};

	const handleDelete = async (id: string) => {
		setLoading(true);
		if (!user?.companyId) return;
		await supabase.from('customer_invoices').delete().eq('id', id).eq('company_id', user.companyId);
		const { data } = await supabase.from('customer_invoices').select('*').eq('company_id', user.companyId).order('invoice_date', { ascending: false });
		setInvoices((data || []).map((inv: Record<string, unknown>) => ({
			id: inv.id as string,
			invoiceNumber: inv.invoice_number as string,
			invoiceDate: inv.invoice_date as string,
			dueDate: inv.due_date as string,
			totalAmount: inv.total_amount as number,
			totalWithTax: inv.total_with_tax as number,
			isPaid: inv.is_paid as boolean,
			paidAt: inv.paid_at as string | null,
			notes: inv.notes as string | null,
		})));
		setLoading(false);
	};

	const handleMarkPaid = async (id: string, paid: boolean) => {
		setLoading(true);
		if (!user?.companyId) return;
		await supabase.from('customer_invoices').update({ is_paid: paid, paid_at: paid ? new Date().toISOString() : null }).eq('id', id).eq('company_id', user.companyId);
		const { data } = await supabase.from('customer_invoices').select('*').eq('company_id', user.companyId).order('invoice_date', { ascending: false });
		setInvoices((data || []).map((inv: Record<string, unknown>) => ({
			id: inv.id as string,
			invoiceNumber: inv.invoice_number as string,
			invoiceDate: inv.invoice_date as string,
			dueDate: inv.due_date as string,
			totalAmount: inv.total_amount as number,
			totalWithTax: inv.total_with_tax as number,
			isPaid: inv.is_paid as boolean,
			paidAt: inv.paid_at as string | null,
			notes: inv.notes as string | null,
		})));
		setLoading(false);
	};

	const filteredInvoices = invoices.filter(inv => {
		const matchSearch =
			inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
			(inv.notes || '').toLowerCase().includes(search.toLowerCase());
		const matchPaid =
			filterPaid === 'all' ||
			(filterPaid === 'paid' && inv.isPaid) ||
			(filterPaid === 'unpaid' && !inv.isPaid);
		return matchSearch && matchPaid;
	});

	const filteredSupplierInvoices = supplierInvoices.filter(inv => {
		const matchSearch =
			inv.invoiceNumber.toLowerCase().includes(searchSup.toLowerCase()) ||
			(inv.notes || '').toLowerCase().includes(searchSup.toLowerCase());
		const matchPaid =
			filterPaidSup === 'all' ||
			(filterPaidSup === 'paid' && inv.isPaid) ||
			(filterPaidSup === 'unpaid' && !inv.isPaid);
		return matchSearch && matchPaid;
	});

	function exportCSV() {
		const rows = [
			['N°', 'Date', 'Échéance', 'Montant TTC', 'Statut'],
			...filteredInvoices.map(inv => [
				inv.invoiceNumber,
				inv.invoiceDate,
				inv.dueDate,
				inv.totalWithTax,
				inv.isPaid ? 'Payée' : 'En attente',
			]),
		];
		const csv = rows.map(r => r.join(';')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'factures-clients.csv';
		a.click();
		URL.revokeObjectURL(url);
	}

	function exportSupplierCSV() {
		const rows = [
			['N°', 'Date', 'Échéance', 'Montant', 'Statut'],
			...filteredSupplierInvoices.map(inv => [
				inv.invoiceNumber,
				inv.invoiceDate,
				inv.dueDate,
				inv.totalAmount,
				inv.isPaid ? 'Payée' : 'En attente',
			]),
		];
		const csv = rows.map(r => r.join(';')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'factures-fournisseurs.csv';
		a.click();
		URL.revokeObjectURL(url);
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

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 mb-4">
				<DollarSign className="h-6 w-6 text-primary" />
				<h1 className="text-3xl font-bold">Finances</h1>
				<Badge variant="outline">{role}</Badge>
			</div>
			{canViewAll && (
				<Card>
					<CardHeader>
						<CardTitle>Tableau de bord financier</CardTitle>
						<CardDescription>
							Accès complet à la trésorerie, facturation, paiements et
							rapports financiers.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* TODO: Graphiques, stats, paiements, rapports, etc. */}
						<div className="text-muted-foreground">
							Module Finances complet à implémenter.
						</div>
					</CardContent>
				</Card>
			)}
			{canViewPayments && !canViewAll && (
				<Card>
					<CardHeader>
						<CardTitle>Paiements</CardTitle>
						<CardDescription>
							Gestion des paiements clients (commandes) ou fournisseurs
							(stocks).
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* TODO: Paiements clients/fournisseurs, validation, etc. */}
						<div className="text-muted-foreground">
							Gestion des paiements à implémenter.
						</div>
					</CardContent>
				</Card>
			)}
			{canViewReadOnly && !canViewAll && !canViewPayments && (
				<Card>
					<CardHeader>
						<CardTitle>Lecture seule</CardTitle>
						<CardDescription>
							Consultation des paiements clients uniquement.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* TODO: Liste des paiements clients */}
						<div className="text-muted-foreground">
							Consultation des paiements à implémenter.
						</div>
					</CardContent>
				</Card>
			)}
			{canViewAll && (
				<Card>
					<CardHeader>
						<CardTitle>Factures clients</CardTitle>
						<CardDescription>Suivi des ventes, paiements reçus, relances.</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="text-center text-muted-foreground">Chargement…</div>
						) : (
							<>
								<div className="flex flex-wrap gap-2 mb-2 items-center">
									<Input
										placeholder="Rechercher facture ou note..."
										value={search}
										onChange={e => setSearch(e.target.value)}
										className="w-64"
									/>
									<select
										value={filterPaid}
										onChange={e => setFilterPaid(e.target.value as 'all' | 'paid' | 'unpaid')}
										className="border rounded px-2 py-1"
									>
										<option value="all">Toutes</option>
										<option value="paid">Payées</option>
										<option value="unpaid">En attente</option>
									</select>
									<Button variant="outline" onClick={exportCSV} className="ml-auto">
										<Download className="h-4 w-4 mr-2" /> Export CSV
									</Button>
								</div>
								<Button className="mb-4" onClick={() => { setEditInvoice(null); setIsDialogOpen(true); }}>Ajouter une facture</Button>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>N°</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Échéance</TableHead>
											<TableHead>Montant TTC</TableHead>
											<TableHead>Statut</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredInvoices.map(inv => (
											<TableRow key={inv.id}>
												<TableCell>{inv.invoiceNumber}</TableCell>
												<TableCell>{inv.invoiceDate}</TableCell>
												<TableCell>{inv.dueDate}</TableCell>
												<TableCell>{inv.totalWithTax} €</TableCell>
												<TableCell>{inv.isPaid ? <Badge variant="default">Payée</Badge> : <Badge variant="destructive">En attente</Badge>}</TableCell>
												<TableCell>
													<Button size="sm" variant="outline" onClick={() => { setEditInvoice(inv); setIsDialogOpen(true); }}>Éditer</Button>
													<Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(inv.id)}>Supprimer</Button>
													<Button size="sm" variant="outline" className="ml-2" onClick={() => handleMarkPaid(inv.id, !inv.isPaid)}>
														{inv.isPaid ? 'Marquer impayée' : 'Marquer payée'}
													</Button>
												</TableCell>
											</TableRow>
										))}
										{invoices.length === 0 && (
											<TableRow>
												<TableCell colSpan={6} className="text-center text-muted-foreground">Aucune facture</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</>
						)}
					</CardContent>
				</Card>
			)}
			<Card>
				<CardHeader>
					<CardTitle>Factures fournisseurs</CardTitle>
					<CardDescription>Suivi des achats, paiements sortants, relances.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2 mb-2 items-center">
						<Input
							placeholder="Rechercher facture ou note..."
							value={searchSup}
							onChange={e => setSearchSup(e.target.value)}
							className="w-64"
						/>
						<select
							value={filterPaidSup}
							onChange={e => setFilterPaidSup(e.target.value as 'all' | 'paid' | 'unpaid')}
							className="border rounded px-2 py-1"
						>
							<option value="all">Toutes</option>
							<option value="paid">Payées</option>
							<option value="unpaid">En attente</option>
						</select>
						<Button variant="outline" onClick={exportSupplierCSV} className="ml-auto">
							<Download className="h-4 w-4 mr-2" /> Export CSV
						</Button>
					</div>
					{loadingSup ? (
						<div className="text-center text-muted-foreground">Chargement…</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>N°</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Échéance</TableHead>
									<TableHead>Montant</TableHead>
									<TableHead>Statut</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredSupplierInvoices.map(inv => (
									<TableRow key={inv.id}>
										<TableCell>{inv.invoiceNumber}</TableCell>
										<TableCell>{inv.invoiceDate}</TableCell>
										<TableCell>{inv.dueDate}</TableCell>
										<TableCell>{inv.totalAmount} €</TableCell>
										<TableCell>{inv.isPaid ? <Badge variant="default">Payée</Badge> : <Badge variant="destructive">En attente</Badge>}</TableCell>
									</TableRow>
								))}
								{filteredSupplierInvoices.length === 0 && (
									<TableRow>
										<TableCell colSpan={5} className="text-center text-muted-foreground">Aucune facture</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editInvoice ? 'Modifier' : 'Ajouter'} une facture</DialogTitle>
					</DialogHeader>
					<InvoiceForm
						invoice={editInvoice}
						onSave={handleSave}
						onCancel={() => { setIsDialogOpen(false); setEditInvoice(null); }}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}