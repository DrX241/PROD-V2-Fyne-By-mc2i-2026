const fs = require('fs');

// Lire le fichier
const filePath = 'client/src/contexts/ChatContext.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Fonction pour ajouter la propriété domain aux scénarios
function addDomainProperty(content) {
  // Rechercher les occurrences de domainId suivi d'une ligne qui ne contient pas domain
  const regex = /(domainId: "([^"]+)"),(?!\s*domain:)/g;
  
  // Remplacer par domainId suivi de domain avec la même valeur
  return content.replace(regex, '$1,\n    domain: "$2"');
}

// Traiter le contenu
const updatedContent = addDomainProperty(content);

// Écrire le fichier mis à jour
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('Propriété domain ajoutée à tous les scénarios manquants.');
