import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CyberTerminalProps {
  messages: string[];
  formatMessage?: (message: string) => string; // Optionnel pour formatter les messages
}

/**
 * Composant pour afficher un terminal de console avec l'historique des messages
 */
const CyberTerminal: React.FC<CyberTerminalProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Faire défiler automatiquement vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Animation pour l'affichage des nouveaux messages
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <Card className="border-green-600 bg-black/60 h-[500px] flex flex-col">
      <CardHeader className="px-4 py-2 flex-shrink-0 border-b border-green-800 bg-green-900/20">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="text-sm font-mono text-green-400">CYBER TERMINAL v2.1</span>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow relative">
        <ScrollArea className="h-full w-full px-4 py-2">
          <div className="space-y-2 font-mono text-sm pb-2">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={`p-2 rounded ${index % 2 === 0 ? 'bg-green-900/10' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-green-500 flex-shrink-0">&gt;</span>
                  <span className="text-green-100">{message}</span>
                </div>
              </motion.div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        {/* Effet de scanline pour le style rétro */}
        <div className="absolute inset-0 pointer-events-none bg-scanline opacity-10" />
        
        {/* Effet de terminal clignotant */}
        <div className="absolute bottom-3 left-6 w-3 h-5 bg-green-500 opacity-80 animate-pulse" />
      </CardContent>
    </Card>
  );
};

export default CyberTerminal;