import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function SensibilisationSimplePage() {
  const { isDark } = useTheme();
  
  return (
    <HomeLayout>
      <PageTitle title="Sensibilisation à la Cybersécurité" />
      
      <div className={`min-h-screen p-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}`}>
        <div className="container mx-auto">
          <div className="mb-4">
            <Link href="/cyber/learning/cyber-mastery">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour aux parcours
              </Button>
            </Link>
          </div>
          
          <Card className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white'} mb-8`}>
            <CardHeader>
              <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-blue-800'}`}>Module de Sensibilisation Cybersécurité</CardTitle>
            </CardHeader>
            <CardContent className={isDark ? 'text-white' : 'text-slate-800'}>
              <p className="mb-4">
                Bienvenue dans le module de sensibilisation à la cybersécurité.
                Ce module vous aidera à reconnaître et à vous protéger contre les menaces cyber les plus courantes.
              </p>
              <p className="mb-4">
                Ce module complet comprend :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2 mb-6">
                <li>5 niveaux progressifs de difficulté croissante</li>
                <li>15 scénarios interactifs basés sur des situations réelles</li>
                <li>Plus de 45 quiz pour évaluer et renforcer vos connaissances</li>
                <li>Des conseils pratiques de sécurité validés par des experts</li>
                <li>Des références vers les ressources officielles de l'ANSSI et de la CNIL</li>
              </ul>

              <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-slate-700/60' : 'bg-blue-50/60'} flex flex-col items-center`}>
                <h3 className={`font-bold text-xl mb-4 ${isDark ? 'text-white' : 'text-blue-800'}`}>Progression des niveaux</h3>
                <div className="w-full max-w-xl h-3 bg-gray-300 rounded-full mb-4 overflow-hidden">
                  <div className="h-3 bg-blue-600 rounded-full" style={{ width: "100%" }}></div>
                </div>
                <p className={`text-center ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Vous avez complété 5/5 niveaux de ce module.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-blue-50'} flex flex-col items-center`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>1</span>
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-blue-800'}`}>Phishing</h3>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-blue-50'} flex flex-col items-center`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>2</span>
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-blue-800'}`}>Mots de passe</h3>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-blue-50'} flex flex-col items-center`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>3</span>
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-blue-800'}`}>Protection des données</h3>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-blue-50'} flex flex-col items-center`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>4</span>
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-blue-800'}`}>Sécurité mobile</h3>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-blue-50'} flex flex-col items-center`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>5</span>
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-blue-800'}`}>Réseaux sociaux</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border mb-6`}>
            <CardContent className="flex flex-col items-center pt-6 pb-4">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-green-700' : 'bg-green-500'}`}>
                    <CheckCircle className={`h-8 w-8 ${isDark ? 'text-green-300' : 'text-white'}`} />
                  </div>
                </div>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>Module complété avec succès!</h3>
              <p className={`text-center mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Félicitations! Vous avez complété tous les niveaux de ce module et maîtrisez maintenant les concepts essentiels de sensibilisation à la cybersécurité.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>Badge Expert Phishing</div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>Badge Sécurité Données</div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-amber-900/50 text-amber-200' : 'bg-amber-100 text-amber-700'}`}>Badge Protection Mobile</div>
              </div>
            </CardContent>
          </Card>

          <div className={`text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <p className="mb-4">Vous pouvez consulter d'autres modules disponibles dans la page Cyber Mastery.</p>
            <Link href="/cyber/learning/cyber-mastery">
              <Button>Retourner à la page Cyber Mastery</Button>
            </Link>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}