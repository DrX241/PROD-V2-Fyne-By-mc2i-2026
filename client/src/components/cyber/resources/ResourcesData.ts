// Données des ressources éducatives

export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'cours' | 'documentation';
  category: string;
  level: string;
  url: string;
  tags: string[];
}

// Liste des ressources par défaut
export const defaultResources: EducationalResource[] = [
  {
    id: "anssi-guide-hygiene",
    title: "Guide d'hygiène informatique (ANSSI)",
    description: "Les 42 mesures d'hygiène informatique essentielles recommandées par l'ANSSI pour sécuriser votre système d'information.",
    type: "documentation",
    category: "securite-generale",
    level: "debutant",
    url: "https://www.ssi.gouv.fr/guide/guide-dhygiene-informatique/",
    tags: ["bonnes pratiques", "anssi", "référence"]
  },
  {
    id: "incident-response-planning",
    title: "Planification de la réponse aux incidents",
    description: "Comment élaborer un plan de réponse aux incidents de cybersécurité efficace pour votre organisation.",
    type: "article",
    category: "gestion-incidents",
    level: "intermediaire",
    url: "https://www.cert.ssi.gouv.fr/information/CERTA-2004-INF-002/",
    tags: ["incidents", "soc", "planification"]
  },
  {
    id: "vulnerability-management-process",
    title: "Processus de gestion des vulnérabilités",
    description: "Méthodologie pour implémenter un processus de gestion des vulnérabilités dans votre organisation.",
    type: "cours",
    category: "securite-operationnelle",
    level: "intermediaire",
    url: "https://www.ssi.gouv.fr/entreprise/bonnes-pratiques/",
    tags: ["vulnérabilités", "scan", "patch", "remédiation"]
  },
  {
    id: "rgpd-compliance",
    title: "Mise en conformité RGPD",
    description: "Guide pratique pour mettre en œuvre les exigences du Règlement Général sur la Protection des Données.",
    type: "documentation",
    category: "conformite-reglementaire",
    level: "avance",
    url: "https://www.cnil.fr/fr/rgpd-par-ou-commencer",
    tags: ["rgpd", "données personnelles", "conformité"]
  },
  {
    id: "zero-trust-architecture",
    title: "Architecture Zero Trust",
    description: "Principes et mise en œuvre d'une architecture Zero Trust dans votre environnement informatique.",
    type: "article",
    category: "securite-generale",
    level: "avance",
    url: "https://www.ssi.gouv.fr/entreprise/guide/la-securite-des-reseaux/",
    tags: ["zero trust", "architecture", "segmentation"]
  },
  {
    id: "appsec-best-practices",
    title: "Meilleures pratiques de sécurité applicative",
    description: "Les bonnes pratiques de sécurité à intégrer dans le cycle de développement logiciel.",
    type: "cours",
    category: "securite-applicative",
    level: "intermediaire",
    url: "https://owasp.org/www-project-top-ten/",
    tags: ["owasp", "développement", "devops"]
  },
  {
    id: "ransomware-defense",
    title: "Défense contre les ransomwares",
    description: "Stratégies et mesures pour prévenir et répondre aux attaques par ransomware.",
    type: "video",
    category: "gestion-incidents",
    level: "intermediaire",
    url: "https://www.cert.ssi.gouv.fr/information/CERTA-2019-INF-006/",
    tags: ["ransomware", "backup", "restoration"]
  },
  {
    id: "cloud-security",
    title: "Sécurité dans le cloud",
    description: "Comment sécuriser vos données et applications hébergées dans le cloud public.",
    type: "documentation",
    category: "securite-operationnelle",
    level: "avance",
    url: "https://www.ssi.gouv.fr/guide/recommandations-de-securite-pour-les-services-dedie-dinforgerance/",
    tags: ["cloud", "iaas", "paas", "saas"]
  },
  {
    id: "threat-hunting",
    title: "Techniques de threat hunting",
    description: "Méthodologies avancées pour la détection proactive des menaces dans votre réseau.",
    type: "cours",
    category: "securite-operationnelle",
    level: "expert",
    url: "https://www.sans.org/blog/hunting-threats/",
    tags: ["threat hunting", "détection", "ioc"]
  },
  {
    id: "secure-coding",
    title: "Développement sécurisé",
    description: "Techniques et bonnes pratiques pour écrire du code sécurisé et éviter les vulnérabilités courantes.",
    type: "cours",
    category: "securite-applicative",
    level: "intermediaire",
    url: "https://cheatsheetseries.owasp.org/",
    tags: ["code", "développement", "vulnérabilités"]
  },
  {
    id: "nis2-directive",
    title: "Directive NIS2",
    description: "Comprendre les implications de la directive NIS2 pour votre organisation et préparer sa mise en œuvre.",
    type: "article",
    category: "conformite-reglementaire",
    level: "avance",
    url: "https://www.ssi.gouv.fr/entreprise/reglementation/directive-nis-2/",
    tags: ["nis2", "conformité", "réglementation"]
  },
  {
    id: "soc-implementation",
    title: "Mise en place d'un SOC",
    description: "Guide pour construire et opérer un Centre Opérationnel de Sécurité efficace.",
    type: "documentation",
    category: "securite-operationnelle",
    level: "expert",
    url: "https://www.ssi.gouv.fr/entreprise/guide/mise-en-place-dun-soc/",
    tags: ["soc", "monitoring", "détection"]
  }
];

// Fonction pour obtenir des ressources recommandées en fonction des compétences
export function getRecommendedResources(categories: string[], limit: number = 3): EducationalResource[] {
  if (categories.length === 0) {
    // Si aucune catégorie spécifiée, retourner quelques ressources de niveau débutant
    return defaultResources
      .filter(resource => resource.level === 'debutant')
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  }
  
  // Filtrer les ressources qui correspondent aux catégories spécifiées
  const matchingResources = defaultResources.filter(resource => 
    categories.some(category => 
      resource.category.includes(category) || 
      resource.tags.some(tag => tag.includes(category))
    )
  );
  
  // Si pas assez de ressources correspondantes, compléter avec d'autres ressources
  if (matchingResources.length < limit) {
    const remainingCount = limit - matchingResources.length;
    const otherResources = defaultResources
      .filter(resource => !matchingResources.includes(resource))
      .sort(() => 0.5 - Math.random())
      .slice(0, remainingCount);
    
    return [...matchingResources, ...otherResources];
  }
  
  // Retourner un sous-ensemble aléatoire des ressources correspondantes
  return matchingResources
    .sort(() => 0.5 - Math.random())
    .slice(0, limit);
}