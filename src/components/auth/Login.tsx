import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/ui/logo';
import { Loader2, Mail, Lock } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export function Login({ onSwitchToRegister }: LoginProps) {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

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

    try {
      await login(formData.email, formData.password);
      // La redirection sera gérée automatiquement par le contexte d'auth
    } catch (error: any) {
      // Gestion spécifique des erreurs avec messages personnalisés
      let errorMessage = 'Une erreur est survenue lors de la connexion.';
      
      if (error.message) {
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Votre email n\'est pas encore confirmé. Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Trop de tentatives de connexion. Veuillez patienter quelques minutes.';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      {/* Image de fond */}
      <img 
        src="/login-bg.jpg" 
        alt="Atelier couture" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
        style={{ filter: 'brightness(0.5)' }}
      />
      {/* Overlay pour lisibilité */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div className="w-full max-w-md relative z-20">
        <Card className="shadow-elegant bg-white/20 backdrop-blur-md border-none">
          <CardHeader className="text-center">
            <Logo className="mx-auto mb-4" size="lg" />
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>
              Accédez à votre espace de gestion d'atelier
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.fr"
                    className="pl-10"
                    disabled={loading}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Votre mot de passe"
                    className="pl-10"
                    disabled={loading}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-button" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Pas encore d'atelier ?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-primary hover:text-primary-dark underline"
                  disabled={loading}
                >
                  Créer votre entreprise
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}