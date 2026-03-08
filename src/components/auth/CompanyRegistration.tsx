import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/ui/logo';
import { Loader2, Building2, User, Mail, Lock, CheckCircle } from 'lucide-react';

interface CompanyRegistrationProps {
  onSwitchToLogin: () => void;
}

export function CompanyRegistration({ onSwitchToLogin }: CompanyRegistrationProps) {
  const { registerCompany, loading } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    ownerEmail: '',
    ownerFirstName: '',
    ownerLastName: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.companyName.trim()) {
      setError('Le nom de l\'entreprise est requis');
      return;
    }

    if (!formData.ownerEmail.trim() || !formData.ownerEmail.includes('@')) {
      setError('Une adresse email valide est requise');
      return;
    }

    if (!formData.ownerFirstName.trim() || !formData.ownerLastName.trim()) {
      setError('Le prénom et nom sont requis');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await registerCompany({
        companyName: formData.companyName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        ownerFirstName: formData.ownerFirstName.trim(),
        ownerLastName: formData.ownerLastName.trim(),
        password: formData.password
      });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
            <CardTitle className="text-success">Inscription Réussie !</CardTitle>
            <CardDescription>
              Votre entreprise a été créée avec succès. Vous allez être redirigé vers votre tableau de bord.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <Logo className="mx-auto mb-4" size="lg" />
          <CardTitle className="text-2xl">Créer votre Atelier</CardTitle>
          <CardDescription>
            Inscrivez votre entreprise de couture et commencez à gérer votre atelier
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Informations Entreprise */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 className="h-4 w-4" />
                Informations de l'entreprise
              </div>
              
              <div>
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Ex: Atelier Couture Marie"
                  disabled={loading}
                  required
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Informations Propriétaire */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="h-4 w-4" />
                Informations du propriétaire
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="ownerFirstName">Prénom *</Label>
                  <Input
                    id="ownerFirstName"
                    name="ownerFirstName"
                    value={formData.ownerFirstName}
                    onChange={handleChange}
                    placeholder="Marie"
                    disabled={loading}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerLastName">Nom *</Label>
                  <Input
                    id="ownerLastName"
                    name="ownerLastName"
                    value={formData.ownerLastName}
                    onChange={handleChange}
                    placeholder="Dubois"
                    disabled={loading}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ownerEmail">Adresse email *</Label>
                <Input
                  id="ownerEmail"
                  name="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  placeholder="marie@atelier-couture.fr"
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Sécurité */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Lock className="h-4 w-4" />
                Sécurité
              </div>
              
              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent shadow-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer mon Atelier'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Vous avez déjà un compte ?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:text-primary-dark underline"
                disabled={loading}
              >
                Se connecter
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}