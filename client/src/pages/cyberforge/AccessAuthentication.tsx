import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent,
  Button
} from '@/components/ui';

interface AccessAuthenticationProps {
  passwordAttempt: string;
  isPasswordCorrect: boolean;
  showPasswordForm: boolean;
  onPasswordChange: (password: string) => void;
  onPasswordSubmit: (e: React.FormEvent) => void;
}

const AccessAuthentication: React.FC<AccessAuthenticationProps> = ({
  passwordAttempt,
  isPasswordCorrect,
  showPasswordForm,
  onPasswordChange,
  onPasswordSubmit
}) => {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="bg-black/40 backdrop-blur-md border-t border-l border-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
        <CardHeader>
          <CardTitle className="text-xl text-blue-100">Accès sécurisé</CardTitle>
          <CardDescription className="text-blue-300">
            Veuillez vous authentifier pour accéder à la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showPasswordForm ? (
            <form onSubmit={onPasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-300 mb-1">
                  Code d'accès
                </label>
                <input
                  type="password"
                  id="password"
                  value={passwordAttempt}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="w-full px-3 py-2 bg-black/70 border border-blue-800/60 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Entrez le code d'accès"
                  required
                />
              </div>
              <Button
                type="submit" 
                className="w-full bg-blue-700 hover:bg-blue-600 text-white transition-all"
              >
                Accéder
              </Button>
            </form>
          ) : (
            <div className="p-4 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100/10 mb-4">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-green-400 mb-2">Authentification réussie</h3>
              <p className="text-sm text-blue-300">Bienvenue dans CyberForge Academy.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AccessAuthentication;