import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Search, FileSearch, ArrowLeft, Fingerprint, HardDrive, Shield, Network, Brain } from 'lucide-react';

const SANS = "'Plus Jakarta Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  available: boolean;
  comingSoon?: boolean;
  route: string;
}

export default function CyberArcade() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const games: Game[] = [
    {
      id: 'cyber-escape-v2',
      title: 'CYBER ESCAPE',
      description: 'Escape game immersif de haute volée : 15 minutes pour franchir 10 étapes avec des défis de cybersécurité réalistes. Chronomètre et médailles en jeu !',
      icon: <Shield size={15} color="#64748b" />,
      gradient: 'from-green-600 to-blue-700',
      available: false,
      comingSoon: true,
      route: '/cyber/arcade/cyber-escape-v2'
    },
    {
      id: 'bug-hunter',
      title: 'BUG HUNTER',
      description: 'Incarnez un chercheur en sécurité et trouvez des vulnérabilités dans des applications web. Soumettez des rapports détaillés comme dans un vrai programme de bug bounty.',
      icon: <FileSearch size={15} color="#64748b" />,
      gradient: 'from-red-600 to-amber-700',
      available: false,
      comingSoon: true,
      route: '/cyber/arcade/bug-hunter'
    },
    {
      id: 'brain-hacker',
      title: 'BRAIN HACKER',
      description: 'Ingénierie sociale inversée : incarnez le hacker et trouvez le moyen le plus subtil de piéger la victime',
      icon: <Brain size={15} color="#64748b" />,
      gradient: 'from-fuchsia-500 to-purple-800',
      available: true,
      comingSoon: false,
      route: '/cyber/arcade/brain-hacker'
    },
    {
      id: 'firewall-tactique',
      title: 'FIREWALL TACTIQUE',
      description: 'Construisez une défense réseau en plaçant des composants de sécurité pour stopper des attaques',
      icon: <Network size={15} color="#64748b" />,
      gradient: 'from-indigo-500 to-purple-700',
      available: false,
      comingSoon: true,
      route: '/cyber/arcade/firewall-tactique'
    },
    {
      id: 'code-shield',
      title: 'CODE SHIELD',
      description: 'Créez votre propre antivirus et protégez le système contre les malwares',
      icon: <Shield size={15} color="#64748b" />,
      gradient: 'from-blue-600 to-blue-900',
      available: false,
      comingSoon: true,
      route: '/cyber/arcade/code-shield'
    },
    {
      id: 'cyber-investigator',
      title: 'CYBER INVESTIGATEUR',
      description: 'Résolvez des enquêtes sur des incidents de cybersécurité et identifiez les responsables',
      icon: <Search size={15} color="#64748b" />,
      gradient: 'from-indigo-600 to-indigo-900',
      available: false,
      comingSoon: true,
      route: '/cyber/arcade/cyber-investigator'
    },
    {
      id: 'digital-forensics',
      title: 'ANALYSE FORENSIQUE',
      description: "Analysez des preuves numériques pour reconstruire la chronologie d'attaques sophistiquées",
      icon: <Fingerprint size={15} color="#64748b" />,
      gradient: 'from-emerald-600 to-emerald-900',
      available: false,
      comingSoon: true,
      route: '/cyber/arcade/digital-forensics'
    },
    {
      id: 'threat-intelligence',
      title: 'MENACES AVANCÉES',
      description: "Traquez des acteurs malveillants grâce à l'analyse de renseignements sur les menaces",
      icon: <Shield size={15} color="#64748b" />,
      gradient: 'from-purple-600 to-purple-900',
      available: false,
      comingSoon: true,
      route: '/cyber/arcade/threat-intelligence'
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="CYBER ARCADE" />

      <style>{fonts}</style>

      <div style={{ background: '#ffffff', minHeight: 'calc(100vh - 64px)', fontFamily: SANS, color: '#0f172a' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 40px 80px' }}>

          {/* Back */}
          <Link href="/cyber">
            <button style={{
              fontFamily: MONO,
              fontSize: 11,
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: 44,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: 0,
            }}>
              <ArrowLeft size={12} /> Retour vers ESPACE CYBER
            </button>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 48 }}
          >
            <span style={{
              fontFamily: MONO,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#006a9e',
              display: 'block',
              marginBottom: 8,
            }}>
              ARCADE
            </span>
            <h1 style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              letterSpacing: '-0.035em',
              color: '#0f172a',
              margin: '0 0 8px',
            }}>
              Cyber Arcade
            </h1>
            <p style={{
              fontSize: 14,
              color: '#64748b',
              margin: 0,
              maxWidth: 480,
              lineHeight: 1.6,
            }}>
              Améliorez vos compétences en cybersécurité avec des jeux interactifs conçus pour tous les niveaux.
            </p>
          </motion.div>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', color: '#94a3b8' }}>
              {games.length} JEUX
            </span>
            <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: '#e8eaed',
            marginTop: 1,
          }}>
            {games.map((game) => {
              const isHovered = hoveredGame === game.id;

              const cardContent = (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: isHovered ? '#f7f8fa' : '#ffffff',
                    padding: '22px',
                    position: 'relative',
                    transition: 'background 0.12s ease',
                    cursor: game.comingSoon ? 'default' : 'pointer',
                    opacity: game.comingSoon ? 0.6 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 200,
                  }}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  {/* Icon */}
                  <div style={{
                    width: 32,
                    height: 32,
                    background: '#f7f8fa',
                    border: '1px solid #e8eaed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    flexShrink: 0,
                  }}>
                    {game.icon}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#0f172a',
                    margin: '0 0 8px',
                  }}>
                    {game.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: 13,
                    color: '#64748b',
                    lineHeight: 1.6,
                    margin: '0 0 16px',
                    flex: 1,
                  }}>
                    {game.description}
                  </p>

                  {/* CTA */}
                  <div style={{ paddingTop: 14, borderTop: '1px solid #e8eaed' }}>
                    {game.comingSoon ? (
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#94a3b8' }}>
                        Bientôt disponible
                      </span>
                    ) : (
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: '#006a9e' }}>
                        Jouer maintenant →
                      </span>
                    )}
                  </div>
                </motion.div>
              );

              if (!game.comingSoon) {
                return (
                  <Link key={game.id} href={game.route}>
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div key={game.id}>
                  {cardContent}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </HomeLayout>
  );
}
