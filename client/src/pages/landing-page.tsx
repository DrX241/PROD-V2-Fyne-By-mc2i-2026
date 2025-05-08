import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { Loader2, ArrowRight, Lock, Shield, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white">
      {/* En-tête */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold">I AM CYBER</h1>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Section principale */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Bienvenue sur la plateforme de formation cybersécurité
          </h1>
          
          <p className="text-xl mb-8 text-blue-200">
            Découvrez un environnement d'apprentissage interactif pour développer 
            vos compétences en cybersécurité.
          </p>

          {isLoading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-8">
              <div className="bg-blue-800/30 p-6 rounded-lg border border-blue-700">
                <h2 className="text-2xl font-bold mb-2">
                  Bonjour, {user?.username || "utilisateur"} !
                </h2>
                <p className="mb-4">
                  Ravi de vous revoir. Continuez votre parcours d'apprentissage.
                </p>
                <Link href="/cyber">
                  <Button size="lg" className="gap-2">
                    Accéder à mes formations
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-blue-900/50 p-6 rounded-lg border border-blue-800 flex flex-col items-center">
                  <Lock className="h-12 w-12 mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">Modules Sécurisés</h3>
                  <p className="text-center text-blue-200">
                    Accédez à du contenu de qualité, vérifié par des experts.
                  </p>
                </div>
                
                <div className="bg-blue-900/50 p-6 rounded-lg border border-blue-800 flex flex-col items-center">
                  <BookOpen className="h-12 w-12 mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">Parcours Personnalisés</h3>
                  <p className="text-center text-blue-200">
                    Apprenez à votre rythme avec des formations adaptées à votre niveau.
                  </p>
                </div>
                
                <div className="bg-blue-900/50 p-6 rounded-lg border border-blue-800 flex flex-col items-center">
                  <Shield className="h-12 w-12 mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">Communauté</h3>
                  <p className="text-center text-blue-200">
                    Rejoignez une communauté d'apprenants en cybersécurité.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-blue-800/30 p-6 rounded-lg border border-blue-700">
                <h2 className="text-2xl font-bold mb-2">
                  Commencez votre voyage en cybersécurité
                </h2>
                <p className="mb-4">
                  Connectez-vous pour accéder à notre plateforme complète de formation.
                </p>
                <Button onClick={() => window.location.href = "/api/login"} size="lg" className="gap-2">
                  Se connecter avec Replit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-blue-900/50 p-6 rounded-lg border border-blue-800 flex flex-col items-center">
                  <Lock className="h-12 w-12 mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">Formation Sécurisée</h3>
                  <p className="text-center text-blue-200">
                    Des modules créés par des experts en cybersécurité.
                  </p>
                </div>
                
                <div className="bg-blue-900/50 p-6 rounded-lg border border-blue-800 flex flex-col items-center">
                  <BookOpen className="h-12 w-12 mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">Apprentissage Interactif</h3>
                  <p className="text-center text-blue-200">
                    Des exercices pratiques pour tester vos connaissances.
                  </p>
                </div>
                
                <div className="bg-blue-900/50 p-6 rounded-lg border border-blue-800 flex flex-col items-center">
                  <Shield className="h-12 w-12 mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">Certification</h3>
                  <p className="text-center text-blue-200">
                    Obtenez des certificats reconnus pour valoriser vos compétences.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Pied de page */}
      <footer className="container mx-auto px-4 py-8 mt-auto">
        <div className="border-t border-blue-800 pt-6 text-center text-blue-400 text-sm">
          <p>© 2025 I AM CYBER - Plateforme de formation en cybersécurité</p>
        </div>
      </footer>
    </div>
  );
}