import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Code, Database, Users, Lock } from 'lucide-react';
import PageTitle from '@/components/PageTitle';

const SANS = "'Plus Jakarta Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

const COLOR_MAP: Record<string, string> = {
  'bg-blue-600': '#2563eb',
  'bg-emerald-600': '#059669',
  'bg-red-600': '#dc2626',
  'bg-purple-600': '#9333ea',
  'bg-amber-600': '#d97706',
  'bg-cyan-600': '#0891b2',
};

const profiles = [
  {
    id: 'rssi',
    title: "Responsable Sécurité des Systèmes d'Information (RSSI)",
    description: "Pilotez la stratégie de sécurité de l'organisation et supervisez les opérations de cybersécurité",
    color: 'bg-blue-600',
    icon: 'Shield',
    skills: ['Stratégie', 'Gouvernance', 'Risques', 'Conformité', 'Leadership'],
    tasks: [
      'Définir la politique de sécurité',
      'Gérer les risques et les incidents',
      'Piloter les audits et la conformité',
      'Sensibiliser les équipes'
    ]
  },
  {
    id: 'secops',
    title: 'Analyste SOC / SecOps',
    description: 'Surveillez, détectez et répondez aux menaces de cybersécurité en temps réel',
    color: 'bg-emerald-600',
    icon: 'Database',
    skills: ['Détection', 'Réponse', 'Analyse', 'Veille'],
    tasks: [
      'Surveiller les alertes de sécurité',
      'Analyser les incidents',
      'Répondre aux attaques',
      'Maintenir les outils de détection'
    ]
  },
  {
    id: 'pentester',
    title: 'Pentesteur / Ethical Hacker',
    description: 'Testez les systèmes pour trouver les vulnérabilités avant les attaquants',
    color: 'bg-red-600',
    icon: 'Code',
    skills: ['Offensive', 'Vulnérabilités', 'Exploitation', 'Remédiation'],
    tasks: [
      'Tester les systèmes et applications',
      'Exploiter des vulnérabilités',
      'Documenter les résultats',
      'Proposer des corrections'
    ]
  },
  {
    id: 'consultant',
    title: 'Consultant en Cybersécurité',
    description: "Accompagnez les organisations dans l'amélioration de leur posture de sécurité",
    color: 'bg-purple-600',
    icon: 'Users',
    skills: ['Conseil', 'Audit', 'Formation', 'Transformation'],
    tasks: [
      'Auditer des infrastructures',
      'Conseiller sur les bonnes pratiques',
      'Former les équipes',
      'Accompagner les projets de sécurité'
    ]
  },
  {
    id: 'grc',
    title: 'Spécialiste GRC (Gouvernance, Risque, Conformité)',
    description: 'Assurez la conformité réglementaire et la gestion des risques de cybersécurité',
    color: 'bg-amber-600',
    icon: 'FileText',
    skills: ['Gouvernance', 'Risques', 'Conformité', 'Audit'],
    tasks: [
      'Gérer la conformité réglementaire',
      'Évaluer les risques',
      'Mettre en place des contrôles',
      'Préparer les certifications'
    ]
  },
  {
    id: 'devsecops',
    title: 'Ingénieur DevSecOps',
    description: 'Intégrez la sécurité dans le cycle de développement logiciel et les pipelines CI/CD',
    color: 'bg-cyan-600',
    icon: 'Lock',
    skills: ['Automatisation', 'CI/CD', 'Sécurité du code', 'Infrastructure'],
    tasks: [
      'Sécuriser les pipelines de déploiement',
      'Mettre en place des tests de sécurité automatisés',
      'Hardening des infrastructures',
      'Gérer la sécurité des conteneurs'
    ]
  }
];

const iconMap: Record<string, React.FC<{ size: number; color: string }>> = {
  Shield: ({ size, color }) => <Shield size={size} color={color} />,
  Database: ({ size, color }) => <Database size={size} color={color} />,
  Code: ({ size, color }) => <Code size={size} color={color} />,
  Users: ({ size, color }) => <Users size={size} color={color} />,
  FileText: ({ size, color }) => <FileText size={size} color={color} />,
  Lock: ({ size, color }) => <Lock size={size} color={color} />,
};

export default function ProfilPro() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: SANS, color: '#0f172a' }}>

      <style>{fonts}</style>
      <PageTitle title="Métiers de la Cybersécurité" />

      {/* Header bar */}
      <div style={{ borderBottom: '1px solid #e8eaed', padding: '16px 0' }}>
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <Link href="/cyber">
            <button style={{
              fontFamily: MONO,
              fontSize: 11,
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: 0,
            }}>
              <ArrowLeft size={12} /> Retour
            </button>
          </Link>
          <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
            Profils Professionnels
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 40px 80px' }}>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: 40 }}
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
            MÉTIERS CYBER
          </span>
          <h1 style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
            letterSpacing: '-0.03em',
            color: '#0f172a',
            margin: '0 0 8px',
          }}>
            Découvrez les métiers de la cybersécurité
          </h1>
          <p style={{
            fontSize: 14,
            color: '#64748b',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 500,
          }}>
            Explorez les différentes carrières dans le domaine de la cybersécurité et trouvez celle qui correspond à vos compétences et aspirations professionnelles.
          </p>
        </motion.div>

        {/* Section separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', color: '#94a3b8' }}>
            {profiles.length} PROFILS
          </span>
          <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
        </div>

        {/* Grid 2 colonnes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1,
          background: '#e8eaed',
          marginTop: 1,
        }}>
          {profiles.map((profile) => {
            const profileColor = COLOR_MAP[profile.color] || '#006a9e';
            const IconComponent = iconMap[profile.icon];

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: '#ffffff',
                  padding: '24px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    background: `${profileColor}12`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {IconComponent && <IconComponent size={16} color={profileColor} />}
                  </div>
                  <h3 style={{
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#0f172a',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                    margin: 0,
                  }}>
                    {profile.title}
                  </h3>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: 13,
                  color: '#64748b',
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                }}>
                  {profile.description}
                </p>

                {/* Skills */}
                <div style={{ marginBottom: 14 }}>
                  <span style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    display: 'block',
                    marginBottom: 6,
                  }}>
                    COMPÉTENCES
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        padding: '2px 6px',
                        background: '#f7f8fa',
                        color: '#64748b',
                        border: '1px solid #e8eaed',
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tasks */}
                <div style={{ marginBottom: 20, flex: 1 }}>
                  <span style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    display: 'block',
                    marginBottom: 6,
                  }}>
                    MISSIONS
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {profile.tasks.map((task, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: profileColor, fontSize: 13, lineHeight: 1, marginTop: 1 }}>─</span>
                        <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: '#006a9e',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  onClick={() => {
                    alert(`Simulation du métier: ${profile.title} - Cette fonctionnalité sera disponible prochainement.`);
                  }}
                >
                  Découvrir ce métier
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
