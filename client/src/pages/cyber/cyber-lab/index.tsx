import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Terminal, 
  Network, 
  Shield, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import '@/styles/cyber-lab.css';

const CyberLab: React.FC = () => {
  const [, setLocation] = useLocation();

  // Animations des cartes
  const cardVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.03, boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)" }
  };

  // Simulation de l'effet de code qui défile
  const codeLines = [
    "# Analyseur de vulnérabilités web",
    "def scan_for_xss(url):",
    "  payload = '<script>alert(\"XSS\")</script>'",
    "  response = requests.get(url + payload)",
    "  if payload in response.text:",
    "    return 'Vulnérable au XSS'",
    "  return 'Sécurisé'",
    "",
    "# Analyse de trafic réseau",
    "def analyze_packets(pcap_file):",
    "  packets = rdpcap(pcap_file)",
    "  suspicious_ips = []",
    "  for pkt in packets:",
    "    if IP in pkt:",
    "      # Détection d'anomalies",
    "      if is_suspicious(pkt[IP].src):",
    "        suspicious_ips.append(pkt[IP].src)",
    "  return suspicious_ips"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      {/* En-tête */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">CYBER LAB</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Bienvenue dans l'environnement d'expérimentation pratique des concepts de cybersécurité. 
          Choisissez un module pour commencer votre apprentissage par la pratique.
        </p>
      </div>

      {/* Animation de code en arrière-plan */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
        <pre className="text-cyan-400 text-xs animate-scrolling-code">
          {Array(20).fill(codeLines).flat().join('\n')}
        </pre>
      </div>

      {/* Modules de laboratoire */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto z-10 relative">
        {/* Module de Pentest Web */}
        <motion.div
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ duration: 0.3 }}
          variants={cardVariants}
        >
          <Card className="bg-gray-900/80 border-purple-900/50 hover:border-purple-500/50 h-full transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl text-purple-300 flex items-center gap-2">
                <Terminal className="h-6 w-6" />
                Atelier de Pentest Web
              </CardTitle>
              <CardDescription className="text-gray-400">
                Découvrez et exploitez les vulnérabilités web dans un environnement sécurisé
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-purple-900/30 p-1 rounded-full mt-0.5">
                    <Shield className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-200">Challenges interactifs</p>
                    <p className="text-xs text-gray-400">Testez vos compétences sur des vulnérabilités réelles: XSS, injection SQL, CSRF, etc.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-purple-900/30 p-1 rounded-full mt-0.5">
                    <Zap className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-200">Exécution de code réel</p>
                    <p className="text-xs text-gray-400">Écrivez et exécutez du code pour exploiter et corriger des failles de sécurité</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-purple-900/60 hover:bg-purple-800 text-white hover:text-white border border-purple-700 group"
                onClick={() => setLocation('/cyber/pentest-lab')}
              >
                <span>Accéder au laboratoire</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Module d'analyse réseau */}
        <motion.div
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ duration: 0.3, delay: 0.1 }}
          variants={cardVariants}
        >
          <Card className="bg-gray-900/80 border-cyan-900/50 hover:border-cyan-500/50 h-full transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl text-cyan-300 flex items-center gap-2">
                <Network className="h-6 w-6" />
                Analyse de trafic réseau
              </CardTitle>
              <CardDescription className="text-gray-400">
                Analysez des captures réseau pour identifier les menaces et vulnérabilités
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-cyan-900/30 p-1 rounded-full mt-0.5">
                    <Shield className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-cyan-200">Forensique réseau</p>
                    <p className="text-xs text-gray-400">Explorez des captures PCAP pour détecter les attaques réseau et exfiltrations de données</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-cyan-900/30 p-1 rounded-full mt-0.5">
                    <Zap className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-cyan-200">Visualisation de données</p>
                    <p className="text-xs text-gray-400">Utilisez des outils d'analyse Python pour interpréter les motifs de trafic malveillant</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-cyan-900/60 hover:bg-cyan-800 text-white hover:text-white border border-cyan-700 group"
                onClick={() => setLocation('/cyber/network-lab')}
              >
                <span>Accéder au laboratoire</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Les styles sont définis dans un fichier CSS séparé */}
    </div>
  );
};

export default CyberLab;