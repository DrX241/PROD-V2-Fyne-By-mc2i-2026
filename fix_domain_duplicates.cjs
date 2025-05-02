#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lire le fichier
const filePath = 'client/src/contexts/ChatContext.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Fonction pour supprimer les doublons
function removeDuplicateDomainProps(content) {
  // Rechercher les occurrences de domain suivies de domainId puis d'un autre domain
  const regex1 = /(domain: "([^"]+)",\s+domainId: "([^"]+)",\s+domain: "([^"]+)")/g;
  content = content.replace(regex1, 'domain: "$2", domainId: "$3"');
  
  // Rechercher les occurrences de domainId suivies d'un domain puis d'un autre domain
  const regex2 = /(domainId: "([^"]+)",\s+domain: "([^"]+)",\s+domain: "([^"]+)")/g;
  content = content.replace(regex2, 'domainId: "$2", domain: "$3"');
  
  return content;
}

// Traiter le contenu
const updatedContent = removeDuplicateDomainProps(content);

// Écrire le fichier mis à jour
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('Doublons de propriété domain supprimés.');
