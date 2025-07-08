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
import { ChevronDown, LogOut, Settings, User, Building2 } from 'lucide-react';

export function DashboardHeader() {
  const { user, company, logout, switchRole } = useAuth();

  if (!user || !company) return null;

  const roleInfo = ROLE_PERMISSIONS[user.role];
  const userInitials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

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

      {/* Profil utilisateur */}
      <div className="flex items-center gap-4">
        {/* Badge de rôle */}
        <Badge variant="secondary" className="hidden sm:flex">
          {roleInfo.label}
        </Badge>

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
            
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            
            {user.role === 'owner' && (
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres entreprise
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {/* Section démo - Changement de rôle */}
            <DropdownMenuLabel className="text-xs text-accent">Mode Démonstration</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => switchRole('owner')}>
              🏢 Propriétaire
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('manager')}>
              👨‍💼 Gérant
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('tailor')}>
              ✂️ Couturier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('orders')}>
              📋 Resp. Commandes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('stocks')}>
              📦 Resp. Stocks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('customer_service')}>
              📞 Service Client
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
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