import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { IoChevronBack, IoSettings } from 'react-icons/io5';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';

const DataTopNavigation: React.FC = () => {
  const [, setLocation] = useLocation();
  const { themeMode, setThemeMode } = useTheme();
  
  return (
    <header className="bg-[#121a2c]/80 backdrop-blur-sm border-b border-blue-900/40 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/data-ia')}
            className="hover:bg-blue-900/20"
          >
            <IoChevronBack className="mr-1" />
            Retour
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="high-contrast" className="text-xs text-gray-400">Mode contraste</Label>
            <Switch 
              id="high-contrast" 
              checked={themeMode === 'dark'}
              onCheckedChange={(checked) => setThemeMode(checked ? 'dark' : 'futuristic')}
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-blue-900/20 text-gray-400"
          >
            <IoSettings />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DataTopNavigation;