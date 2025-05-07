import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CyberTerminalProps {
  messages: string[];
  className?: string;
  title?: string;
  roomName?: string;
  formatMessage: (message: string) => string;
  onClear?: () => void;
}

const CyberTerminal: React.FC<CyberTerminalProps> = ({
  messages,
  className = "",
  title = "Terminal sécurisé v2.0",
  roomName,
  formatMessage,
  onClear
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scrolling lorsque de nouveaux messages apparaissent
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={terminalRef}
      className={`
        font-mono text-green-500 bg-gray-900 border border-green-500 
        p-4 rounded-md overflow-y-auto relative ${className}
      `}
      style={{
        boxShadow: "0 0 10px rgba(0, 255, 0, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)",
        backgroundImage:
          "radial-gradient(rgba(0, 30, 0, 0.3) 10%, transparent 10%), radial-gradient(rgba(0, 30, 0, 0.3) 10%, transparent 10%)",
        backgroundSize: "4px 4px",
        backgroundPosition: "0 0, 2px 2px",
        height: "40vh" // Hauteur par défaut
      }}
    >
      {/* En-tête du terminal */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-green-800">
        <div className="flex items-center">
          <Terminal className="h-4 w-4 mr-2" />
          <span className="text-xs font-bold">{title}</span>
        </div>
        <div className="flex items-center space-x-2">
          {roomName && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-400">
              <Shield className="h-3 w-3 mr-1" />
              {roomName}
            </Badge>
          )}
          {onClear && (
            <button 
              onClick={onClear}
              className="text-green-400 hover:text-green-300 focus:outline-none"
              aria-label="Effacer le terminal"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Contenu du terminal avec animations */}
      <AnimatePresence>
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
            dangerouslySetInnerHTML={{ __html: formatMessage(msg) }}
          />
        ))}
      </AnimatePresence>

      {/* Effet de curseur clignotant */}
      <div className="h-4 relative">
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="absolute h-4 w-2 bg-green-500"
        />
      </div>
    </div>
  );
};

export default CyberTerminal;