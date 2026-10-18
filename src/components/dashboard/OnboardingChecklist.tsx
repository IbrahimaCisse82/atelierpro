import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const count = async (table: string, companyId: string, extra?: (q: any) => any) => {
  let q: any = supabase.from(table as any).select('id', { count: 'exact', head: true }).eq('company_id', companyId);
  if (extra) q = extra(q);
  const { count: c } = await q;
  return c ?? 0;
};

export function OnboardingChecklist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const companyId = user?.companyId;
  const storageKey = `onboarding-hidden-${companyId}`;
  const [hidden, setHidden] = useState(() => !!companyId && localStorage.getItem(storageKey) === '1');
  const isReal = !!companyId && companyId !== 'demo-company-id' && user?.role === 'owner';

  const { data } = useQuery({
    queryKey: ['onboarding', companyId],
    enabled: isReal && !hidden,
    queryFn: async () => {
      const { data: company } = await supabase.from('companies').select('ninea, phone, address').eq('id', companyId!).single();
      const [clients, orders, invoices, members] = await Promise.all([
        count('clients', companyId!),
        count('orders', companyId!),
        count('customer_invoices', companyId!, (q) => q.eq('status', 'validated')),
        count('user_roles', companyId!),
      ]);
      return { companyOk: !!(company?.ninea && company?.phone && company?.address), clients, orders, invoices, members };
    },
  });

  if (!isReal || hidden || !data) return null;

  const steps = [
    { label: "Compléter les informations de l'atelier (NINEA, téléphone, adresse)", done: data.companyOk, to: '/dashboard/settings' },
    { label: 'Ajouter un premier client', done: data.clients > 0, to: '/dashboard/clients' },
    { label: 'Créer une première commande', done: data.orders > 0, to: '/dashboard/orders' },
    { label: 'Valider une première facture', done: data.invoices > 0, to: '/dashboard/invoices' },
    { label: 'Inviter un collaborateur', done: data.members > 1, to: '/dashboard/settings' },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <Card className="border-primary/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Premiers pas</CardTitle>
          <CardDescription>{doneCount} sur {steps.length} étapes terminées</CardDescription>
        </div>
        <Button variant="ghost" size="icon" aria-label="Masquer" onClick={() => { localStorage.setItem(storageKey, '1'); setHidden(true); }}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={(doneCount / steps.length) * 100} />
        {steps.map((s) => (
          <button key={s.label} onClick={() => navigate(s.to)} className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted">
            {s.done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
            <span className={s.done ? 'text-muted-foreground line-through' : ''}>{s.label}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
