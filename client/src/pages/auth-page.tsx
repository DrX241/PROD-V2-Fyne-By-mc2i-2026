import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Lock, Shield, UserPlus, LogIn, Check } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { isAuthenticated, login, register, loginMutation, registerMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", email: "" });

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginForm);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(registerForm);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Panneau de gauche avec formulaires d'authentification */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              I AM CYBER
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Plateforme d'apprentissage avancée en cybersécurité
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Connexion
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Inscription
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Connexion</CardTitle>
                  <CardDescription>
                    Connectez-vous à votre compte pour accéder à la plateforme.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLoginSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nom d'utilisateur</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="votre_nom" 
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        required
                      />
                    </div>
                    {loginMutation.error && (
                      <Alert variant="destructive">
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                          {(loginMutation.error as Error).message || "Erreur d'authentification"}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
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
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Se connecter
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Inscription</CardTitle>
                  <CardDescription>
                    Créez un compte pour accéder à la plateforme.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegisterSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Nom d'utilisateur</Label>
                      <Input 
                        id="register-username" 
                        type="text" 
                        placeholder="votre_nom" 
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email (optionnel)</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="vous@exemple.com" 
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Mot de passe</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        required
                      />
                    </div>
                    {registerMutation.error && (
                      <Alert variant="destructive">
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                          {(registerMutation.error as Error).message || "Erreur d'inscription"}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
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
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          S'inscrire
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              En vous connectant, vous accédez à l'ensemble des fonctionnalités
              de la plateforme.
            </p>
          </div>
        </div>
      </div>

      {/* Panneau de droite avec description */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-blue-800 to-blue-600 text-white p-8 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <Shield className="h-12 w-12 mr-4" />
            <h2 className="text-3xl font-bold">I AM CYBER</h2>
          </div>
          <h3 className="text-xl font-semibold mb-4">
            Votre parcours d'apprentissage en cybersécurité
          </h3>
          <p className="mb-6">
            I AM CYBER est une plateforme complète qui vous permet d'acquérir
            et de perfectionner vos compétences en cybersécurité à travers
            une variété de modules interactifs et d'outils IA.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="rounded-full bg-blue-500 p-1 mr-3 mt-1">
                <Check className="h-3 w-3 text-white" />
              </div>
              <p>Modules d'apprentissage interactifs avec gamification</p>
            </li>
            <li className="flex items-start">
              <div className="rounded-full bg-blue-500 p-1 mr-3 mt-1">
                <Check className="h-3 w-3 text-white" />
              </div>
              <p>Assistants IA personnalisés pour un accompagnement adapté</p>
            </li>
            <li className="flex items-start">
              <div className="rounded-full bg-blue-500 p-1 mr-3 mt-1">
                <Check className="h-3 w-3 text-white" />
              </div>
              <p>Simulations réalistes de situations de cybersécurité</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}