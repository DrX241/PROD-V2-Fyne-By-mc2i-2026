import React from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Network, FileDigit, Server, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const NetworkLab: React.FC = () => {
  const [, setLocation] = useLocation();

  const codeSnippet = `
# Chargement du fichier PCAP
capture = pyshark.FileCapture('malware-traffic.pcap')

# Extraction des adresses IP et ports
ip_src = []
ip_dst = []
ports = []

for packet in capture:
    if hasattr(packet, 'ip'):
        ip_src.append(packet.ip.src)
        ip_dst.append(packet.ip.dst)
    if hasattr(packet, 'tcp'):
        ports.append(int(packet.tcp.dstport))

# Analyse des communications
ip_count = Counter(ip_dst)
port_count = Counter(ports)

# Visualisation
plt.figure(figsize=(10, 6))
plt.bar(list(port_count.keys())[:10], list(port_count.values())[:10])
plt.title('Top 10 ports de destination')
plt.xlabel('Port')
plt.ylabel('Nombre de paquets')
plt.savefig('port_analysis.png')

# Recherche de modèles suspects
suspicious_patterns = []
for packet in capture:
    if hasattr(packet, 'dns'):
        if len(packet.dns.qry_name) > 30:
            suspicious_patterns.append({
                'type': 'DNS suspect',
                'details': packet.dns.qry_name,
                'timestamp': packet.sniff_time
            })

print("[INFO] Détection d'activités suspectes")
`.repeat(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      {/* Bouton de retour */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/50 border-cyan-800 text-cyan-400 hover:bg-black/70 hover:text-cyan-300 hover:border-cyan-500 transition-colors"
          onClick={() => setLocation('/cyber/cyber-lab')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au Cyber Lab
        </Button>
      </div>

      {/* En-tête */}
      <div className="mb-8 text-center mt-6">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Laboratoire d'Analyse de Trafic Réseau</h1>
        <p className="text-gray-300 max-w-3xl mx-auto">
          Analysez des captures réseau pour identifier les menaces et vulnérabilités. Utilisez des outils spécialisés pour détecter les comportements malveillants.
        </p>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="captures" className="w-full max-w-5xl mx-auto">
        <TabsList className="w-full mb-6 bg-gray-900/50 border border-cyan-900/50">
          <TabsTrigger value="captures" className="flex-1 data-[state=active]:bg-cyan-900/40 data-[state=active]:text-cyan-100">
            <FileDigit className="w-4 h-4 mr-2" />
            Captures PCAP
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex-1 data-[state=active]:bg-cyan-900/40 data-[state=active]:text-cyan-100">
            <Network className="w-4 h-4 mr-2" />
            Outils d'analyse
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex-1 data-[state=active]:bg-cyan-900/40 data-[state=active]:text-cyan-100">
            <Server className="w-4 h-4 mr-2" />
            Tutoriels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="captures">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900/80 border border-cyan-900/50 hover:border-cyan-500/50 transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Trafic malveillant.pcap</CardTitle>
                  <Badge className="bg-cyan-900/50 text-cyan-300">2.4 MB</Badge>
                </div>
                <CardDescription>
                  Capture de trafic C2 vers un serveur malveillant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                    <span className="text-gray-300">128 paquets analysés</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                    <span className="text-gray-300">IP source: 192.168.1.100</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                    <span className="text-gray-300">IP destination: 203.0.113.45</span>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-cyan-900/60 hover:bg-cyan-800 text-white hover:text-white border border-cyan-700"
                  >
                    Analyser
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border border-cyan-900/50 hover:border-cyan-500/50 transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Scan de ports.pcap</CardTitle>
                  <Badge className="bg-cyan-900/50 text-cyan-300">1.8 MB</Badge>
                </div>
                <CardDescription>
                  Scan de ports massif avec Nmap contre un serveur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                    <span className="text-gray-300">356 paquets analysés</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                    <span className="text-gray-300">Tentatives de connexion multiples</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                    <span className="text-gray-300">Paquets TCP SYN, ACK, RST</span>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-cyan-900/60 hover:bg-cyan-800 text-white hover:text-white border border-cyan-700"
                  >
                    Analyser
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border border-cyan-900/50 hover:border-cyan-500/50 transition-all">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Attaque web.pcap</CardTitle>
                  <Badge className="bg-cyan-900/50 text-cyan-300">3.2 MB</Badge>
                </div>
                <CardDescription>
                  Tentative d'exploitation d'une vulnérabilité web
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                    <span className="text-gray-300">245 paquets analysés</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                    <span className="text-gray-300">Requêtes HTTP POST suspectes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                    <span className="text-gray-300">Tentatives d'injection SQL</span>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-cyan-900/60 hover:bg-cyan-800 text-white hover:text-white border border-cyan-700"
                  >
                    Analyser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-black/50 border border-cyan-900/30 mt-6">
            <CardContent className="p-4">
              <div className="font-mono text-xs text-cyan-400">
                <div className="font-bold mb-2">[CONSOLE D'ANALYSE]</div>
                <p className="opacity-60">Sélectionnez une capture PCAP et cliquez sur "Analyser" pour afficher les résultats...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/80 border border-cyan-900/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Network className="h-5 w-5 mr-2 text-cyan-400" />
                  Analyseur de flux réseau
                </CardTitle>
                <CardDescription>
                  Visualisez les flux de communication entre adresses IP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-10 flex flex-col items-center justify-center bg-gray-950 rounded-md">
                  <AlertTriangle className="h-16 w-16 text-cyan-500 opacity-20 mb-4" />
                  <p className="text-gray-400 text-center">Module en cours de développement</p>
                  <p className="text-gray-500 text-xs text-center mt-2">Disponible dans la prochaine mise à jour</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border border-cyan-900/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileDigit className="h-5 w-5 mr-2 text-cyan-400" />
                  Analyseur de protocoles
                </CardTitle>
                <CardDescription>
                  Examinez la répartition des protocoles dans votre capture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-10 flex flex-col items-center justify-center bg-gray-950 rounded-md">
                  <AlertTriangle className="h-16 w-16 text-cyan-500 opacity-20 mb-4" />
                  <p className="text-gray-400 text-center">Module en cours de développement</p>
                  <p className="text-gray-500 text-xs text-center mt-2">Disponible dans la prochaine mise à jour</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tutorials">
          <Card className="bg-gray-900/80 border border-cyan-900/50">
            <CardHeader>
              <CardTitle>Tutoriels d'analyse réseau</CardTitle>
              <CardDescription>
                Ressources éducatives pour maîtriser l'analyse de trafic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-20 flex items-center justify-center">
                <p className="text-gray-400 italic">Module en cours de développement...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Animation de code en arrière-plan */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 opacity-15 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 opacity-70"></div>
        <pre className="text-cyan-500 text-xs animate-scrolling-code font-mono">
          {codeSnippet}
        </pre>
      </div>
    </div>
  );
};

export default NetworkLab;