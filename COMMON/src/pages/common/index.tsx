import { Link } from "wouter";

/**
 * Page d'accueil principale avec sélection des modules
 */
export function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">I AM PLATFORM</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Module I AM CYBER */}
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700">
            <div className="h-40 bg-blue-900 flex items-center justify-center">
              <h2 className="text-3xl font-bold">I AM CYBER</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Plateforme de formation à la cybersécurité avec simulations, jeux et challenges.
              </p>
              <Link href="/cyber">
                <a className="block w-full py-3 px-4 bg-blue-600 text-center rounded-md hover:bg-blue-700 transition-colors font-medium">
                  Accéder
                </a>
              </Link>
            </div>
          </div>
          
          {/* Module I AM mc2i */}
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700">
            <div className="h-40 bg-green-900 flex items-center justify-center">
              <h2 className="text-3xl font-bold">I AM mc2i</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Plateforme de formation AMOA avec simulations d'entretiens et jeux d'investigation.
              </p>
              <Link href="/amoa">
                <a className="block w-full py-3 px-4 bg-green-600 text-center rounded-md hover:bg-green-700 transition-colors font-medium">
                  Accéder
                </a>
              </Link>
            </div>
          </div>
          
          {/* Module I AM DATA IA */}
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:opacity-90 transition-all duration-300 border border-gray-700">
            <div className="h-40 bg-purple-900 flex items-center justify-center relative">
              <h2 className="text-3xl font-bold">I AM DATA IA</h2>
              <div className="absolute top-0 right-0 bg-amber-500 text-black px-3 py-1 text-sm font-medium">
                Bientôt disponible
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Plateforme de formation Data et IA avec simulations et projets pratiques.
              </p>
              <button 
                disabled
                className="block w-full py-3 px-4 bg-gray-600 text-center rounded-md opacity-70 cursor-not-allowed font-medium"
              >
                En développement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Page "Modules" avec la liste complète des modules disponibles
 */
export function ModulesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Modules disponibles</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Les modules avec leur statut */}
          <ModuleCard 
            title="I AM CYBER" 
            description="Cybersécurité et gestion de crise informatique"
            color="blue"
            href="/cyber"
            available={true}
          />
          
          <ModuleCard 
            title="I AM mc2i" 
            description="AMOA et gestion de projets"
            color="green"
            href="/amoa"
            available={true}
          />
          
          <ModuleCard 
            title="I AM DATA IA" 
            description="Data Science et Intelligence Artificielle"
            color="purple"
            href="/data-ia"
            available={false}
          />
          
          <ModuleCard 
            title="I AM CUSTOM" 
            description="Modules personnalisés et sur mesure"
            color="pink"
            href="/custom"
            available={false}
          />
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/">
            <a className="inline-block py-2 px-6 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">
              Retour à l'accueil
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant de carte pour un module
 */
interface ModuleCardProps {
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'pink';
  href: string;
  available: boolean;
}

function ModuleCard({ title, description, color, href, available }: ModuleCardProps) {
  const bgColors = {
    blue: 'bg-blue-900',
    green: 'bg-green-900',
    purple: 'bg-purple-900',
    pink: 'bg-pink-900'
  };
  
  const buttonColors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    pink: 'bg-pink-600 hover:bg-pink-700'
  };
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700">
      <div className={`h-32 ${bgColors[color]} flex items-center justify-center relative`}>
        <h2 className="text-2xl font-bold">{title}</h2>
        {!available && (
          <div className="absolute top-0 right-0 bg-amber-500 text-black px-3 py-1 text-sm font-medium">
            Bientôt disponible
          </div>
        )}
      </div>
      <div className="p-6">
        <p className="text-gray-300 mb-6">
          {description}
        </p>
        {available ? (
          <Link href={href}>
            <a className={`block w-full py-3 px-4 ${buttonColors[color]} text-center rounded-md transition-colors font-medium`}>
              Accéder
            </a>
          </Link>
        ) : (
          <button 
            disabled
            className="block w-full py-3 px-4 bg-gray-600 text-center rounded-md opacity-70 cursor-not-allowed font-medium"
          >
            En développement
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Page 404 Not Found
 */
export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-8">Page non trouvée</h2>
      <p className="text-lg text-gray-300 mb-8 max-w-md text-center">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link href="/">
        <a className="py-2 px-6 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          Retour à l'accueil
        </a>
      </Link>
    </div>
  );
}