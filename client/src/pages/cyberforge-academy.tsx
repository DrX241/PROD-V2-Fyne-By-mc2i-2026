import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { CyberForgeAcademy } from '@/components/cyber/learning/CyberForgeAcademy';

export default function CyberForgeAcademyPage() {
  const [, setLocation] = useLocation();
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <header className={`py-4 px-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/cyber-mode-selection')}
              className={`${isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-700 hover:text-black hover:bg-slate-100'}`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la sélection
            </Button>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              CyberForge Academy
            </h1>
            <div className="w-32"></div> {/* Spacer pour équilibrer la mise en page */}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <CyberForgeAcademy />
      </main>
    </div>
  );
}