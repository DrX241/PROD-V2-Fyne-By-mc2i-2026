import React, { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { LayoutGrid, Rocket } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ThemeSwitchProps {
  className?: string;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ className }) => {
  const { themeMode, toggleTheme } = useTheme();
  const isFuturistic = themeMode === 'futuristic';

  // Log l'état actuel du thème pour débogage
  console.log("Theme actuel:", themeMode);

  // Changer les couleurs de fond globales en fonction du thème
  useEffect(() => {
    if (isFuturistic) {
      document.body.style.backgroundColor = '#020817'; // Bleu foncé spatial
      document.body.classList.add('theme-futuristic');
      document.body.classList.remove('theme-classic');
    } else {
      document.body.style.backgroundColor = '#ffffff'; // Blanc pur
      document.body.classList.add('theme-classic');
      document.body.classList.remove('theme-futuristic');
    }
    
    // Log après changement
    console.log("Thème appliqué:", isFuturistic ? 'futuristic' : 'classic');
    
    return () => {
      // Cleanup function
      document.body.style.backgroundColor = '';
    };
  }, [themeMode, isFuturistic]);

  const handleThemeToggle = () => {
    console.log("Basculement du thème - avant:", themeMode);
    toggleTheme();
    setTimeout(() => console.log("Thème après basculement:", themeMode), 100);
  };

  return (
    <div className={`flex items-center space-x-3 bg-opacity-80 backdrop-blur px-3 py-1.5 rounded-full ${isFuturistic ? 'bg-blue-900/40' : 'bg-blue-100'} ${className || ''}`}>
      <LayoutGrid 
        className={`h-5 w-5 transition-colors ${isFuturistic ? 'text-gray-300' : 'text-blue-600'}`} 
      />
      
      <div 
        className={`flex items-center px-2 py-1 h-auto cursor-pointer rounded-md 
          ${isFuturistic 
            ? 'text-cyan-300 hover:text-cyan-200 hover:bg-blue-800/40' 
            : 'text-blue-700 hover:text-blue-900 hover:bg-blue-200/60'}`}
        onClick={handleThemeToggle}
      >
        <div className="relative mr-2">
          <Switch
            checked={isFuturistic}
            onCheckedChange={handleThemeToggle}
            className={`${isFuturistic ? 'bg-cyan-700 border-2 border-cyan-500' : 'bg-blue-600'} relative inline-flex h-5 w-9 items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          />
          
          {/* Effet de pulse autour du switch en mode futuriste */}
          {isFuturistic && (
            <motion.div 
              className="absolute inset-0 rounded-full bg-cyan-400/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.2, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
        
        <span className="flex items-center">
          {isFuturistic ? (
            <>
              <span className="font-medium">Futuriste</span> 
              <Rocket className="ml-1 h-4 w-4 text-cyan-400" />
            </>
          ) : (
            <>
              <span className="font-medium">Classique</span>
              <LayoutGrid className="ml-1 h-4 w-4 text-blue-700" />
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default ThemeSwitch;