import {
  Shield,
  Network,
  Cloud,
  Search,
  ClipboardList,
  Code,
  UserCheck,
  AlertCircle,
  FileDigit,
  Cpu,
  Building2,
  KeyRound,
  FileCheck,
  ShieldCheck,
  Cog,
  LucideIcon
} from "lucide-react";

interface ThemeIconProps {
  icon: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function ThemeIcon({ icon, className, size = 24, style }: ThemeIconProps) {
  // Définir un mapping entre les noms d'icônes et les composants Lucide
  const iconMap: Record<string, LucideIcon> = {
    'shield': Shield,
    'network-wired': Network,
    'cloud': Cloud,
    'search': Search,
    'clipboard-list': ClipboardList,
    'code': Code,
    'user-check': UserCheck,
    'alert-circle': AlertCircle,
    'file-digit': FileDigit,
    'cpu': Cpu,
    'building': Building2,
    'key': KeyRound,
    'file-check': FileCheck,
    'shield-check': ShieldCheck,
    'cog': Cog
  };
  
  // Obtenir le composant d'icône
  const IconComponent = iconMap[icon] || Shield; // Shield comme icône par défaut
  
  // Rendu du composant d'icône
  return <IconComponent className={className} size={size} style={style} />;
}