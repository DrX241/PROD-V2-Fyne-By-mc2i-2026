import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  GraduationCap, 
  Brain, 
  Code, 
  ShieldCheck 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// Types
interface Category {
  id: string;
  name: string;
  description: string;
}

interface Difficulty {
  id: string;
  name: string;
  description: string;
}

interface ExerciseType {
  id: string;
  name: string;
  description: string;
}

interface Question {
  id: string;
  type: 'qcm' | 'text' | 'code';
  question: string;
  options?: string[];
  code?: string;
  correctAnswer?: string | string[];
  explanation?: string;
}

interface QuizResponse {
  questionId: string;
  response: string | string[];
}

interface EvaluationResult {
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string;
  detailedResults: {
    questionId: string;
    correct: boolean;
    feedback: string;
  }[];
}

// Main component
export default function CyberTestTechnique() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('');
  const [step, setStep] = useState<'select' | 'quiz' | 'results'>('select');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult | null>(null);
  const [userName, setUserName] = useState<string>('Julien Grimault');
  const [generateProgress, setGenerateProgress] = useState(0);
  const [customTestPrompt, setCustomTestPrompt] = useState('');
  const [customTestTechnical, setCustomTestTechnical] = useState(true);
  const [customTestLevel, setCustomTestLevel] = useState('medium');
  const [customTestQuestionCount, setCustomTestQuestionCount] = useState('5');
  const [useStoredQuestions, setUseStoredQuestions] = useState(true);

  // Banque de questions pré-stockées pour éviter les appels API
  const storedQuestions = {
    web: [
      {
        id: 'web-q1',
        type: 'qcm' as const,
        question: 'Quelle vulnérabilité OWASP permet l\'injection de code malveillant dans une page web?',
        options: ['XSS (Cross-Site Scripting)', 'CSRF (Cross-Site Request Forgery)', 'SQL Injection', 'Directory Traversal'],
        correctAnswer: ['XSS (Cross-Site Scripting)'],
        explanation: 'XSS permet d\'injecter du code JavaScript malveillant qui s\'exécute dans le navigateur des utilisateurs.'
      },
      {
        id: 'web-q2',
        type: 'qcm' as const,
        question: 'Quelle mesure protège le mieux contre les attaques CSRF?',
        options: ['Validation des entrées', 'Tokens anti-CSRF', 'Chiffrement HTTPS', 'Authentification forte'],
        correctAnswer: ['Tokens anti-CSRF'],
        explanation: 'Les tokens anti-CSRF garantissent que la requête provient bien du site légitime.'
      },
      {
        id: 'web-q3',
        type: 'qcm' as const,
        question: 'Quelle injection permet de manipuler directement la base de données?',
        options: ['SQL Injection', 'XSS', 'LDAP Injection', 'Command Injection'],
        correctAnswer: ['SQL Injection'],
        explanation: 'L\'injection SQL permet de manipuler les requêtes vers la base de données.'
      },
      {
        id: 'web-q4',
        type: 'qcm' as const,
        question: 'Quel en-tête HTTP aide à prévenir les attaques de clickjacking?',
        options: ['X-Frame-Options', 'X-XSS-Protection', 'Content-Security-Policy', 'Tous les précédents'],
        correctAnswer: ['X-Frame-Options'],
        explanation: 'X-Frame-Options empêche l\'inclusion de la page dans une iframe.'
      },
      {
        id: 'web-q5',
        type: 'qcm' as const,
        question: 'Quelle vulnérabilité permet l\'accès à des fichiers système?',
        options: ['Directory Traversal', 'XSS', 'CSRF', 'Injection SQL'],
        correctAnswer: ['Directory Traversal'],
        explanation: 'Directory Traversal exploite des chemins relatifs pour accéder à des fichiers non autorisés.'
      },
      {
        id: 'web-q6',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que HTTPS Strict Transport Security (HSTS)?',
        options: ['Force l\'utilisation de HTTPS', 'Chiffre les cookies', 'Valide les certificats', 'Bloque les redirections'],
        correctAnswer: ['Force l\'utilisation de HTTPS'],
        explanation: 'HSTS force le navigateur à utiliser uniquement HTTPS pour communiquer avec le serveur.'
      },
      {
        id: 'web-q7',
        type: 'qcm' as const,
        question: 'Quelle directive CSP empêche l\'exécution de JavaScript inline?',
        options: ['script-src \'self\'', 'unsafe-inline', 'unsafe-eval', 'script-src \'none\''],
        correctAnswer: ['script-src \'self\''],
        explanation: 'CSP script-src \'self\' autorise uniquement les scripts du même domaine, bloquant l\'inline.'
      },
      {
        id: 'web-q8',
        type: 'qcm' as const,
        question: 'Quelle attaque exploite la confiance d\'un utilisateur connecté?',
        options: ['CSRF', 'XSS', 'SQL Injection', 'Brute Force'],
        correctAnswer: ['CSRF'],
        explanation: 'CSRF exploite la session active d\'un utilisateur pour effectuer des actions non autorisées.'
      },
      {
        id: 'web-q9',
        type: 'qcm' as const,
        question: 'Quel mécanisme protège contre les attaques de session fixation?',
        options: ['Régénération d\'ID de session', 'Validation des entrées', 'Chiffrement des cookies', 'Timeout de session'],
        correctAnswer: ['Régénération d\'ID de session'],
        explanation: 'Régénérer l\'ID de session après authentification empêche la fixation de session.'
      },
      {
        id: 'web-q10',
        type: 'qcm' as const,
        question: 'Quelle vulnérabilité permet d\'exécuter des commandes système via une application web?',
        options: ['Command Injection', 'SQL Injection', 'XSS', 'LDAP Injection'],
        correctAnswer: ['Command Injection'],
        explanation: 'L\'injection de commandes permet d\'exécuter des commandes système sur le serveur.'
      },
      {
        id: 'web-q11',
        type: 'qcm' as const,
        question: 'Que signifie OWASP?',
        options: ['Open Web Application Security Project', 'Online Web Access Security Protocol', 'Operational Web Application Safety Program', 'Open Worldwide Application Security Platform'],
        correctAnswer: ['Open Web Application Security Project'],
        explanation: 'OWASP est une organisation dédiée à la sécurité des applications web.'
      },
      {
        id: 'web-q12',
        type: 'qcm' as const,
        question: 'Quel mécanisme protège contre l\'inclusion de fichiers locaux (LFI)?',
        options: ['Validation des chemins', 'Chiffrement des fichiers', 'Compression automatique', 'Cache navigateur'],
        correctAnswer: ['Validation des chemins'],
        explanation: 'La validation stricte des chemins empêche l\'accès à des fichiers non autorisés.'
      },
      {
        id: 'web-q13',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'une attaque LDAP Injection?',
        options: ['Manipulation des requêtes LDAP', 'Injection dans la base de données', 'Attaque sur le serveur web', 'Compromission du DNS'],
        correctAnswer: ['Manipulation des requêtes LDAP'],
        explanation: 'L\'injection LDAP exploite les requêtes vers les annuaires LDAP.'
      },
      {
        id: 'web-q14',
        type: 'qcm' as const,
        question: 'Quel en-tête HTTP empêche le sniffing de type MIME?',
        options: ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection', 'Content-Security-Policy'],
        correctAnswer: ['X-Content-Type-Options'],
        explanation: 'X-Content-Type-Options: nosniff empêche le navigateur de deviner le type MIME.'
      },
      {
        id: 'web-q15',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un cookie sécurisé?',
        options: ['Cookie transmis uniquement en HTTPS', 'Cookie chiffré', 'Cookie temporaire', 'Cookie de session'],
        correctAnswer: ['Cookie transmis uniquement en HTTPS'],
        explanation: 'L\'attribut Secure garantit que le cookie n\'est envoyé qu\'en HTTPS.'
      }
    ],
    network: [
      {
        id: 'net-q1',
        type: 'qcm' as const,
        question: 'Quel protocole sécurise les communications au niveau transport?',
        options: ['TLS/SSL', 'IPSec', 'SSH', 'HTTPS'],
        correctAnswer: ['TLS/SSL'],
        explanation: 'TLS/SSL opère au niveau transport pour chiffrer les communications.'
      },
      {
        id: 'net-q2',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un IDS?',
        options: ['Intrusion Detection System', 'Internet Data System', 'Internal Defense System', 'Integrated Data Security'],
        correctAnswer: ['Intrusion Detection System'],
        explanation: 'IDS détecte les tentatives d\'intrusion sur le réseau.'
      },
      {
        id: 'net-q3',
        type: 'qcm' as const,
        question: 'Quel port utilise HTTPS par défaut?',
        options: ['443', '80', '22', '21'],
        correctAnswer: ['443'],
        explanation: 'HTTPS utilise le port 443 pour les connexions sécurisées.'
      },
      {
        id: 'net-q4',
        type: 'qcm' as const,
        question: 'Quelle attaque exploite les protocoles de routage?',
        options: ['BGP Hijacking', 'ARP Spoofing', 'DNS Poisoning', 'Toutes les précédentes'],
        correctAnswer: ['BGP Hijacking'],
        explanation: 'BGP Hijacking détourne le trafic en annonçant de fausses routes.'
      },
      {
        id: 'net-q5',
        type: 'qcm' as const,
        question: 'Que signifie DDoS?',
        options: ['Distributed Denial of Service', 'Direct Data Override System', 'Dynamic DNS Operation Service', 'Data Destruction on Server'],
        correctAnswer: ['Distributed Denial of Service'],
        explanation: 'DDoS utilise plusieurs sources pour saturer une cible.'
      },
      {
        id: 'net-q6',
        type: 'qcm' as const,
        question: 'Quelle technique permet d\'usurper une adresse MAC?',
        options: ['MAC Spoofing', 'ARP Poisoning', 'DNS Spoofing', 'IP Spoofing'],
        correctAnswer: ['MAC Spoofing'],
        explanation: 'Le MAC Spoofing consiste à modifier l\'adresse MAC de sa carte réseau.'
      },
      {
        id: 'net-q7',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un honeypot?',
        options: ['Système leurre pour attirer les attaquants', 'Outil de chiffrement', 'Protocole de sécurité', 'Type de firewall'],
        correctAnswer: ['Système leurre pour attirer les attaquants'],
        explanation: 'Un honeypot simule des vulnérabilités pour détecter et analyser les attaques.'
      },
      {
        id: 'net-q8',
        type: 'qcm' as const,
        question: 'Quelle est la différence entre IDS et IPS?',
        options: ['IDS détecte, IPS bloque', 'IDS bloque, IPS détecte', 'Aucune différence', 'IDS = hardware, IPS = software'],
        correctAnswer: ['IDS détecte, IPS bloque'],
        explanation: 'IDS détecte les intrusions, IPS (Intrusion Prevention System) les bloque activement.'
      },
      {
        id: 'net-q9',
        type: 'qcm' as const,
        question: 'Quel protocole utilise Wireshark pour capturer le trafic?',
        options: ['Tous les protocoles réseau', 'Seulement HTTP', 'Seulement TCP', 'Seulement UDP'],
        correctAnswer: ['Tous les protocoles réseau'],
        explanation: 'Wireshark peut capturer et analyser le trafic de tous les protocoles réseau.'
      },
      {
        id: 'net-q10',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que le DNS cache poisoning?',
        options: ['Corruption du cache DNS avec de fausses entrées', 'Saturation du serveur DNS', 'Chiffrement des requêtes DNS', 'Redirection DNS légale'],
        correctAnswer: ['Corruption du cache DNS avec de fausses entrées'],
        explanation: 'Le DNS cache poisoning injecte de fausses entrées dans le cache DNS pour rediriger le trafic.'
      },
      {
        id: 'net-q11',
        type: 'qcm' as const,
        question: 'Quel protocole VPN est considéré comme obsolète?',
        options: ['PPTP', 'OpenVPN', 'IKEv2', 'WireGuard'],
        correctAnswer: ['PPTP'],
        explanation: 'PPTP utilise un chiffrement faible et présente des vulnérabilités connues.'
      },
      {
        id: 'net-q12',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un SIEM?',
        options: ['Security Information and Event Management', 'System Integration Event Monitor', 'Security Incident Emergency Management', 'Server Infrastructure Event Monitoring'],
        correctAnswer: ['Security Information and Event Management'],
        explanation: 'Un SIEM collecte et analyse les événements de sécurité en temps réel.'
      },
      {
        id: 'net-q13',
        type: 'qcm' as const,
        question: 'Quelle attaque exploite les faiblesses du protocole WPS?',
        options: ['Attaque par force brute sur le PIN', 'Déchiffrement WPA2', 'Injection de paquets', 'Spoofing d\'adresse MAC'],
        correctAnswer: ['Attaque par force brute sur le PIN'],
        explanation: 'WPS utilise un PIN de 8 chiffres vulnérable aux attaques par force brute.'
      },
      {
        id: 'net-q14',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que le port knocking?',
        options: ['Séquence de connexions pour ouvrir un port', 'Scan de ports automatique', 'Fermeture forcée de connexions', 'Redirection de ports'],
        correctAnswer: ['Séquence de connexions pour ouvrir un port'],
        explanation: 'Le port knocking nécessite une séquence prédéfinie pour accéder à un service.'
      },
      {
        id: 'net-q15',
        type: 'qcm' as const,
        question: 'Quel type d\'attaque peut être détecté par l\'analyse du TTL?',
        options: ['IP Spoofing', 'DNS Spoofing', 'ARP Spoofing', 'MAC Spoofing'],
        correctAnswer: ['IP Spoofing'],
        explanation: 'Les différences de TTL peuvent révéler une usurpation d\'adresse IP.'
      }
    ],
    system: [
      {
        id: 'sys-q1',
        type: 'qcm' as const,
        question: 'Quel principe de sécurité limite les privilèges au minimum nécessaire?',
        options: ['Principe du moindre privilège', 'Défense en profondeur', 'Séparation des devoirs', 'Authentification forte'],
        correctAnswer: ['Principe du moindre privilège'],
        explanation: 'Ce principe limite les droits d\'accès au strict minimum nécessaire.'
      },
      {
        id: 'sys-q2',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que le durcissement (hardening) système?',
        options: ['Réduction de la surface d\'attaque', 'Augmentation des performances', 'Installation de logiciels', 'Sauvegarde des données'],
        correctAnswer: ['Réduction de la surface d\'attaque'],
        explanation: 'Le hardening consiste à réduire les vulnérabilités et services inutiles.'
      },
      {
        id: 'sys-q3',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un rootkit?',
        options: ['Logiciel malveillant furtif', 'Outil d\'administration', 'Type de firewall', 'Protocole de sécurité'],
        correctAnswer: ['Logiciel malveillant furtif'],
        explanation: 'Un rootkit se cache dans le système pour maintenir un accès persistant non détecté.'
      },
      {
        id: 'sys-q4',
        type: 'qcm' as const,
        question: 'Quelle commande Linux permet d\'analyser les connexions réseau actives?',
        options: ['netstat', 'grep', 'chmod', 'crontab'],
        correctAnswer: ['netstat'],
        explanation: 'La commande netstat affiche les connexions réseau, tables de routage et statistiques.'
      },
      {
        id: 'sys-q5',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que l\'authentification à deux facteurs (2FA)?',
        options: ['Deux méthodes de vérification', 'Deux mots de passe', 'Deux utilisateurs', 'Deux serveurs'],
        correctAnswer: ['Deux méthodes de vérification'],
        explanation: 'Le 2FA combine deux facteurs différents (connaissance, possession, inhérence).'
      },
      {
        id: 'sys-q6',
        type: 'qcm' as const,
        question: 'Quelle est la fonction principale d\'un EDR?',
        options: ['Détection et réponse sur les endpoints', 'Chiffrement des données', 'Gestion des identités', 'Contrôle d\'accès réseau'],
        correctAnswer: ['Détection et réponse sur les endpoints'],
        explanation: 'EDR (Endpoint Detection and Response) surveille et protège les postes de travail.'
      },
      {
        id: 'sys-q7',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un privilege escalation?',
        options: ['Élévation non autorisée de privilèges', 'Authentification normale', 'Chiffrement avancé', 'Sauvegarde système'],
        correctAnswer: ['Élévation non autorisée de privilèges'],
        explanation: 'L\'escalade de privilèges permet d\'obtenir des droits supérieurs non autorisés.'
      },
      {
        id: 'sys-q8',
        type: 'qcm' as const,
        question: 'Quelle technique permet de masquer des fichiers dans un système Windows?',
        options: ['Attribut caché', 'Chiffrement', 'Compression', 'Fragmentation'],
        correctAnswer: ['Attribut caché'],
        explanation: 'L\'attribut caché rend les fichiers invisibles dans l\'explorateur par défaut.'
      },
      {
        id: 'sys-q9',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que la stéganographie?',
        options: ['Dissimulation d\'information dans un autre support', 'Chiffrement fort', 'Authentification biométrique', 'Contrôle d\'intégrité'],
        correctAnswer: ['Dissimulation d\'information dans un autre support'],
        explanation: 'La stéganographie cache des données secrètes dans des fichiers apparemment innocents.'
      },
      {
        id: 'sys-q10',
        type: 'qcm' as const,
        question: 'Quel outil permet l\'analyse forensique d\'un disque dur?',
        options: ['Autopsy', 'Nmap', 'Wireshark', 'Metasploit'],
        correctAnswer: ['Autopsy'],
        explanation: 'Autopsy est une plateforme forensique pour analyser les disques et récupérer des preuves.'
      },
      {
        id: 'sys-q11',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un RBAC?',
        options: ['Role-Based Access Control', 'Resource-Based Access Control', 'Rule-Based Access Control', 'Remote-Based Access Control'],
        correctAnswer: ['Role-Based Access Control'],
        explanation: 'RBAC attribue les permissions en fonction des rôles assignés aux utilisateurs.'
      },
      {
        id: 'sys-q12',
        type: 'qcm' as const,
        question: 'Quel fichier contient les mots de passe hashés sous Linux?',
        options: ['/etc/shadow', '/etc/passwd', '/etc/hosts', '/etc/fstab'],
        correctAnswer: ['/etc/shadow'],
        explanation: 'Le fichier /etc/shadow stocke les mots de passe hashés avec accès restreint.'
      },
      {
        id: 'sys-q13',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que l\'ASLR?',
        options: ['Address Space Layout Randomization', 'Automatic System Log Rotation', 'Advanced Security Layer Reinforcement', 'Application Security Level Rating'],
        correctAnswer: ['Address Space Layout Randomization'],
        explanation: 'ASLR randomise la disposition mémoire pour compliquer les exploits.'
      },
      {
        id: 'sys-q14',
        type: 'qcm' as const,
        question: 'Quel est le but d\'un chroot jail?',
        options: ['Isoler un processus dans un système de fichiers restreint', 'Chiffrer les données', 'Accélérer les performances', 'Gérer les utilisateurs'],
        correctAnswer: ['Isoler un processus dans un système de fichiers restreint'],
        explanation: 'Un chroot jail limite l\'accès d\'un processus à une partie du système de fichiers.'
      },
      {
        id: 'sys-q15',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que SELinux?',
        options: ['Security-Enhanced Linux', 'System Enhancement Linux', 'Secure Enterprise Linux', 'Standard Encryption Linux'],
        correctAnswer: ['Security-Enhanced Linux'],
        explanation: 'SELinux implémente un contrôle d\'accès obligatoire granulaire.'
      }
    ],
    crypto: [
      {
        id: 'crypto-q1',
        type: 'qcm' as const,
        question: 'Quelle est la différence principale entre chiffrement symétrique et asymétrique?',
        options: ['Nombre de clés utilisées', 'Vitesse de chiffrement', 'Taille des données', 'Algorithme utilisé'],
        correctAnswer: ['Nombre de clés utilisées'],
        explanation: 'Symétrique utilise une clé, asymétrique utilise une paire de clés publique/privée.'
      },
      {
        id: 'crypto-q2',
        type: 'qcm' as const,
        question: 'Quel algorithme de hachage est considéré comme sécurisé actuellement?',
        options: ['SHA-256', 'MD5', 'SHA-1', 'CRC32'],
        correctAnswer: ['SHA-256'],
        explanation: 'SHA-256 fait partie de la famille SHA-2 et est actuellement considéré comme sécurisé.'
      },
      {
        id: 'crypto-q3',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un certificat numérique?',
        options: ['Document électronique attestant l\'identité', 'Mot de passe chiffré', 'Clé de chiffrement', 'Signature manuscrite'],
        correctAnswer: ['Document électronique attestant l\'identité'],
        explanation: 'Un certificat numérique lie une clé publique à l\'identité de son propriétaire.'
      },
      {
        id: 'crypto-q4',
        type: 'qcm' as const,
        question: 'Quel est l\'objectif principal du salage (salt) des mots de passe?',
        options: ['Prévenir les attaques par rainbow table', 'Accélérer le hachage', 'Réduire la taille du hash', 'Simplifier la vérification'],
        correctAnswer: ['Prévenir les attaques par rainbow table'],
        explanation: 'Le salt rend chaque hash unique même pour des mots de passe identiques.'
      },
      {
        id: 'crypto-q5',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que Perfect Forward Secrecy (PFS)?',
        options: ['Protection des sessions passées si clé compromise', 'Chiffrement renforcé', 'Authentification continue', 'Sauvegarde automatique'],
        correctAnswer: ['Protection des sessions passées si clé compromise'],
        explanation: 'PFS garantit que la compromission d\'une clé ne compromet pas les sessions passées.'
      },
      {
        id: 'crypto-q6',
        type: 'qcm' as const,
        question: 'Quel algorithme de chiffrement symétrique est le standard actuel?',
        options: ['AES', 'DES', '3DES', 'RC4'],
        correctAnswer: ['AES'],
        explanation: 'AES (Advanced Encryption Standard) est le standard de chiffrement symétrique actuel.'
      },
      {
        id: 'crypto-q7',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'une PKI?',
        options: ['Infrastructure à clés publiques', 'Protocole de chiffrement', 'Type de certificat', 'Algorithme de hash'],
        correctAnswer: ['Infrastructure à clés publiques'],
        explanation: 'PKI (Public Key Infrastructure) gère les certificats et clés publiques.'
      },
      {
        id: 'crypto-q8',
        type: 'qcm' as const,
        question: 'Quelle attaque vise à casser le chiffrement par force brute?',
        options: ['Attaque exhaustive', 'Man-in-the-middle', 'Replay attack', 'Social engineering'],
        correctAnswer: ['Attaque exhaustive'],
        explanation: 'L\'attaque exhaustive teste toutes les clés possibles jusqu\'à trouver la bonne.'
      },
      {
        id: 'crypto-q9',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que l\'entropie en cryptographie?',
        options: ['Mesure de l\'imprévisibilité', 'Vitesse de chiffrement', 'Taille de la clé', 'Nombre d\'algorithmes'],
        correctAnswer: ['Mesure de l\'imprévisibilité'],
        explanation: 'L\'entropie mesure le caractère aléatoire et imprévisible d\'une donnée.'
      },
      {
        id: 'crypto-q10',
        type: 'qcm' as const,
        question: 'Quel protocole utilise la cryptographie elliptique?',
        options: ['ECDSA', 'RSA', 'DiffieHellman classique', 'DSA'],
        correctAnswer: ['ECDSA'],
        explanation: 'ECDSA (Elliptic Curve Digital Signature Algorithm) utilise les courbes elliptiques.'
      }
    ],
    incident: [
      {
        id: 'inc-q1',
        type: 'qcm' as const,
        question: 'Quelle est la première étape de gestion d\'incident?',
        options: ['Détection et analyse', 'Endiguement', 'Éradication', 'Récupération'],
        correctAnswer: ['Détection et analyse'],
        explanation: 'Il faut d\'abord détecter et analyser l\'incident avant d\'agir.'
      },
      {
        id: 'inc-q2',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un playbook en cybersécurité?',
        options: ['Procédure de réponse aux incidents', 'Outil de pentesting', 'Type de malware', 'Protocole réseau'],
        correctAnswer: ['Procédure de réponse aux incidents'],
        explanation: 'Un playbook définit les étapes à suivre pour répondre à un type d\'incident spécifique.'
      },
      {
        id: 'inc-q3',
        type: 'qcm' as const,
        question: 'Quelle est la priorité lors d\'un incident de ransomware?',
        options: ['Isoler les systèmes infectés', 'Payer la rançon', 'Redémarrer les serveurs', 'Contacter les médias'],
        correctAnswer: ['Isoler les systèmes infectés'],
        explanation: 'L\'isolation empêche la propagation du ransomware vers d\'autres systèmes.'
      },
      {
        id: 'inc-q4',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un IOC (Indicator of Compromise)?',
        options: ['Indice de compromission', 'Outil de chiffrement', 'Type de certificat', 'Protocole de sécurité'],
        correctAnswer: ['Indice de compromission'],
        explanation: 'Un IOC est un artefact qui indique une intrusion ou activité malveillante.'
      },
      {
        id: 'inc-q5',
        type: 'qcm' as const,
        question: 'Combien de temps maximum pour déclarer un incident RGPD?',
        options: ['72 heures', '24 heures', '1 semaine', '1 mois'],
        correctAnswer: ['72 heures'],
        explanation: 'Le RGPD impose une notification aux autorités dans les 72 heures maximum.'
      },
      {
        id: 'inc-q6',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que la chain of custody?',
        options: ['Chaîne de possession des preuves', 'Méthode de chiffrement', 'Protocole réseau', 'Type d\'audit'],
        correctAnswer: ['Chaîne de possession des preuves'],
        explanation: 'La chaîne de custody documente qui a eu accès aux preuves numériques.'
      },
      {
        id: 'inc-q7',
        type: 'qcm' as const,
        question: 'Quel outil aide à l\'analyse de malware?',
        options: ['Sandbox', 'Firewall', 'Router', 'Switch'],
        correctAnswer: ['Sandbox'],
        explanation: 'Une sandbox permet d\'exécuter et analyser des malwares en environnement isolé.'
      },
      {
        id: 'inc-q8',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un CSIRT?',
        options: ['Équipe de réponse aux incidents', 'Type de malware', 'Protocole de sécurité', 'Outil de pentest'],
        correctAnswer: ['Équipe de réponse aux incidents'],
        explanation: 'CSIRT (Computer Security Incident Response Team) gère les incidents de sécurité.'
      },
      {
        id: 'inc-q9',
        type: 'qcm' as const,
        question: 'Quelle information est cruciale lors de la collecte de preuves?',
        options: ['Horodatage précis', 'Nom de l\'utilisateur', 'Version du système', 'Adresse IP'],
        correctAnswer: ['Horodatage précis'],
        explanation: 'L\'horodatage permet d\'établir la chronologie des événements.'
      },
      {
        id: 'inc-q10',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que la phase de lessons learned?',
        options: ['Analyse post-incident pour amélioration', 'Formation initiale', 'Test de sécurité', 'Audit réglementaire'],
        correctAnswer: ['Analyse post-incident pour amélioration'],
        explanation: 'Cette phase identifie les améliorations à apporter aux processus de sécurité.'
      }
    ],
    governance: [
      {
        id: 'gov-q1',
        type: 'qcm' as const,
        question: 'Que signifie ISO 27001?',
        options: ['Norme de management de la sécurité', 'Protocole de chiffrement', 'Standard de réseau', 'Méthode d\'audit'],
        correctAnswer: ['Norme de management de la sécurité'],
        explanation: 'ISO 27001 est la norme internationale de management de la sécurité de l\'information.'
      },
      {
        id: 'gov-q2',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que le RGPD?',
        options: ['Règlement sur la protection des données', 'Protocole de sécurité', 'Type de chiffrement', 'Méthode d\'audit'],
        correctAnswer: ['Règlement sur la protection des données'],
        explanation: 'Le RGPD régit la protection des données personnelles en Europe.'
      },
      {
        id: 'gov-q3',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'une analyse de risque?',
        options: ['Évaluation des menaces et vulnérabilités', 'Test de pénétration', 'Audit de conformité', 'Formation sécurité'],
        correctAnswer: ['Évaluation des menaces et vulnérabilités'],
        explanation: 'L\'analyse de risque identifie et évalue les risques de sécurité.'
      },
      {
        id: 'gov-q4',
        type: 'qcm' as const,
        question: 'Que signifie CIA en sécurité?',
        options: ['Confidentialité, Intégrité, Disponibilité', 'Central Intelligence Agency', 'Computer Information Analysis', 'Cyber Investigation Agency'],
        correctAnswer: ['Confidentialité, Intégrité, Disponibilité'],
        explanation: 'CIA est la triade fondamentale de la sécurité informatique.'
      },
      {
        id: 'gov-q5',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un DPO?',
        options: ['Délégué à la protection des données', 'Directeur des opérations', 'Département de sécurité', 'Outil de chiffrement'],
        correctAnswer: ['Délégué à la protection des données'],
        explanation: 'Le DPO supervise la conformité RGPD dans l\'organisation.'
      },
      {
        id: 'gov-q6',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un PCA?',
        options: ['Plan de continuité d\'activité', 'Protocole de communication', 'Outil d\'analyse', 'Type de certificat'],
        correctAnswer: ['Plan de continuité d\'activité'],
        explanation: 'Le PCA assure la continuité des activités critiques en cas d\'incident.'
      },
      {
        id: 'gov-q7',
        type: 'qcm' as const,
        question: 'Quelle est la fréquence recommandée pour les audits de sécurité?',
        options: ['Annuelle minimum', 'Tous les 5 ans', 'Jamais', 'Quotidienne'],
        correctAnswer: ['Annuelle minimum'],
        explanation: 'Un audit annuel minimum permet de maintenir un niveau de sécurité adapté.'
      },
      {
        id: 'gov-q8',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que le principe de need-to-know?',
        options: ['Accès limité aux informations nécessaires', 'Partage libre d\'information', 'Chiffrement obligatoire', 'Audit permanent'],
        correctAnswer: ['Accès limité aux informations nécessaires'],
        explanation: 'Le need-to-know limite l\'accès aux seules informations nécessaires au travail.'
      },
      {
        id: 'gov-q9',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'une politique de sécurité?',
        options: ['Document définissant les règles de sécurité', 'Outil de chiffrement', 'Type de firewall', 'Protocole réseau'],
        correctAnswer: ['Document définissant les règles de sécurité'],
        explanation: 'La politique de sécurité établit les règles et responsabilités en matière de sécurité.'
      },
      {
        id: 'gov-q10',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que la classification des données?',
        options: ['Catégorisation selon la sensibilité', 'Compression des fichiers', 'Chiffrement automatique', 'Sauvegarde régulière'],
        correctAnswer: ['Catégorisation selon la sensibilité'],
        explanation: 'La classification organise les données selon leur niveau de sensibilité et protection requise.'
      }
    ],
    cloud: [
      {
        id: 'cloud-q1',
        type: 'qcm' as const,
        question: 'Quel modèle de responsabilité partagée s\'applique au cloud?',
        options: ['Fournisseur: infrastructure, Client: données', 'Client: tout', 'Fournisseur: tout', 'Aucun modèle'],
        correctAnswer: ['Fournisseur: infrastructure, Client: données'],
        explanation: 'Le modèle de responsabilité partagée répartit les responsabilités entre fournisseur et client.'
      },
      {
        id: 'cloud-q2',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que l\'IaaS?',
        options: ['Infrastructure as a Service', 'Information as a Service', 'Integration as a Service', 'Intelligence as a Service'],
        correctAnswer: ['Infrastructure as a Service'],
        explanation: 'IaaS fournit des ressources d\'infrastructure virtualisées via le cloud.'
      },
      {
        id: 'cloud-q3',
        type: 'qcm' as const,
        question: 'Quel risque spécifique au multi-tenant cloud?',
        options: ['Isolation insuffisante entre clients', 'Panne électrique', 'Mise à jour logicielle', 'Sauvegarde manuelle'],
        correctAnswer: ['Isolation insuffisante entre clients'],
        explanation: 'Le multi-tenant partage les ressources, risquant des fuites entre clients.'
      },
      {
        id: 'cloud-q4',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que le CASB?',
        options: ['Cloud Access Security Broker', 'Computer Advanced Security Base', 'Central Application Security Board', 'Cyber Attack Security Bureau'],
        correctAnswer: ['Cloud Access Security Broker'],
        explanation: 'CASB contrôle et sécurise l\'accès aux services cloud.'
      },
      {
        id: 'cloud-q5',
        type: 'qcm' as const,
        question: 'Quelle caractéristique définit le cloud hybride?',
        options: ['Combinaison public/privé', 'Uniquement public', 'Uniquement privé', 'Sans infrastructure'],
        correctAnswer: ['Combinaison public/privé'],
        explanation: 'Le cloud hybride combine infrastructures publiques et privées.'
      },
      {
        id: 'cloud-q6',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que la compliance cloud?',
        options: ['Conformité aux réglementations', 'Performance du réseau', 'Coût d\'utilisation', 'Temps de réponse'],
        correctAnswer: ['Conformité aux réglementations'],
        explanation: 'La compliance assure le respect des réglementations dans le cloud.'
      },
      {
        id: 'cloud-q7',
        type: 'qcm' as const,
        question: 'Quel service gère les identités dans AWS?',
        options: ['IAM', 'EC2', 'S3', 'RDS'],
        correctAnswer: ['IAM'],
        explanation: 'IAM (Identity and Access Management) gère les identités et accès AWS.'
      },
      {
        id: 'cloud-q8',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que le vendor lock-in?',
        options: ['Dépendance à un fournisseur', 'Chiffrement renforcé', 'Accès restreint', 'Sauvegarde automatique'],
        correctAnswer: ['Dépendance à un fournisseur'],
        explanation: 'Le vendor lock-in rend difficile la migration vers un autre fournisseur.'
      },
      {
        id: 'cloud-q9',
        type: 'qcm' as const,
        question: 'Quel protocole sécurise les APIs REST?',
        options: ['HTTPS avec OAuth', 'HTTP simple', 'FTP', 'Telnet'],
        correctAnswer: ['HTTPS avec OAuth'],
        explanation: 'HTTPS chiffre le transport, OAuth gère l\'authentification API.'
      },
      {
        id: 'cloud-q10',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que la résilience cloud?',
        options: ['Capacité à résister aux pannes', 'Vitesse de calcul', 'Coût d\'usage', 'Facilité d\'usage'],
        correctAnswer: ['Capacité à résister aux pannes'],
        explanation: 'La résilience maintient les services malgré les pannes et incidents.'
      }
    ],
    iot: [
      {
        id: 'iot-q1',
        type: 'qcm' as const,
        question: 'Quel protocole est spécifique aux réseaux industriels?',
        options: ['Modbus', 'HTTP', 'FTP', 'SMTP'],
        correctAnswer: ['Modbus'],
        explanation: 'Modbus est un protocole de communication industriel largement utilisé.'
      },
      {
        id: 'iot-q2',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que l\'OT (Operational Technology)?',
        options: ['Systèmes contrôlant les processus physiques', 'Outils de bureautique', 'Ordinateurs personnels', 'Téléphones mobiles'],
        correctAnswer: ['Systèmes contrôlant les processus physiques'],
        explanation: 'L\'OT pilote les équipements industriels et processus de production.'
      },
      {
        id: 'iot-q3',
        type: 'qcm' as const,
        question: 'Quel risque principal des objets IoT mal sécurisés?',
        options: ['Botnet et attaques DDoS', 'Consommation électrique', 'Obsolescence rapide', 'Coût d\'achat'],
        correctAnswer: ['Botnet et attaques DDoS'],
        explanation: 'Les IoT compromis peuvent être utilisés pour des attaques DDoS massives.'
      },
      {
        id: 'iot-q4',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que MQTT?',
        options: ['Protocole de messaging IoT', 'Type de capteur', 'Standard de chiffrement', 'Méthode d\'authentification'],
        correctAnswer: ['Protocole de messaging IoT'],
        explanation: 'MQTT est un protocole léger pour la communication entre objets IoT.'
      },
      {
        id: 'iot-q5',
        type: 'qcm' as const,
        question: 'Quelle vulnérabilité est commune aux caméras IP?',
        options: ['Mots de passe par défaut', 'Surchauffe', 'Mauvaise qualité image', 'Consommation élevée'],
        correctAnswer: ['Mots de passe par défaut'],
        explanation: 'Beaucoup de caméras gardent leurs mots de passe d\'usine, facilitant les intrusions.'
      },
      {
        id: 'iot-q6',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que l\'edge computing?',
        options: ['Traitement local près des capteurs', 'Cloud computing', 'Stockage centralisé', 'Réseau social'],
        correctAnswer: ['Traitement local près des capteurs'],
        explanation: 'L\'edge computing traite les données localement pour réduire la latence.'
      },
      {
        id: 'iot-q7',
        type: 'qcm' as const,
        question: 'Quel protocole sécurise les communications IoT?',
        options: ['CoAP avec DTLS', 'HTTP simple', 'FTP', 'Telnet'],
        correctAnswer: ['CoAP avec DTLS'],
        explanation: 'CoAP avec DTLS fournit communication sécurisée adaptée aux contraintes IoT.'
      },
      {
        id: 'iot-q8',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que l\'attestation de sécurité IoT?',
        options: ['Vérification de l\'intégrité du dispositif', 'Garantie commerciale', 'Test de performance', 'Certification qualité'],
        correctAnswer: ['Vérification de l\'intégrité du dispositif'],
        explanation: 'L\'attestation vérifie que le dispositif IoT n\'a pas été compromis.'
      },
      {
        id: 'iot-q9',
        type: 'qcm' as const,
        question: 'Quel défi pose la mise à jour des dispositifs IoT?',
        options: ['Accès physique difficile', 'Coût élevé', 'Complexité technique', 'Formation utilisateur'],
        correctAnswer: ['Accès physique difficile'],
        explanation: 'Beaucoup d\'IoT sont déployés dans des lieux difficiles d\'accès pour maintenance.'
      },
      {
        id: 'iot-q10',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que le firmware IoT?',
        options: ['Logiciel embarqué dans le dispositif', 'Application mobile', 'Interface web', 'Base de données'],
        correctAnswer: ['Logiciel embarqué dans le dispositif'],
        explanation: 'Le firmware contrôle directement le matériel du dispositif IoT.'
      }
    ]
  };
  const [activeTab, setActiveTab] = useState<string>('standardTest');

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Mock options
  const mockOptions = {
    categories: [
      { id: 'web', name: 'Sécurité Web', description: 'Applications web, OWASP, injections' },
      { id: 'network', name: 'Sécurité Réseau', description: 'Pare-feu, IDS/IPS, protocoles' },
      { id: 'system', name: 'Sécurité Système', description: 'OS, permissions, durcissement' },
      { id: 'crypto', name: 'Cryptographie', description: 'Chiffrement, PKI, signatures' },
      { id: 'incident', name: 'Gestion d\'incidents', description: 'Réponse, forensique, continuité' },
      { id: 'governance', name: 'Gouvernance & Conformité', description: 'ISO 27001, RGPD, audits' },
      { id: 'cloud', name: 'Sécurité Cloud', description: 'AWS, Azure, conteneurs' },
      { id: 'iot', name: 'IoT & OT', description: 'Objets connectés, SCADA, industrie' }
    ],
    difficulties: [
      { id: 'easy', name: 'Débutant', description: 'Concepts fondamentaux' },
      { id: 'medium', name: 'Intermédiaire', description: 'Connaissances approfondies' },
      { id: 'hard', name: 'Avancé', description: 'Expertise technique' }
    ],
    exerciseTypes: [
      { id: 'qcm', name: 'QCM', description: 'Questions à choix multiples' },
      { id: 'text', name: 'Texte', description: 'Réponses rédigées' },
      { id: 'code', name: 'Code', description: 'Analyse et correction de code' }
    ]
  };

  // Simulated options loading
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [options, setOptions] = useState(mockOptions);

  // Generate questions mutation with Azure OpenAI and stored questions
  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: any) => {
      // Update progress during generation
      const progressInterval = setInterval(() => {
        setGenerateProgress(prev => {
          const newValue = prev + 20;
          if (newValue >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newValue;
        });
      }, 200);

      try {
        // Use stored questions by default to minimize API calls
        if (data.useStored && storedQuestions[data.category as keyof typeof storedQuestions]) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
          clearInterval(progressInterval);
          setGenerateProgress(100);
          
          const categoryQuestions = storedQuestions[data.category as keyof typeof storedQuestions];
          
          // Adapter les questions selon le type d'exercice sélectionné
          let adaptedQuestions = categoryQuestions.map((q, index) => {
            if (data.exerciseType === 'text') {
              // Convertir en question ouverte
              return {
                ...q,
                id: `${q.id}-text`,
                type: 'text' as const,
                options: undefined,
                correctAnswer: typeof q.correctAnswer === 'string' ? q.correctAnswer : `Réponse détaillée attendue sur ${q.question.toLowerCase()}`,
              };
            } else if (data.exerciseType === 'code') {
              // Exemples de code spécifiques par catégorie
              const codeExamples: { [key: string]: string } = {
                web: `// Code PHP vulnérable
<?php
$user_id = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $user_id;
$result = mysqli_query($connection, $query);

echo "<script>alert('Bienvenue " . $_POST['name'] . "');</script>";
?>`,
                network: `# Configuration firewall potentiellement problématique
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP

# Configuration SSH
PermitRootLogin yes
PasswordAuthentication yes
Port 22`,
                system: `#!/bin/bash
# Script d'administration système
USER_INPUT=$1
LOGFILE="/var/log/admin.log"

# Traitement des logs
eval "cat $LOGFILE | grep $USER_INPUT"

# Gestion des permissions
chmod 777 /tmp/uploads/
chown -R www-data:www-data /var/www/`,
                crypto: `// Implémentation cryptographique
import hashlib
import random

def hash_password(password):
    # Hachage simple
    return hashlib.md5(password.encode()).hexdigest()

def generate_token():
    # Génération de token
    return str(random.randint(1000, 9999))

def encrypt_data(data, key):
    # Chiffrement XOR simple
    return ''.join(chr(ord(c) ^ ord(key[i % len(key)])) for i, c in enumerate(data))`,
                incident: `// Code de gestion d'incident
function logSecurityEvent(event) {
    var timestamp = new Date().toISOString();
    var logEntry = {
        time: timestamp,
        event: event,
        user: getCurrentUser(),
        ip: getClientIP()
    };
    
    // Log sans validation
    console.log(logEntry);
    sendToSyslog(JSON.stringify(logEntry));
}`,
                governance: `# Politique de mot de passe en configuration
password_policy:
  min_length: 6
  require_uppercase: false
  require_numbers: false
  max_age_days: 365
  
# Contrôles d'accès
access_control:
  admin_users: ["admin", "root", "administrator"]
  default_permissions: "read-write"`,
                cloud: `// Configuration AWS potentiellement risquée
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "*",
      "Resource": "*"
    }
  ]
}

// Code d'accès S3
AWS.config.update({
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
});`,
                iot: `// Code embarqué IoT
#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "IoT_Device";
const char* password = "123456";

WebServer server(80);

void handleRoot() {
  String html = "<html><body>";
  html += "<h1>Device Control</h1>";
  html += "<form action='/control' method='GET'>";
  html += "Command: <input type='text' name='cmd'>";
  html += "</form></body></html>";
  server.send(200, "text/html", html);
}

void handleControl() {
  String cmd = server.arg("cmd");
  system(cmd.c_str()); // Exécution directe
  server.send(200, "text/plain", "Command executed");
}`
              };
              
              // Convertir en analyse de code
              return {
                ...q,
                id: `${q.id}-code`,
                type: 'code' as const,
                code: codeExamples[data.category] || codeExamples.web,
                options: undefined,
                correctAnswer: `Analyser les vulnérabilités dans ce code et proposer des corrections`,
              };
            }
            // Garder en QCM par défaut
            return q;
          });
          
          const shuffled = [...adaptedQuestions].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 10);
          
          return { questions: selected };
        }

        // Fallback to IA generation if stored questions not available or explicitly requested
        const categoryInfo = mockOptions.categories.find(c => c.id === data.category);
        const difficultyInfo = mockOptions.difficulties.find(d => d.id === data.difficulty);
        
        let prompt = '';
        
        if (data.exerciseType === 'qcm') {
          prompt = `Génère exactement 10 questions QCM de cybersécurité pour un test technique.
        
Paramètres:
- Catégorie: ${categoryInfo?.name} (${categoryInfo?.description})
- Niveau: ${difficultyInfo?.name} (${difficultyInfo?.description})
- Type: Questions à choix multiples (QCM)

Génère un JSON avec exactement 10 questions QCM variées. Format:
{
  "questions": [
    {
      "id": "q1",
      "type": "qcm",
      "question": "Question technique précise",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": ["Bonne réponse exacte"],
      "explanation": "Explication technique détaillée"
    }
  ]
}

Chaque question doit avoir 4 options avec une seule bonne réponse.`;
        } else if (data.exerciseType === 'text') {
          prompt = `Génère exactement 10 questions ouvertes de cybersécurité pour un test technique.
        
Paramètres:
- Catégorie: ${categoryInfo?.name} (${categoryInfo?.description})
- Niveau: ${difficultyInfo?.name} (${difficultyInfo?.description})
- Type: Questions ouvertes (texte libre)

Génère un JSON avec exactement 10 questions ouvertes. Format:
{
  "questions": [
    {
      "id": "q1",
      "type": "text",
      "question": "Question ouverte nécessitant une analyse détaillée",
      "correctAnswer": "Réponse détaillée attendue avec éléments clés à mentionner",
      "explanation": "Critères d'évaluation et points importants"
    }
  ]
}

Les questions doivent demander des explications, analyses ou descriptions détaillées.`;
        } else {
          prompt = `Génère exactement 10 exercices d'analyse de code vulnérable pour un test technique.
        
Paramètres:
- Catégorie: ${categoryInfo?.name} (${categoryInfo?.description})
- Niveau: ${difficultyInfo?.name} (${difficultyInfo?.description})
- Type: Analyse de code

Génère un JSON avec exactement 10 exercices de code. Format:
{
  "questions": [
    {
      "id": "q1",
      "type": "code",
      "question": "Analysez ce code et identifiez les vulnérabilités",
      "code": "Code source vulnérable réaliste et technique",
      "correctAnswer": "Analyse détaillée des vulnérabilités et corrections proposées",
      "explanation": "Explication technique des failles et bonnes pratiques"
    }
  ]
}

Le code doit être réaliste, contenir des vulnérabilités techniques et être spécifique à la catégorie.`;
        }

        const result = await apiRequest('/api/openai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'Tu es un expert en cybersécurité qui crée des tests techniques de qualité professionnelle. Réponds uniquement en JSON valide et bien formaté. IMPORTANT: Ta réponse doit être un JSON valide sans aucun texte additionnel, sans délimiteurs de code markdown ni préfixes.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.2,
            top_p: 0.95,
            max_tokens: 2000,
            response_format: { type: "json_object" }
          })
        });

        clearInterval(progressInterval);
        
        if (result.choices?.[0]?.message?.content) {
          const questionsData = JSON.parse(result.choices[0].message.content);
          return questionsData;
        } else {
          throw new Error('Réponse invalide de l\'IA');
        }
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setResponses(data.questions.map(q => ({ questionId: q.id, response: q.type === 'qcm' ? [] : '' })));
      setStep('quiz');
      setGenerateProgress(0);
      toast({
        title: 'Test généré',
        description: 'Votre test technique a été généré avec succès.',
      });
    },
    onError: () => {
      setGenerateProgress(0);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du test.',
        variant: 'destructive',
      });
    }
  });

  // Create custom test mutation with Azure OpenAI
  const createCustomTestMutation = useMutation({
    mutationFn: async (data: any) => {
      // Update progress during generation
      const progressInterval = setInterval(() => {
        setGenerateProgress(prev => {
          const newValue = prev + 5;
          if (newValue >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newValue;
        });
      }, 200);

      try {
        const questionTypes = ['qcm', 'text', 'code'];
        const levelText = data.level === 'easy' ? 'débutant' : data.level === 'medium' ? 'intermédiaire' : 'avancé';
        const technicalText = data.technical ? 'technique' : 'non technique';
        
        const prompt = `Génère exactement ${data.questionCount} questions de cybersécurité de niveau ${levelText} et caractère ${technicalText} sur le sujet suivant: "${data.prompt}".

Crée ${data.questionCount} questions variées incluant des QCM, questions ouvertes et analyses de code.

Format de réponse JSON obligatoire:
{
  "questions": [
    {
      "id": "custom1",
      "type": "qcm",
      "question": "Question QCM précise et contextuelle",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": ["Bonne réponse"],
      "explanation": "Explication détaillée"
    },
    {
      "id": "custom2", 
      "type": "text",
      "question": "Question ouverte détaillée",
      "correctAnswer": "Réponse attendue complète",
      "explanation": "Justification de la réponse"
    },
    {
      "id": "custom3",
      "type": "code",
      "question": "Analysez ce code et identifiez les vulnérabilités",
      "code": "Code source vulnérable réaliste",
      "correctAnswer": "Analyse des vulnérabilités et corrections",
      "explanation": "Explication technique des failles"
    }
  ]
}

Assure-toi de générer exactement ${data.questionCount} questions adaptées au contexte "${data.prompt}".`;

        const result = await apiRequest('/api/openai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'Tu es un expert en cybersécurité qui crée des tests techniques de qualité professionnelle. Réponds uniquement en JSON valide et bien formaté. IMPORTANT: Ta réponse doit être un JSON valide sans aucun texte additionnel, sans délimiteurs de code markdown ni préfixes.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.2,
            top_p: 0.95,
            max_tokens: 3000,
            response_format: { type: "json_object" }
          })
        });

        clearInterval(progressInterval);
        
        if (result.choices?.[0]?.message?.content) {
          const questionsData = JSON.parse(result.choices[0].message.content);
          return questionsData;
        } else {
          throw new Error('Réponse invalide de l\'IA');
        }
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setResponses(data.questions.map(q => ({ questionId: q.id, response: q.type === 'qcm' ? [] : '' })));
      setStep('quiz');
      setGenerateProgress(0);
      toast({
        title: 'Test personnalisé généré',
        description: 'Votre test technique personnalisé a été généré avec succès.',
      });
    },
    onError: () => {
      setGenerateProgress(0);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du test personnalisé.',
        variant: 'destructive',
      });
    }
  });

  // Function to handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setStep('select');
  };

  // Function to handle response change
  const handleResponseChange = (questionId: string, response: string | string[]) => {
    setResponses(prev => 
      prev.map(r => 
        r.questionId === questionId 
          ? { ...r, response }
          : r
      )
    );
  };

  // Evaluate test with Azure OpenAI
  const evaluateTestMutation = useMutation({
    mutationFn: async () => {
      const categoryInfo = mockOptions.categories.find(c => c.id === selectedCategory);
      const difficultyInfo = mockOptions.difficulties.find(d => d.id === selectedDifficulty);
      
      const testData = {
        category: categoryInfo?.name,
        difficulty: difficultyInfo?.name,
        questions: questions.map(q => ({
          question: q.question,
          correctAnswer: q.correctAnswer,
          userResponse: responses.find(r => r.questionId === q.id)?.response || '',
          type: q.type
        }))
      };

      const prompt = `Analyse ce test technique de cybersécurité et fournis un feedback objectif et professionnel.

Données du test:
- Catégorie: ${testData.category}
- Niveau déclaré: ${testData.difficulty}
- Nombre de questions: ${testData.questions.length}

Questions et réponses:
${testData.questions.map((q, i) => `
Question ${i+1}: ${q.question}
Réponse attendue: ${q.correctAnswer}
Réponse de l'utilisateur: ${q.userResponse}
`).join('')}

Fournis une analyse JSON avec:
{
  "score": nombre_points_obtenus,
  "maxScore": ${testData.questions.length},
  "percentage": pourcentage_global,
  "feedback": "Analyse objective et constructive du profil",
  "detailedAnalysis": {
    "strengths": ["Point fort 1", "Point fort 2"],
    "weaknesses": ["Point à améliorer 1", "Point à améliorer 2"],
    "levelConsistency": "Analyse de la cohérence avec le niveau déclaré",
    "recommendations": ["Recommandation 1", "Recommandation 2"],
    "professionalProfile": "Évaluation du profil professionnel"
  },
  "detailedResults": [
    {
      "questionId": "q1",
      "correct": true/false,
      "feedback": "Explication de la correction"
    }
  ]
}

Sois objectif, constructif et professionnel dans ton analyse.`;

      const result = await apiRequest('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en cybersécurité qui évalue des tests techniques. Fournis des analyses objectives et constructives. Réponds uniquement en JSON valide et bien formaté. IMPORTANT: Ta réponse doit être un JSON valide sans aucun texte additionnel, sans délimiteurs de code markdown ni préfixes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          top_p: 0.95,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        })
      });

      if (result.choices?.[0]?.message?.content) {
        return JSON.parse(result.choices[0].message.content);
      } else {
        throw new Error('Impossible d\'évaluer le test');
      }
    },
    onSuccess: (results) => {
      setEvaluationResults(results);
      setStep('results');
    },
    onError: (error) => {
      toast({
        title: 'Erreur d\'évaluation',
        description: 'Impossible d\'analyser vos résultats. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  });

  // Function to go to next question
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Finish test and evaluate with AI
      evaluateTestMutation.mutate();
    }
  };

  // Function to restart test
  const restartTest = () => {
    setStep('select');
    setQuestions([]);
    setResponses([]);
    setCurrentQuestion(0);
    setEvaluationResults(null);
    setGenerateProgress(0);
  };

  // Function to render the user name field with "Bientôt disponible" label
  const renderNameField = () => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Votre nom (à afficher sur le certificat)
        </label>
        <div className="relative">
          <input 
            type="text" 
            className="flex h-10 w-full rounded-md border border-blue-700 bg-blue-900/50 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed opacity-50"
            placeholder="Ex: Julien Grimault"
            readOnly
            disabled
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-3 bg-amber-600 text-white px-2 py-0.5 rounded-sm text-xs">
            Bientôt disponible
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Ce champ sera personnalisable prochainement</p>
      </div>
    );
  };

  // Selection view
  const renderSelectionView = () => (
    <div className="space-y-6">
      {renderNameField()}
      
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Catégorie de test
        </label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-white">
            {options.categories.map(category => (
              <SelectItem key={category.id} value={category.id} className="text-white hover:bg-blue-800">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400 mt-1">
          {selectedCategory && options.categories.find(c => c.id === selectedCategory)?.description}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Niveau de difficulté
        </label>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
            <SelectValue placeholder="Sélectionnez un niveau de difficulté" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-white">
            {options.difficulties.map(difficulty => (
              <SelectItem key={difficulty.id} value={difficulty.id} className="text-white hover:bg-blue-800">
                {difficulty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400 mt-1">
          {selectedDifficulty && options.difficulties.find(d => d.id === selectedDifficulty)?.description}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Type d'exercice
        </label>
        <Select value={selectedExerciseType} onValueChange={setSelectedExerciseType}>
          <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
            <SelectValue placeholder="Sélectionnez un type d'exercice" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-white">
            {options.exerciseTypes.map(type => (
              <SelectItem key={type.id} value={type.id} className="text-white hover:bg-blue-800">
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400 mt-1">
          {selectedExerciseType && options.exerciseTypes.find(t => t.id === selectedExerciseType)?.description}
        </p>
      </div>

      <div className="space-y-4">
        {/* Option pour choisir le type de questions */}
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-2">
            Source des questions
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer text-white">
              <input
                type="radio"
                checked={useStoredQuestions}
                onChange={() => setUseStoredQuestions(true)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span>Questions pré-validées (recommandé)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-white">
              <input
                type="radio"
                checked={!useStoredQuestions}
                onChange={() => setUseStoredQuestions(false)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span>Générer avec IA</span>
            </label>
          </div>
          <p className="text-xs text-blue-300 mt-1">
            {useStoredQuestions 
              ? 'Utilise notre banque de questions validées par des experts' 
              : 'Génère des questions personnalisées avec notre IA avancée'}
          </p>
        </div>

        <Button 
          onClick={() => generateQuestionsMutation.mutate({ 
            category: selectedCategory, 
            difficulty: selectedDifficulty, 
            exerciseType: selectedExerciseType,
            useStored: useStoredQuestions
          })}
          disabled={isLoadingOptions || !selectedCategory || !selectedDifficulty || !selectedExerciseType || generateQuestionsMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          {generateQuestionsMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              Commencer le test
            </>
          )}
        </Button>
        
        {generateQuestionsMutation.isPending && (
          <div className="mt-2 w-full">
            <Progress 
              value={generateProgress} 
              className="h-1.5 bg-blue-950 w-full"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{generateProgress}%</p>
          </div>
        )}
      </div>
    </div>
  );

  // Custom test view
  const renderCustomTestView = () => (
    <div className="space-y-6">
      {renderNameField()}

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">
          Décrivez le test personnalisé que vous souhaitez générer
        </label>
        <Textarea 
          value={customTestPrompt}
          onChange={(e) => setCustomTestPrompt(e.target.value)}
          placeholder="Ex: Créer un test sur la sécurité des API REST avec un focus sur l'authentification OAuth2"
          className="min-h-[120px] bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400"
        />
        <p className="text-xs text-blue-300 mt-1">
          Décrivez le sujet, le contexte et les compétences à évaluer
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">
          Niveau technique
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer text-white">
            <input
              type="radio"
              checked={customTestTechnical}
              onChange={() => setCustomTestTechnical(true)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span>Technique</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer text-white">
            <input
              type="radio"
              checked={!customTestTechnical}
              onChange={() => setCustomTestTechnical(false)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span>Non technique</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">
          Niveau de difficulté
        </label>
        <Select value={customTestLevel} onValueChange={setCustomTestLevel}>
          <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
            <SelectValue placeholder="Sélectionnez un niveau de difficulté" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-white">
            <SelectItem value="easy" className="text-white hover:bg-blue-800">Débutant</SelectItem>
            <SelectItem value="medium" className="text-white hover:bg-blue-800">Intermédiaire</SelectItem>
            <SelectItem value="hard" className="text-white hover:bg-blue-800">Avancé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">
          Nombre de questions
        </label>
        <Select value={customTestQuestionCount} onValueChange={setCustomTestQuestionCount}>
          <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
            <SelectValue placeholder="Sélectionnez le nombre de questions" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-white">
            <SelectItem value="5" className="text-white hover:bg-blue-800">5 questions</SelectItem>
            <SelectItem value="10" className="text-white hover:bg-blue-800">10 questions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4">
        <Button 
          onClick={() => createCustomTestMutation.mutate({ 
            prompt: customTestPrompt,
            technical: customTestTechnical,
            level: customTestLevel,
            questionCount: parseInt(customTestQuestionCount)
          })}
          disabled={!customTestPrompt || createCustomTestMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          {createCustomTestMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              Créer un test personnalisé
            </>
          )}
        </Button>
        
        {createCustomTestMutation.isPending && (
          <div className="mt-2 w-full">
            <Progress 
              value={generateProgress} 
              className="h-1.5 bg-blue-950 w-full"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
            <p className="text-xs text-blue-300 mt-1 text-right">{generateProgress}%</p>
          </div>
        )}
      </div>
    </div>
  );

  // Quiz view - Display questions
  const renderQuizView = () => {
    if (questions.length === 0) return null;

    const currentQ = questions[currentQuestion];
    const currentResponse = responses.find(r => r.questionId === currentQ.id);

    return (
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-blue-200 mb-2">
            <span>Question {currentQuestion + 1} sur {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <Progress 
            value={((currentQuestion + 1) / questions.length) * 100} 
            className="h-2 bg-blue-950"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
          />
        </div>

        {/* Question */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{currentQ.question}</h3>
          
          {currentQ.type === 'qcm' && currentQ.options && (
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer text-white">
                  <input
                    type="radio"
                    name={currentQ.id}
                    checked={currentResponse?.response === option}
                    onChange={() => handleResponseChange(currentQ.id, option)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQ.type === 'text' && (
            <Textarea
              value={currentResponse?.response as string || ''}
              onChange={(e) => handleResponseChange(currentQ.id, e.target.value)}
              placeholder="Saisissez votre réponse..."
              className="min-h-[120px] bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400"
            />
          )}

          {currentQ.type === 'code' && currentQ.code && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{currentQ.code}</code>
                </pre>
              </div>
              <Textarea
                value={currentResponse?.response as string || ''}
                onChange={(e) => handleResponseChange(currentQ.id, e.target.value)}
                placeholder="Analysez le code et décrivez les vulnérabilités trouvées..."
                className="min-h-[120px] bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400"
              />
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
            className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          
          <Button
            onClick={nextQuestion}
            disabled={!currentResponse?.response}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Results view with detailed AI feedback
  const renderResultsView = () => {
    if (!evaluationResults) {
      return (
        <div className="text-center">
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400 mb-4" />
            <p className="text-white">Analyse de vos résultats en cours...</p>
            <p className="text-blue-200 text-sm mt-2">Notre IA évalue vos réponses pour vous fournir un feedback détaillé</p>
          </div>
        </div>
      );
    }

    const detailedAnalysis = (evaluationResults as any).detailedAnalysis;

    return (
      <div className="space-y-6">
        {/* Score global */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Résultats du test</h2>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-6">
            <div className="text-4xl font-bold text-blue-300 mb-2">
              {evaluationResults.percentage}%
            </div>
            <div className="text-white mb-4">
              {evaluationResults.score} / {evaluationResults.maxScore} points
            </div>
            <p className="text-blue-200">{evaluationResults.feedback}</p>
          </div>
        </div>

        {/* Analyse détaillée */}
        {detailedAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points forts */}
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-300 mb-3">Points forts</h3>
              <ul className="space-y-2">
                {detailedAnalysis.strengths?.map((strength: string, index: number) => (
                  <li key={index} className="text-green-100 text-sm flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Points à améliorer */}
            <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-300 mb-3">Points à améliorer</h3>
              <ul className="space-y-2">
                {detailedAnalysis.weaknesses?.map((weakness: string, index: number) => (
                  <li key={index} className="text-amber-100 text-sm flex items-start">
                    <span className="text-amber-400 mr-2">→</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Analyse du profil */}
        {detailedAnalysis && (
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Cohérence du profil</h3>
              <p className="text-blue-200 text-sm">{detailedAnalysis.levelConsistency}</p>
            </div>

            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Profil professionnel</h3>
              <p className="text-blue-200 text-sm">{detailedAnalysis.professionalProfile}</p>
            </div>

            {detailedAnalysis.recommendations && (
              <div className="bg-indigo-900/20 border border-indigo-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">Recommandations</h3>
                <ul className="space-y-2">
                  {detailedAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-indigo-100 text-sm flex items-start">
                      <span className="text-indigo-400 mr-2">💡</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <Button
            onClick={restartTest}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            Nouveau test
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-950 to-slate-950">
      {/* Background grid pattern like other cyber pages */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 container max-w-4xl mx-auto py-6 px-4">
        {/* Bouton retour */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30 hover:text-white mb-4"
            onClick={() => setLocation('/cyber/roleplay')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Test Technique de Cybersécurité</h1>
          <p className="text-blue-200 mt-2">
            Évaluez vos compétences techniques en cybersécurité à travers une série d'exercices pratiques.
          </p>
        </div>

        {step === 'select' && (
          <Card className="bg-gradient-to-b from-blue-950 to-slate-950 border-blue-800 text-white shadow-xl border">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Créer un nouveau test</CardTitle>
              <CardDescription className="text-blue-200">
                Configurez votre test technique selon vos besoins ou générez un test personnalisé.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="standardTest" value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-2 mb-6 bg-blue-900/30 border border-blue-700">
                  <TabsTrigger 
                    value="standardTest" 
                    className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-blue-200"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Test Standard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="customTest" 
                    className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-blue-200"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Test Personnalisé
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="standardTest">
                  {renderSelectionView()}
                </TabsContent>
                
                <TabsContent value="customTest">
                  {renderCustomTestView()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {step === 'quiz' && (
          <Card className="bg-gradient-to-b from-blue-950 to-slate-950 border-blue-800 text-white shadow-xl border">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Test en cours</CardTitle>
              <CardDescription className="text-blue-200">
                Répondez aux questions pour évaluer vos compétences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderQuizView()}
            </CardContent>
          </Card>
        )}

        {step === 'results' && (
          <Card className="bg-gradient-to-b from-blue-950 to-slate-950 border-blue-800 text-white shadow-xl border">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Test terminé</CardTitle>
              <CardDescription className="text-blue-200">
                Découvrez vos résultats et votre niveau de maîtrise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderResultsView()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}