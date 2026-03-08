import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ALL_MODULES, MODULE_CATEGORIES, useCompanyModules } from '@/hooks/use-company-modules';
import { CheckCircle, Loader2, Package } from 'lucide-react';

interface ModuleSetupProps {
  mode: 'onboarding' | 'settings';
  onComplete?: () => void;
}

const PRESETS = [
  {
    key: 'solo',
    label: '🧵 Couturier Solo',
    description: 'Je travaille seul, je gère mes clients et commandes',
    modules: ['clients', 'orders', 'measurements', 'patterns', 'production'],
  },
  {
    key: 'atelier',
    label: '🏭 Petit Atelier',
    description: 'J\'ai des employés, je gère aussi les stocks et la facturation',
    modules: ['clients', 'orders', 'measurements', 'patterns', 'production', 'stocks', 'customer_invoices', 'employees', 'alerts'],
  },
  {
    key: 'entreprise',
    label: '🏢 Entreprise de Couture',
    description: 'Gestion complète avec achats, finance, RH et comptabilité',
    modules: ALL_MODULES.map(m => m.key),
  },
];

export function ModuleSetup({ mode, onComplete }: ModuleSetupProps) {
  const { initializeModules, isModuleEnabled, toggleModule, hasConfiguredModules } = useCompanyModules();
  const [selectedModules, setSelectedModules] = useState<Set<string>>(() => {
    if (mode === 'settings' && hasConfiguredModules) {
      return new Set(ALL_MODULES.filter(m => isModuleEnabled(m.key)).map(m => m.key));
    }
    // Default: core modules for onboarding
    return new Set(ALL_MODULES.filter(m => m.defaultEnabled).map(m => m.key));
  });
  const [step, setStep] = useState<'preset' | 'custom'>(mode === 'onboarding' ? 'preset' : 'custom');
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const applyPreset = (moduleKeys: string[]) => {
    setSelectedModules(new Set(moduleKeys));
    setStep('custom');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === 'onboarding') {
        await initializeModules.mutateAsync(Array.from(selectedModules));
      } else {
        // In settings mode, update each module individually
        for (const mod of ALL_MODULES) {
          const shouldBeEnabled = selectedModules.has(mod.key);
          if (shouldBeEnabled !== isModuleEnabled(mod.key)) {
            await toggleModule.mutateAsync({ moduleKey: mod.key, enabled: shouldBeEnabled });
          }
        }
      }
      onComplete?.();
    } finally {
      setSaving(false);
    }
  };

  if (step === 'preset') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Package className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-2xl font-bold">Configurez votre Atelier</h2>
          <p className="text-muted-foreground">
            Choisissez un profil qui correspond à votre activité. Vous pourrez activer ou désactiver des modules plus tard.
          </p>
        </div>

        <div className="grid gap-4">
          {PRESETS.map(preset => (
            <Card
              key={preset.key}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01] border-2 hover:border-primary"
              onClick={() => applyPreset(preset.modules)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{preset.label}</CardTitle>
                <CardDescription>{preset.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {preset.modules.slice(0, 6).map(key => {
                    const mod = ALL_MODULES.find(m => m.key === key);
                    return mod ? (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {mod.icon} {mod.label}
                      </Badge>
                    ) : null;
                  })}
                  {preset.modules.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{preset.modules.length - 6} autres
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={() => setStep('custom')}>
            Configurer manuellement →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {mode === 'onboarding' && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Personnalisez vos Modules</h2>
          <p className="text-muted-foreground">
            Activez uniquement les fonctionnalités dont vous avez besoin.
          </p>
        </div>
      )}

      {MODULE_CATEGORIES.map(cat => {
        const catModules = ALL_MODULES.filter(m => m.category === cat.key);
        if (catModules.length === 0) return null;

        return (
          <Card key={cat.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{cat.label}</CardTitle>
              <CardDescription className="text-xs">{cat.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {catModules.map(mod => (
                <div
                  key={mod.key}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{mod.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{mod.label}</p>
                      <p className="text-xs text-muted-foreground">{mod.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={selectedModules.has(mod.key)}
                    onCheckedChange={() => toggle(mod.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center justify-between sticky bottom-0 bg-background py-4 border-t">
        <p className="text-sm text-muted-foreground">
          <CheckCircle className="inline h-4 w-4 mr-1 text-green-600" />
          {selectedModules.size} module(s) activé(s)
        </p>
        <div className="flex gap-2">
          {mode === 'onboarding' && (
            <Button variant="outline" onClick={() => setStep('preset')}>
              ← Retour aux profils
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || selectedModules.size === 0}>
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...</>
            ) : (
              mode === 'onboarding' ? 'Démarrer mon Atelier →' : 'Enregistrer les modifications'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
