import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PERMISSIONS } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/ui/logo';
import { ChevronDown, LogOut, Settings, User, Building2, Moon, Sun } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';

export const DashboardHeader = React.memo(function DashboardHeader() {
  const { user, company, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  if (!user || !company) return null;

  const roleInfo = ROLE_PERMISSIONS[user.role];
  const userInitials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b bg-card shadow-sm px-6 flex items-center justify-between">
      {/* Logo et nom de l'entreprise */}
      <div className="flex items-center gap-4">
        <Logo size="sm" />
        <div className="hidden md:flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{company.name}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} title={resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Badge de rôle */}
        <Badge variant="secondary" className="hidden sm:flex">
          {roleInfo.label}
        </Badge>

        {/* Bouton de déconnexion direct */}
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2" title="Se déconnecter" onClick={() => setOpen(true)}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Se déconnecter</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Menu utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user.firstName} {user.lastName}</span>
                <span className="text-xs font-normal text-muted-foreground">{roleInfo.label}</span>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="flex items-center gap-2" onClick={() => navigate('/dashboard/profile')}>
              <User className="h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            
            {(user.role === 'owner' || user.role === 'manager') && (
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => navigate('/dashboard/settings')}>
                <Settings className="h-4 w-4" />
                Paramètres entreprise
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="flex items-center gap-2" onClick={toggleTheme}>
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Section démo */}
            {user.id === 'demo-user-id' && (
              <>
                <DropdownMenuLabel className="text-xs text-accent">Mode Démonstration</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => switchRole('owner')}>🏢 Propriétaire</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('manager')}>👨‍💼 Gérant</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('tailor')}>✂️ Couturier</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('orders')}>📋 Resp. Commandes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('stocks')}>📦 Resp. Stocks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('customer_service')}>📞 Service Client</DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem 
              onClick={() => logout()}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
