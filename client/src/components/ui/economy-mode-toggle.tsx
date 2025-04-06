import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';

export function EconomyModeToggle() {
  const { isEconomyMode, toggleEconomyMode } = useChatContext();

  const handleToggleChange = (checked: boolean) => {
    toggleEconomyMode(checked);
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="economy-mode" 
        checked={isEconomyMode} 
        onCheckedChange={handleToggleChange}
        className={isEconomyMode ? "bg-amber-500" : ""}
      />
      <Label htmlFor="economy-mode" className="text-sm font-medium">
        Mode économie
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-gray-500 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Mode économie utilise le modèle GPT-4o-mini, plus rapide mais moins performant que le modèle standard GPT-4o.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}