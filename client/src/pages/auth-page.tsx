import { useState } from "react";
import { useEffect } from "react";
import { Redirect } from "wouter";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

// Schéma de validation pour le formulaire de connexion
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
  }),
  password: z.string().min(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères.",
  }),
});

// Schéma de validation pour le formulaire d'inscription
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal("")),
  password: z.string().min(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, isAuthenticated, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Formulaire de connexion
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Formulaire d'inscription
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Gestion de la soumission du formulaire de connexion
  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Erreur de connexion:", error);
    }
  };

  // Gestion de la soumission du formulaire d'inscription
  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      // Suppression du champ confirmPassword qui n'est pas nécessaire pour l'API
      const { confirmPassword, ...registerData } = data;
      await registerMutation.mutateAsync(registerData);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Formulaire */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-gray-50">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <img src="/assets/logo.png" alt="Logo mc2i" className="h-10 w-auto" />
            <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              I AM CYBER - Plateforme FYNE
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Connectez-vous pour accéder à votre espace personnel
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="Entrez votre nom d'utilisateur" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Entrez votre mot de passe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : "Se connecter"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="Choisissez un nom d'utilisateur" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optionnel)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Entrez votre email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Choisissez un mot de passe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirmez votre mot de passe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription en cours...
                      </>
                    ) : "S'inscrire"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Section Hero */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-800 to-indigo-900 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Bienvenue sur I AM CYBER</h1>
            <p className="text-xl mb-8">
              La plateforme d'apprentissage interactive de cybersécurité pour les consultants mc2i.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Modules interactifs</h3>
                <p>Apprenez à travers des simulations réalistes et des jeux captivants.</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Assistants IA personnalisés</h3>
                <p>Créez vos propres assistants spécialisés pour vous aider dans vos tâches quotidiennes.</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Simulations avancées</h3>
                <p>Entraînez-vous à gérer des incidents de cybersécurité dans des environnements réalistes.</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Générateur de modules</h3>
                <p>Concevez vos propres modules d'apprentissage adaptés à vos besoins spécifiques.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}