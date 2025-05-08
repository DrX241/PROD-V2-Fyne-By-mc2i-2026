import { useEffect } from "react";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogIn } from "lucide-react";

export default function AuthPage() {
  const { isLoading, isAuthenticated, login } = useAuth();
  
  // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Déclencher automatiquement la redirection vers Replit Auth
  useEffect(() => {
    // Petit délai pour permettre à l'utilisateur de voir la page avant la redirection
    const timer = setTimeout(() => {
      if (!isLoading && !isAuthenticated) {
        login();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, login]);

  return (
    <div className="flex min-h-screen">
      {/* Section de connexion */}
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10 text-center">
            <img src="/assets/logo-mc2i.png" alt="Logo mc2i" className="h-24 w-auto mx-auto mb-4" />
            <h2 className="mt-4 text-3xl font-bold leading-9 tracking-tight text-gray-900">
              Plateforme FYNE
            </h2>
            <p className="mt-2 text-base leading-6 text-gray-600">
              Vous allez être redirigé vers la page de connexion
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 text-blue-700 text-sm">
              <p>Notre plateforme utilise désormais l'authentification sécurisée via Replit.</p>
            </div>

            <Button
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Se connecter avec Replit
            </Button>
            
            <p className="text-xs text-center text-gray-600 mt-4">
              L'accès à cette plateforme est réservé aux collaborateurs mc2i et ses partenaires.
              <br />Pour tout problème de connexion, veuillez contacter votre administrateur.
            </p>
          </div>
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