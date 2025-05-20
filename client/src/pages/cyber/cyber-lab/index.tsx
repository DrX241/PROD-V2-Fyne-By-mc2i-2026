import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Terminal, 
  Network, 
  Shield, 
  Zap,
  ArrowRight,
  ChevronLeft,
  Bot,
  Code,
  Settings
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

  // Simulation de l'effet de code qui défile avec code plus visible et coloré
  const codeLines = [
    "# == ANALYSEUR DE VULNÉRABILITÉS WEB ==",
    "def scan_for_xss(url):",
    "  payload = '<script>alert(\"XSS\")</script>'",
    "  response = requests.get(url + payload)",
    "  if payload in response.text:",
    "    return '[ALERTE] VULNÉRABLE AU XSS'",
    "  return '[SUCCÈS] SÉCURISÉ'",
    "",
    "# == DÉTECTION D'INJECTION SQL ==",
    "def test_sql_injection(form_url):",
    "  payloads = [\"' OR 1=1 --\", \"admin' --\", \"1' UNION SELECT 1,2,3 --\"]",
    "  for p in payloads:",
    "    if vulnerable_to_injection(form_url, p):",
    "      return '[ALERTE] INJECTION SQL DÉTECTÉE'",
    "",
    "# == ANALYSE DE TRAFIC RÉSEAU ==",
    "def analyze_packets(pcap_file):",
    "  packets = rdpcap(pcap_file)",
    "  suspicious_ips = []",
    "  for pkt in packets:",
    "    if IP in pkt:",
    "      # Détection d'anomalies",
    "      if detect_malicious_pattern(pkt):",
    "        suspicious_ips.append(pkt[IP].src)",
    "  return '[INFO] ADRESSES IP SUSPECTES: ' + str(len(suspicious_ips))",
    "",
    "# == DÉTECTION DE RANÇONGICIEL ==",
    "def detect_ransomware(files):",
    "  encrypted_count = 0",
    "  for file in files:",
    "    if has_encryption_markers(file):",
    "      encrypted_count += 1",
    "  risk_level = 'CRITIQUE' if encrypted_count > 10 else 'MODÉRÉ'",
    "  return f'[ALERTE] MENACE DÉTECTÉE - Niveau: {risk_level}'"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      {/* Bouton de retour */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/50 border-cyan-800 text-cyan-400 hover:bg-black/70 hover:text-cyan-300 hover:border-cyan-500 transition-colors"
          onClick={() => setLocation('/cyber-v3')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour vers I AM CYBER
        </Button>
      </div>

      {/* En-tête */}
      <div className="mb-10 text-center mt-6">
        <h1 className="text-4xl font-bold text-cyan-300 mb-3 cyber-glitch-text">CYBER LAB</h1>
        <p className="text-gray-300 max-w-3xl mx-auto text-lg">
          Bienvenue dans l'environnement d'expérimentation pratique des concepts de cybersécurité. 
          Choisissez un module pour commencer votre apprentissage par la pratique.
        </p>
      </div>

      {/* Animation de code en arrière-plan - opacité améliorée */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 opacity-50 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-30"></div>
        <pre className="text-sky-400 text-lg font-bold animate-scrolling-code font-mono relative z-5">
          {Array(30).fill(codeLines).flat().join('\n')}
        </pre>
      </div>

      {/* Modules de laboratoire */}
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto z-10 relative">
        {/* Module de Pentest Web */}
        <motion.div
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ duration: 0.3 }}
          variants={cardVariants}
        >
          <Card className="bg-gray-900/80 border-2 border-purple-900/50 hover:border-purple-500 h-full shadow-lg shadow-purple-900/20 hover:shadow-purple-800/40 transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-purple-300 flex items-center gap-3 whitespace-nowrap">
                <Terminal className="h-7 w-7" />
                Atelier de Pentest Web
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Découvrez et exploitez les vulnérabilités web dans un environnement sécurisé
              </CardDescription>
            </CardHeader>
            <CardContent className="text-base text-gray-300">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-900/30 p-2 rounded-full mt-0.5">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-200 text-lg">Challenges interactifs</p>
                    <p className="text-sm text-gray-300">Testez vos compétences sur des vulnérabilités réelles: XSS, injection SQL, CSRF, etc.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-900/30 p-2 rounded-full mt-0.5">
                    <Zap className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-200 text-lg">Exécution de code réel</p>
                    <p className="text-sm text-gray-300">Écrivez et exécutez du code pour exploiter et corriger des failles de sécurité</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button 
                className="w-full bg-purple-900/80 hover:bg-purple-800 text-white hover:text-white border-2 border-purple-700 hover:border-purple-500 py-6 text-lg group"
                onClick={() => setLocation('/cyber/roleplay')}
              >
                <span>Accéder aux simulations</span>
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>



        {/* Module Assistant Cyber Personnalisé */}
        <motion.div
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ duration: 0.3, delay: 0.2 }}
          variants={cardVariants}
        >
          <Card className="bg-gray-900/80 border-2 border-emerald-900/50 hover:border-emerald-500 h-full shadow-lg shadow-emerald-900/20 hover:shadow-emerald-800/40 transition-all">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-emerald-300 flex items-center gap-3 whitespace-nowrap">
                <Bot className="h-7 w-7" />
                Assistant Cyber
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Concevez et déployez un assistant IA spécialisé en cybersécurité selon vos besoins
              </CardDescription>
            </CardHeader>
            <CardContent className="text-base text-gray-300">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-900/30 p-2 rounded-full mt-0.5">
                    <Code className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-200 text-lg">IA personnalisable</p>
                    <p className="text-sm text-gray-300">Développez un assistant spécialisé dans les domaines précis de la cybersécurité qui vous intéressent</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-900/30 p-2 rounded-full mt-0.5">
                    <Settings className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-200 text-lg">Paramétrage avancé</p>
                    <p className="text-sm text-gray-300">Configurez le ton, les connaissances et les compétences de votre assistant virtuel</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button 
                className="w-full bg-emerald-900/80 hover:bg-emerald-800 text-white hover:text-white border-2 border-emerald-700 hover:border-emerald-500 py-6 text-lg group"
                onClick={() => setLocation('/cyber/tools/assistant-cyber')}
              >
                <span>Créer mon assistant</span>
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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