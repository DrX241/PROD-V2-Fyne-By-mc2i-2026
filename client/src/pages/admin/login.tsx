import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldAlert } from 'lucide-react';

// Schéma de validation Zod
const formSchema = z.object({
  username: z.string().min(1, 'Le nom d\'utilisateur est requis'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Types pour les données du formulaire
type FormData = z.infer<typeof formSchema>;

const AdminLoginPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { login, isAuthenticated, isLoading, error } = useAdminAuth();
  const [submitting, setSubmitting] = useState(false);

  // Formulaire avec validation zod
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  // Gestion de la soumission du formulaire
  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        navigate('/admin');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 text-[#006a9e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Panneau de gauche avec formulaire */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <ShieldAlert className="h-12 w-12 text-[#006a9e]" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Administration</CardTitle>
              <CardDescription className="text-center">
                Connectez-vous pour accéder au panneau d'administration
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
                          <Input placeholder="Votre identifiant" {...field} />
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
                          <Input type="password" placeholder="Votre mot de passe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-[#006a9e] hover:bg-[#00557e]"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : 'Se connecter'}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="link" onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Panneau de droite avec informations */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-8 bg-[#006a9e] text-white">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-6">
            Centre d'administration mc2i
          </h1>
          <p className="text-lg mb-4">
            Cette zone est réservée aux administrateurs de la plateforme.
          </p>
          <div className="space-y-4 mt-8">
            <div className="flex items-start space-x-3">
              <div className="bg-white rounded-full p-1">
                <ShieldAlert className="h-5 w-5 text-[#006a9e]" />
              </div>
              <div>
                <h3 className="font-medium">Gestion des accès</h3>
                <p className="text-sm opacity-80">
                  Créez et gérez des accès temporaires aux modules de la plateforme.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white rounded-full p-1">
                <ShieldAlert className="h-5 w-5 text-[#006a9e]" />
              </div>
              <div>
                <h3 className="font-medium">Administration système</h3>
                <p className="text-sm opacity-80">
                  Configurez les modules et les paramètres avancés de la plateforme.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;