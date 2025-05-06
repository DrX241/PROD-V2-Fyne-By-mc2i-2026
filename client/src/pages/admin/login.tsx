import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useLocation } from 'wouter';
import { Loader2, LockKeyhole } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schéma de validation du formulaire
const formSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type FormData = z.infer<typeof formSchema>;

const AdminLogin: React.FC = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, login, error, isLoading } = useAdminAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  // Rediriger vers le tableau de bord si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoggingIn(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
    } finally {
      setLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 text-[#006a9e] animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Vérification de l'authentification...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#006a9e]">Portail d'administration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Connectez-vous pour accéder au tableau de bord d'administration
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <LockKeyhole className="h-10 w-10 text-[#006a9e]" />
            </div>
            <CardTitle className="text-2xl text-center">Connexion administrateur</CardTitle>
            <CardDescription className="text-center">
              Accès réservé au personnel autorisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifiant</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Entrez votre identifiant"
                          autoComplete="username"
                          disabled={loggingIn}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Entrez votre mot de passe"
                          autoComplete="current-password"
                          disabled={loggingIn}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-[#006a9e] hover:bg-[#00557e]"
                  disabled={loggingIn}
                >
                  {loggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              className="text-[#006a9e]"
              onClick={() => navigate('/')}
            >
              Retour à l'accueil
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;