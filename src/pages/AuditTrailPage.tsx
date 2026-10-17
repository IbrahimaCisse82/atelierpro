import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield } from 'lucide-react';

const TABLE_LABELS: Record<string, string> = {
  clients: 'Clients', orders: 'Commandes', payments: 'Paiements', customer_invoices: 'Factures',
  credit_notes: 'Avoirs', journal_entries: 'Écritures', products: 'Produits', suppliers: 'Fournisseurs',
  purchase_orders: 'Achats', receptions: 'Réceptions', employees: 'Employés', treasury_accounts: 'Comptes trésorerie',
  treasury_movements: 'Mouvements trésorerie', user_roles: 'Rôles', company_modules: 'Modules', companies: 'Entreprise',
};
const ACTION_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  INSERT: { label: 'Création', variant: 'default' },
  UPDATE: { label: 'Modification', variant: 'secondary' },
  DELETE: { label: 'Suppression', variant: 'destructive' },
};

export function AuditTrailPage() {
  const { user } = useAuth() as any;
  const companyId = user?.companyId;
  const isDemo = !companyId || companyId === 'demo-company-id';
  const [search, setSearch] = useState('');
  const [table, setTable] = useState('all');
  const [action, setAction] = useState('all');

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['audit_log', companyId],
    enabled: !isDemo,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('audit_log').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      return data as any[];
    },
  });

  const rows = useMemo(() => data.filter((r) =>
    (table === 'all' || r.table_name === table) &&
    (action === 'all' || r.action === action) &&
    (!search || `${r.user_email ?? ''} ${r.record_id ?? ''} ${JSON.stringify(r.changed_fields ?? '')}`.toLowerCase().includes(search.toLowerCase()))
  ), [data, table, action, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Journal d'audit</h1>
          <p className="text-sm text-muted-foreground">Toutes les créations, modifications et suppressions de votre atelier.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Filtres</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Rechercher (utilisateur, contenu)…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={table} onValueChange={setTable}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les données</SelectItem>
              {Object.entries(TABLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              {Object.entries(ACTION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isDemo ? (
            <p className="p-6 text-sm text-muted-foreground">Le journal d'audit est disponible avec un vrai compte (pas en mode démo).</p>
          ) : isLoading ? (
            <div className="space-y-2 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : error ? (
            <p className="p-6 text-sm text-destructive">Accès réservé au propriétaire et au gérant.</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucune activité enregistrée.</p>
          ) : (
            <div className="divide-y">
              {rows.map((r) => {
                const a = ACTION_LABELS[r.action] ?? { label: r.action, variant: 'secondary' as const };
                const fields = r.changed_fields ? Object.keys(r.changed_fields) : [];
                return (
                  <div key={r.id} className="flex flex-col gap-1 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={a.variant}>{a.label}</Badge>
                        <span className="font-medium">{TABLE_LABELS[r.table_name] ?? r.table_name}</span>
                      </div>
                      {r.action === 'UPDATE' && fields.length > 0 && (
                        <p className="text-xs text-muted-foreground">Champs modifiés : {fields.slice(0, 8).join(', ')}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground md:text-right">
                      <div>{r.user_email ?? 'Système'}</div>
                      <div>{new Date(r.created_at).toLocaleString('fr-FR')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AuditTrailPage;
