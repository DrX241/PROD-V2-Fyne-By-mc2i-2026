import { useState } from "react";
import { useEffect } from "react";
import { Redirect } from "wouter";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  
  // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
  // Important: Cette vérification doit être faite après l'initialisation de tous les hooks
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

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
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10 text-center">
            <img src="/assets/logo-mc2i.png" alt="Logo mc2i" className="h-24 w-auto mx-auto mb-4" />
            <h2 className="mt-4 text-3xl font-bold leading-9 tracking-tight text-gray-900">
              Plateforme FYNE
            </h2>
            <p className="mt-2 text-base leading-6 text-gray-600">
              Connectez-vous pour accéder à votre espace personnel
            </p>
          </div>

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Entrez votre nom d'utilisateur" 
                        className="border-gray-300 bg-white/80 backdrop-blur-sm text-black" 
                        {...field} 
                      />
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
                    <FormLabel className="text-gray-800 font-semibold">Mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Entrez votre mot de passe" 
                        className="border-gray-300 bg-white/80 backdrop-blur-sm text-black" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : "Accéder à la plateforme"}
              </Button>
              
              <p className="text-xs text-center text-gray-600 mt-4">
                L'accès à cette plateforme est réservé aux collaborateurs mc2i et ses partenaires.
                <br />Pour tout problème de connexion, veuillez contacter votre administrateur.
              </p>
            </form>
          </Form>
        </div>
      </div>

      {/* Section Hero */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 flex flex-col justify-center items-center p-12 text-white overflow-hidden">
          {/* Éléments de décoration en arrière-plan */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-10 w-40 h-40 rounded-full bg-blue-400 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-indigo-400 blur-xl"></div>
            <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-purple-400 blur-lg"></div>
            <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full bg-blue-300 blur-xl"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Bienvenue sur la plateforme
              <span className="block text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100 mt-2">FYNE</span>
            </h1>
            <p className="text-xl mb-10 text-blue-100 leading-relaxed">
              Une solution innovante de formation et d'accompagnement conçue pour transformer l'expérience des consultants mc2i.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <h3 className="font-semibold text-lg mb-3 text-blue-100">Modules interactifs</h3>
                <p className="text-white/80">Développez vos compétences avec des outils de formation adaptés à votre profil et votre rythme d'apprentissage.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <h3 className="font-semibold text-lg mb-3 text-blue-100">Assistants IA personnalisés</h3>
                <p className="text-white/80">Bénéficiez d'une aide personnalisée propulsée par l'intelligence artificielle pour tous vos projets.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <h3 className="font-semibold text-lg mb-3 text-blue-100">Formation cybersécurité</h3>
                <p className="text-white/80">Plongez dans des simulations avancées et scénarios immersifs pour maîtriser les enjeux de sécurité.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <h3 className="font-semibold text-lg mb-3 text-blue-100">Outils de productivité</h3>
                <p className="text-white/80">Accédez à un arsenal d'outils intelligents conçus pour optimiser votre travail quotidien.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}