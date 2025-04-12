import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  TerminalSquare, Target, LockKeyhole, Network, BrainCircuit, Users, Shield, Joystick, 
  ArrowLeft, ArrowRight, Scroll as GraduationCap, Search, FileKey, Bug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import ComingSoonPage from '@/components/cyber/ComingSoonPage';

interface GameOption {
  id: string;
  title: string;
  description: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  icon: React.ReactNode;
  gradient: string;
  comingSoon?: boolean;
}

export default function CyberArcade() {
  // Afficher la page "Bientôt disponible" au lieu du contenu réel
  return (
    <ComingSoonPage 
      title="GAMIFICATION AVANCÉE" 
      description="Notre module CYBER ARCADE avec des jeux interactifs et des défis de cybersécurité sera bientôt disponible. Ce module utilisera des technologies de pointe pour vous offrir une expérience d'apprentissage ludique et immersive." 
      backUrl="/cyber" 
      backLabel="Retour à I AM CYBER"
    />
  );
}