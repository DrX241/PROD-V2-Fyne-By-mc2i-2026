import React, { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { LayoutGrid, Rocket } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface ThemeSwitchProps {
  className?: string;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ className }) => {
  const { themeMode, toggleTheme } = useTheme();
  const isFuturistic = themeMode === 'futuristic';

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
    
    return () => {
      // Cleanup function
      document.body.style.backgroundColor = '';
    };
  }, [themeMode]);

  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
      <LayoutGrid 
        className={`h-4 w-4 transition-colors ${isFuturistic ? 'text-gray-400' : 'text-blue-600'}`} 
      />
      
      <div className="relative">
        <Switch
          checked={isFuturistic}
          onCheckedChange={toggleTheme}
          className={`${isFuturistic ? 'bg-cyan-700' : 'bg-blue-600'} relative inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
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
      
      <Rocket 
        className={`h-4 w-4 transition-colors ${isFuturistic ? 'text-cyan-400' : 'text-gray-400'}`}
      />
      
      <Label className={`text-sm font-medium ${isFuturistic ? 'text-cyan-300' : 'text-blue-600'}`}>
        {isFuturistic ? 'Futuriste' : 'Classique'}
      </Label>
    </div>
  );
};

export default ThemeSwitch;