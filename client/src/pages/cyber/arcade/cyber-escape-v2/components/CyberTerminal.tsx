import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CyberTerminalProps {
  messages: string[];
}

/**
 * Console de terminal pour afficher les messages du jeu
 */
const CyberTerminal: React.FC<CyberTerminalProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Défiler automatiquement vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <Card className="bg-black/70 border-green-900 shadow-lg shadow-green-900/10">
      <CardHeader className="border-b border-green-900/50 bg-green-950/30 py-2 px-4 flex flex-row items-center gap-2">
        <Terminal className="h-4 w-4 text-green-500" />
        <span className="text-sm font-mono text-green-500">Terminal Système</span>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea 
          className="h-[300px] bg-black font-mono text-xs px-0"
          ref={scrollRef}
        >
          <div className="p-3 space-y-1">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="text-green-500"
              >
                {message.includes('[ALERTE]') ? (
                  <div className="text-red-500 bg-red-950/20 px-2 py-1 rounded-sm">
                    {message}
                  </div>
                ) : message.includes('[SUCCÈS]') || message.includes('débloqué') ? (
                  <div className="text-blue-400 bg-blue-950/20 px-2 py-1 rounded-sm">
                    {message}
                  </div>
                ) : (
                  <div>{'>'} {message}</div>
                )}
              </motion.div>
            ))}
            
            {/* Curseur clignotant */}
            <div className="flex text-green-500 mt-2">
              <span className="mr-1">{'>'}</span>
              <span className="w-3 h-4 bg-green-500 animate-pulse"></span>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CyberTerminal;