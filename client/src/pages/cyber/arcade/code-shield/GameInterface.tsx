
import React from 'react';
import { Shield, FileCode, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Rule {
  id: string;
  type: 'signature' | 'static' | 'behavior' | 'sandbox' | 'polymorphic';
  condition: string;
  action: string;
}

interface File {
  id: string;
  name: string;
  content: string;
  isMalicious: boolean;
  type: string;
}

interface GameInterfaceProps {
  level: number;
  score: number;
  files: File[];
  currentRules: Rule[];
  onAddRule: (rule: Rule) => void;
  onAnalyze: () => void;
}

export default function GameInterface({
  level,
  score,
  files,
  currentRules,
  onAddRule,
  onAnalyze
}: GameInterfaceProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-gray-800/70 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Fichiers à analyser</h2>
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{file.name}</h3>
                  <span className="text-sm text-gray-300">{file.type}</span>
                </div>
                <pre className="bg-black/30 p-2 rounded text-sm text-gray-300 overflow-x-auto">
                  {file.content}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card className="bg-gray-800/70 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Niveau {level}</h2>
            <Progress value={score} className="h-2" />
            <p className="text-sm text-gray-300 mt-1">Score: {score} points</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-medium">Règles actives</h3>
            {currentRules.map((rule) => (
              <div key={rule.id} className="bg-gray-700/50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-gray-300">
                  <Shield className="h-4 w-4 mr-2 text-blue-400" />
                  {rule.condition} → {rule.action}
                </div>
              </div>
            ))}

            <Button
              onClick={() => onAnalyze()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Lancer l'analyse
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
