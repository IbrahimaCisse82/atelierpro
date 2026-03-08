import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { 
  Scissors, Users, Package, ClipboardList, BarChart3, 
  Shield, Smartphone, Zap, ArrowRight, CheckCircle2 
} from 'lucide-react';

const features = [
  { icon: ClipboardList, title: 'Commandes', desc: 'Suivi complet du cycle de vie des commandes clients' },
  { icon: Users, title: 'Clients & Mesures', desc: 'Base de données clients avec historique des mensurations' },
  { icon: Scissors, title: 'Production', desc: 'Planification et suivi en temps réel de la production' },
  { icon: Package, title: 'Stocks', desc: 'Gestion des tissus, fils, boutons et fournitures' },
  { icon: BarChart3, title: 'Finances', desc: 'Facturation, trésorerie et comptabilité SYSCOHADA' },
  { icon: Shield, title: 'Sécurité', desc: 'Données isolées par entreprise, rôles et permissions' },
];

const highlights = [
  'Gestion multi-rôles (propriétaire, manager, tailleur…)',
  'Application installable sur mobile (PWA)',
  'Mode hors-ligne avec synchronisation',
  'Exports PDF et Excel',
  'Tableau de bord temps réel',
  'Comptabilité SYSCOHADA intégrée',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <img 
          src="/login-bg.jpg" 
          alt="Atelier de couture" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.3)' }}
        />
        <div className="relative z-10">
          <nav className="container mx-auto flex items-center justify-between py-6 px-4">
            <Logo size="lg" />
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10">Connexion</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Essai gratuit
                </Button>
              </Link>
            </div>
          </nav>

          <div className="container mx-auto px-4 py-24 md:py-36 text-center text-white max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Gérez votre atelier de couture{' '}
              <span className="text-accent">simplement</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              AtelierPro centralise commandes, clients, stocks, production et finances 
              dans une seule application moderne, conçue pour les ateliers africains.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8">
                  Créer mon atelier
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Accès Démo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features grid */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tout ce dont votre atelier a besoin
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une solution complète pour gérer chaque aspect de votre activité de couture
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Conçu pour les ateliers de couture
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              AtelierPro comprend les besoins spécifiques des tailleurs et couturiers : 
              mensurations clients, suivi de production par étape, gestion des tissus et fournitures, 
              et comptabilité adaptée au plan SYSCOHADA.
            </p>
            <ul className="space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="text-3xl font-bold text-primary">20+</div>
                  <div className="text-sm text-muted-foreground">Modules</div>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="text-3xl font-bold text-accent">PWA</div>
                  <div className="text-sm text-muted-foreground">Mobile ready</div>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="text-3xl font-bold text-success">100%</div>
                  <div className="text-sm text-muted-foreground">Sécurisé</div>
                </div>
                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="text-3xl font-bold text-primary">
                    <Zap className="h-8 w-8 mx-auto" />
                  </div>
                  <div className="text-sm text-muted-foreground">Rapide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à moderniser votre atelier ?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Créez votre compte gratuitement et commencez à gérer votre atelier en quelques minutes.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10">
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AtelierPro — Solution de gestion pour ateliers de couture
          </p>
          <Link to="/install" className="text-sm text-primary hover:underline">
            Installer l'application
          </Link>
        </div>
      </footer>
    </div>
  );
}