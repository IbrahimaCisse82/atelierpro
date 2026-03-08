import { useState } from 'react';
import { ALL_MODULES, MODULE_CATEGORIES, useCompanyModules, ModuleDefinition } from '@/hooks/use-company-modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Download, Trash2, Loader2, CheckCircle, Package, ArrowRight, AlertTriangle } from 'lucide-react';

function ModuleCard({ mod, onViewDetails }: { mod: ModuleDefinition; onViewDetails: () => void }) {
  const { isModuleInstalled, installModule, uninstallModule, getMissingDependencies, getDependentModules } = useCompanyModules();
  const installed = isModuleInstalled(mod.key);
  const missingDeps = getMissingDependencies(mod.key);
  const dependents = getDependentModules(mod.key);
  const isInstalling = installModule.isPending;
  const isUninstalling = uninstallModule.isPending;

  return (
    <Card className={`group relative overflow-hidden transition-all hover:shadow-lg ${installed ? 'border-primary/50 bg-primary/5' : 'hover:border-muted-foreground/30'}`}>
      {installed && (
        <div className="absolute top-3 right-3">
          <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
            <CheckCircle className="h-3 w-3 mr-1" /> Installé
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{mod.icon}</div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">{mod.label}</CardTitle>
            <CardDescription className="text-xs mt-1 line-clamp-2">{mod.shortDesc}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">{mod.category}</Badge>
          <span>v{mod.version}</span>
          <span>•</span>
          <span className="font-medium text-primary">{mod.price}</span>
        </div>

        {mod.dependencies.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Requiert : </span>
            {mod.dependencies.map(dep => {
              const depMod = ALL_MODULES.find(m => m.key === dep);
              const depInstalled = isModuleInstalled(dep);
              return (
                <Badge
                  key={dep}
                  variant={depInstalled ? 'secondary' : 'destructive'}
                  className="text-[10px] mr-1"
                >
                  {depMod?.icon} {depMod?.label}
                </Badge>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={onViewDetails}>
            Détails
          </Button>
          {installed ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => uninstallModule.mutate(mod.key)}
              disabled={isUninstalling || dependents.length > 0}
              title={dependents.length > 0 ? `Requis par d'autres modules` : undefined}
            >
              {isUninstalling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
              Désinstaller
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={() => installModule.mutate(mod.key)}
              disabled={isInstalling}
            >
              {isInstalling ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              Installer{missingDeps.length > 0 ? ` (+${missingDeps.length})` : ''}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleDetailDialog({ mod, open, onOpenChange }: { mod: ModuleDefinition | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { isModuleInstalled, installModule, uninstallModule, getMissingDependencies, getDependentModules } = useCompanyModules();
  
  if (!mod) return null;
  
  const installed = isModuleInstalled(mod.key);
  const missingDeps = getMissingDependencies(mod.key);
  const dependents = getDependentModules(mod.key);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{mod.icon}</span>
            <div>
              <DialogTitle className="text-xl">{mod.label}</DialogTitle>
              <DialogDescription className="text-sm">{mod.shortDesc}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{mod.category}</Badge>
            <Badge variant="secondary">v{mod.version}</Badge>
            <Badge className="bg-primary text-primary-foreground">{mod.price}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">{mod.fullDesc}</p>

          <div>
            <h4 className="text-sm font-semibold mb-2">Fonctionnalités</h4>
            <ul className="space-y-1">
              {mod.features.map((f, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {mod.dependencies.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Dépendances</h4>
              <div className="flex flex-wrap gap-2">
                {mod.dependencies.map(dep => {
                  const depMod = ALL_MODULES.find(m => m.key === dep);
                  const depInstalled = isModuleInstalled(dep);
                  return (
                    <Badge key={dep} variant={depInstalled ? 'secondary' : 'destructive'}>
                      {depMod?.icon} {depMod?.label}
                      {!depInstalled && ' (sera installé)'}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {installed && dependents.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-400">
                <p className="font-medium">Impossible de désinstaller</p>
                <p>Requis par : {dependents.map(k => ALL_MODULES.find(m => m.key === k)?.label).join(', ')}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {installed ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => { uninstallModule.mutate(mod.key); onOpenChange(false); }}
                disabled={uninstallModule.isPending || dependents.length > 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Désinstaller
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => { installModule.mutate(mod.key); onOpenChange(false); }}
                disabled={installModule.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Installer{missingDeps.length > 0 ? ` (+ ${missingDeps.length} dépendance${missingDeps.length > 1 ? 's' : ''})` : ''}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AppsStorePage() {
  const { isLoading, getInstalledModules } = useCompanyModules();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [selectedModule, setSelectedModule] = useState<ModuleDefinition | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const installedKeys = getInstalledModules();

  const categories = ['Tout', 'Installés', ...MODULE_CATEGORIES];

  const filteredModules = ALL_MODULES.filter(mod => {
    const matchesSearch = !search || 
      mod.label.toLowerCase().includes(search.toLowerCase()) ||
      mod.shortDesc.toLowerCase().includes(search.toLowerCase()) ||
      mod.category.toLowerCase().includes(search.toLowerCase());
    
    if (activeCategory === 'Tout') return matchesSearch;
    if (activeCategory === 'Installés') return matchesSearch && installedKeys.includes(mod.key);
    return matchesSearch && mod.category === activeCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Installez les modules dont vous avez besoin pour votre atelier
          </p>
        </div>
        <Badge variant="secondary" className="w-fit text-sm">
          {installedKeys.length} / {ALL_MODULES.length} installé(s)
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un module..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="text-xs">
              {cat}
              {cat === 'Installés' && ` (${installedKeys.length})`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Module Grid */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Aucun module trouvé</p>
          <p className="text-sm">Essayez une autre recherche ou catégorie</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredModules.map(mod => (
            <ModuleCard
              key={mod.key}
              mod={mod}
              onViewDetails={() => { setSelectedModule(mod); setDetailOpen(true); }}
            />
          ))}
        </div>
      )}

      <ModuleDetailDialog mod={selectedModule} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
