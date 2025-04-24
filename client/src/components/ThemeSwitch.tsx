import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Rocket } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface ThemeSwitchProps {
  className?: string;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ className }) => {
  const { themeMode, toggleTheme } = useTheme();
  const isFuturistic = themeMode === 'futuristic';

  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
      <Sun 
        className={`h-4 w-4 transition-colors ${isFuturistic ? 'text-gray-400' : 'text-amber-500'}`} 
      />
      
      <div className="relative">
        <Switch
          checked={isFuturistic}
          onCheckedChange={toggleTheme}
          className={`${isFuturistic ? 'bg-cyan-700' : 'bg-blue-600'} relative inline-flex items-center transition-colors`}
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
      
      {isFuturistic ? (
        <Rocket 
          className="h-4 w-4 text-cyan-400" 
        />
      ) : (
        <Moon 
          className="h-4 w-4 text-blue-600" 
        />
      )}
      
      <Label className={`text-sm font-medium ${isFuturistic ? 'text-cyan-300' : 'text-gray-700'}`}>
        {isFuturistic ? 'Futuriste' : 'Classique'}
      </Label>
    </div>
  );
};

export default ThemeSwitch;