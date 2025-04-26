import { ReactNode } from 'react';

export type NodeType = 
  | 'server'
  | 'client'
  | 'firewall'
  | 'router'
  | 'switch'
  | 'database'
  | 'cloud'
  | 'internet';

export type FirewallConfig = {
  allowedTraffic: string[];
  blockedTraffic: string[];
  isConfigured: boolean;
};

export interface NetworkNode {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  icon: ReactNode;
  position: {
    x: number;
    y: number;
  };
  securityLevel: number; // 1-5
  firewall?: FirewallConfig;
}

export interface NetworkConnection {
  id: string;
  source: string;
  target: string;
  isRequired: boolean;
  isSecure: boolean;
  type: 'data' | 'control' | 'internet';
  label?: string;
}

export interface NetworkLevel {
  id: number;
  name: string;
  description: string;
  hints: string[];
  constraints: string[];
  maxScore: number;
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  requiredConnections: string[][]; // Array of node ID pairs that must be connected
  forbiddenConnections: string[][]; // Array of node ID pairs that must not be connected
  securityRules: string[]; // Array of security rules that must be followed
}

export interface NetworkPuzzleGameProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameEnd?: (score: number) => void;
}

export interface GameState {
  currentLevelIndex: number;
  levels: NetworkLevel[];
  currentConnections: NetworkConnection[];
  score: number;
  selectedNode: string | null;
  isComplete: boolean;
  feedbackVisible: boolean;
  feedbackMessage: string;
  showAIHelp: boolean;
  aiMessage: string;
  aiInputValue: string;
}