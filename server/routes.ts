import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from "../I_AM_CYBER/services/openai";
import { documentGenerator } from "../I_AM_CYBER/services/document-generator";
import { ChatCompletionRequestMessage } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure the documents directory exists
  const documentsDir = path.join(process.cwd(), 'I_AM_CYBER', 'documents');
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }

  // API route for starting a scenario
  app.post('/api/cyber/start-scenario', async (req, res) => {
    try {
      const { scenarioId, userName, config } = req.body;
      
      if (!scenarioId || !userName) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      // Get scenario data - in a real app, this would come from the database
      // For now, we're using hardcoded data matching the client
      const scenarios = [
        // Formation et sensibilisation
        {
          id: "phishing-simulation",
          title: "Simulation d'attaque phishing",
          domain: "Formation et sensibilisation à la cybersécurité",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        {
          id: "security-training",
          title: "Programme de formation à la cybersécurité",
          domain: "Formation et sensibilisation à la cybersécurité",
          contact: {
            name: "Isabelle Dubacq",
            role: "Senior Partner, Directrice des Ressources Humaines"
          },
          difficulty: "Intermédiaire"
        },
        
        // OSINT
        {
          id: "osint-investigation",
          title: "Investigation d'une menace potentielle",
          domain: "L'OSINT",
          contact: {
            name: "Neil LEVIN",
            role: "Expert cybersécurité & CFO"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "digital-footprint",
          title: "Analyse de l'empreinte numérique",
          domain: "L'OSINT",
          contact: {
            name: "Yousra SAIDANI",
            role: "Experte Cybersécurité & CFO"
          },
          difficulty: "Expert"
        },
        
        // Conformité cyber
        {
          id: "gdpr-compliance",
          title: "Mise en conformité RGPD",
          domain: "La conformité cyber en entreprise",
          contact: {
            name: "Vincent Terrier",
            role: "Senior Partner, Directeur Financier"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "iso-certification",
          title: "Préparation à la certification ISO 27001",
          domain: "La conformité cyber en entreprise",
          contact: {
            name: "Vincent Pascal",
            role: "Directeur Général Adjoint et Directeur du Développement"
          },
          difficulty: "Expert"
        },
        
        // Stratégie cyber
        {
          id: "cyber-strategy",
          title: "Élaboration de la stratégie cybersécurité",
          domain: "Définir une stratégie cyber et sa feuille de route",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        {
          id: "security-roadmap",
          title: "Feuille de route de sécurité",
          domain: "Définir une stratégie cyber et sa feuille de route",
          contact: {
            name: "Olivier Hervo",
            role: "Directeur Général"
          },
          difficulty: "Intermédiaire"
        },
        
        // Gestion de crise
        {
          id: "ransomware-crisis",
          title: "Gestion d'une attaque par ransomware",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Lorenzo Bertola",
            role: "Directeur Général Adjoint et Directeur du pôle BFA"
          },
          difficulty: "Expert"
        },
        {
          id: "crisis-plan",
          title: "Plan de gestion de crise cyber",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Guillaume Lechevallier",
            role: "Directeur Général Adjoint et Directeur du pôle IMPULSE"
          },
          difficulty: "Intermédiaire"
        },
        
        // Supply Chain
        {
          id: "vendor-assessment",
          title: "Évaluation de la sécurité des fournisseurs",
          domain: "La sécurité de la supply chain",
          contact: {
            name: "Nicolas Paolantonacci",
            role: "Senior Partner et Directeur du pôle RETAIL & LUXE"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "supply-chain-incident",
          title: "Incident de sécurité dans la chaîne d'approvisionnement",
          domain: "La sécurité de la supply chain",
          contact: {
            name: "Anthony Frescal",
            role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES"
          },
          difficulty: "Expert"
        },
        
        // IAM
        {
          id: "iam-implementation",
          title: "Mise en place d'une solution IAM",
          domain: "L'IAM",
          contact: {
            name: "Eddy MISSONI",
            role: "Chef de Projet & Expert IA"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "privileged-access",
          title: "Gestion des accès privilégiés",
          domain: "L'IAM",
          contact: {
            name: "Eddy MISSONI IDEMBI",
            role: "Expert Data / IA & CTO"
          },
          difficulty: "Expert"
        },
        
        // Cloud Security
        {
          id: "cloud-migration",
          title: "Sécurisation d'une migration vers le cloud",
          domain: "La cybersécurité dans le cloud",
          contact: {
            name: "Fares SAYADI",
            role: "Spécialiste Data / IA"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "cloud-security-posture",
          title: "Évaluation de la posture de sécurité cloud",
          domain: "La cybersécurité dans le cloud",
          contact: {
            name: "Yousra SAIDANI",
            role: "Experte Cybersécurité & CFO"
          },
          difficulty: "Expert"
        },
        
        // Données personnelles
        {
          id: "data-classification",
          title: "Classification des données sensibles",
          domain: "Sécurisation des données personnelles",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        {
          id: "data-breach-response",
          title: "Réponse à une violation de données personnelles",
          domain: "Sécurisation des données personnelles",
          contact: {
            name: "Vincent Terrier",
            role: "Senior Partner, Directeur Financier"
          },
          difficulty: "Intermédiaire"
        },
        
        // Analyse des vulnérabilités
        {
          id: "pentest-planning",
          title: "Planification d'un test d'intrusion",
          domain: "Analyse des vulnérabilités et tests de pénétration",
          contact: {
            name: "Neil LEVIN",
            role: "Expert cybersécurité & CFO"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "vuln-management",
          title: "Programme de gestion des vulnérabilités",
          domain: "Analyse des vulnérabilités et tests de pénétration",
          contact: {
            name: "Yousra SAIDANI",
            role: "Experte Cybersécurité & CFO"
          },
          difficulty: "Expert"
        },
        
        // Gestion des incidents
        {
          id: "incident-response",
          title: "Mise en place d'un processus de réponse aux incidents",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Eddy MISSONI",
            role: "Chef de Projet & Expert IA"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "security-monitoring",
          title: "Optimisation de la surveillance de sécurité",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Eddy MISSONI IDEMBI",
            role: "Expert Data / IA & CTO"
          },
          difficulty: "Expert"
        },
        
        // Forensics
        {
          id: "forensic-investigation",
          title: "Investigation numérique après un incident",
          domain: "Forensics",
          contact: {
            name: "Neil LEVIN",
            role: "Expert cybersécurité & CFO"
          },
          difficulty: "Expert"
        },
        {
          id: "evidence-collection",
          title: "Collecte et préservation des preuves numériques",
          domain: "Forensics",
          contact: {
            name: "Yousra SAIDANI",
            role: "Experte Cybersécurité & CFO"
          },
          difficulty: "Intermédiaire"
        }
      ];
      
      const scenario = scenarios.find(s => s.id === scenarioId);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      // Generate a document for the scenario
      let attachmentType = 'document_support';
      
      // Déterminer le type de document en fonction du scénario
      if (scenarioId.includes('phishing')) {
        attachmentType = 'rapport_phishing';
      } else if (scenarioId.includes('training')) {
        attachmentType = 'programme_formation';
      } else if (scenarioId.includes('osint')) {
        attachmentType = 'rapport_osint';
      } else if (scenarioId.includes('footprint')) {
        attachmentType = 'analyse_empreinte_numerique';
      } else if (scenarioId.includes('gdpr') || scenarioId.includes('rgpd')) {
        attachmentType = 'rapport_conformite_rgpd';
      } else if (scenarioId.includes('iso')) {
        attachmentType = 'exigences_iso27001';
      } else if (scenarioId.includes('strategy')) {
        attachmentType = 'strategie_cybersecurite';
      } else if (scenarioId.includes('roadmap')) {
        attachmentType = 'feuille_route_securite';
      } else if (scenarioId.includes('ransomware')) {
        attachmentType = 'plan_reponse_ransomware';
      } else if (scenarioId.includes('crisis')) {
        attachmentType = 'plan_gestion_crise';
      } else if (scenarioId.includes('vendor')) {
        attachmentType = 'questionnaire_fournisseurs';
      } else if (scenarioId.includes('supply-chain')) {
        attachmentType = 'rapport_incident_supply_chain';
      } else if (scenarioId.includes('iam')) {
        attachmentType = 'specifications_iam';
      } else if (scenarioId.includes('privileged')) {
        attachmentType = 'politique_acces_privilegies';
      } else if (scenarioId.includes('cloud')) {
        attachmentType = 'checklist_securite_cloud';
      } else if (scenarioId.includes('data-classification')) {
        attachmentType = 'guide_classification_donnees';
      } else if (scenarioId.includes('data-breach')) {
        attachmentType = 'rapport_violation_donnees';
      } else if (scenarioId.includes('pentest')) {
        attachmentType = 'cahier_charges_pentest';
      } else if (scenarioId.includes('vuln')) {
        attachmentType = 'rapport_vulnerabilites';
      } else if (scenarioId.includes('incident-response')) {
        attachmentType = 'procedure_reponse_incidents';
      } else if (scenarioId.includes('monitoring')) {
        attachmentType = 'metriques_surveillance_securite';
      } else if (scenarioId.includes('forensic')) {
        attachmentType = 'guide_investigation_forensique';
      } else if (scenarioId.includes('evidence')) {
        attachmentType = 'procedures_collecte_preuves';
      }
      
      const document = await documentGenerator.generateDocument(
        scenarioId,
        attachmentType,
        {
          domain: scenario.domain,
          scenario: scenario.title,
          userName,
          contactName: scenario.contact.name,
          difficultyLevel: scenario.difficulty
        }
      );
      
      // Generate email content with Azure OpenAI
      const systemPrompt = await openAIService.generateSystemPrompt({
        difficultyLevel: config?.difficultyLevel || "Intermédiaire",
        responseStyle: config?.responseStyle || "Professionnel"
      });
      
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Générez un email initial pour le scénario "${scenario.title}" dans le domaine "${scenario.domain}" avec les détails suivants:
          - L'email doit provenir de ${scenario.contact.name} (${scenario.contact.role})
          - L'email doit être adressé à ${userName}
          - Le niveau de difficulté est ${scenario.difficulty}
          - Une pièce jointe nommée "${document.fileName}" est disponible avec des informations détaillées
          - L'email doit mettre en place le contexte du scénario et demander une action de la part de ${userName}
          - Rédige uniquement l'email, pas de commentaires ou d'explications`
        }
      ];
      
      const emailContent = await openAIService.getChatCompletion(
        messages, 
        config?.temperature || 0.7, 
        config?.maxTokens || 2000
      );
      
      // Parse email content to extract subject and body
      const subjectMatch = emailContent.match(/Objet\s*:(.+?)(?:\n|$)/i);
      // Supprimer les ** du sujet s'ils existent
      let subject = subjectMatch ? subjectMatch[1].trim() : `Concernant: ${scenario.title}`;
      subject = subject.replace(/^\*\*|\*\*$/g, '').replace(/^__|\__$/g, '');
      
      // Remove any email headers from the content
      let body = emailContent
        .replace(/De\s*:.*?(?:\n|$)/gi, '')
        .replace(/À\s*:.*?(?:\n|$)/gi, '')
        .replace(/Objet\s*:.*?(?:\n|$)/gi, '')
        .replace(/Date\s*:.*?(?:\n|$)/gi, '')
        .trim();
        
      // Supprimer les ** au début et à la fin du corps de l'email
      const lines = body.split('\n');
      if (lines.length > 0) {
        // Traitement de la première ligne
        if (lines[0].trim().startsWith('**') && lines[0].trim().endsWith('**')) {
          lines[0] = lines[0].trim().replace(/^\*\*|\*\*$/g, '');
        }
        
        // Traitement de la dernière ligne
        if (lines.length > 1 && lines[lines.length - 1].trim().startsWith('**') && lines[lines.length - 1].trim().endsWith('**')) {
          lines[lines.length - 1] = lines[lines.length - 1].trim().replace(/^\*\*|\*\*$/g, '');
        }
        
        body = lines.join('\n');
      }
      
      // Format file size based on content length
      const contentBytes = Buffer.byteLength(document.content, 'utf8');
      const fileSizeKB = Math.round(contentBytes / 1024);
      
      // Définir les interlocuteurs supplémentaires pour le scénario
      // Nous allons créer une liste d'interlocuteurs par domaine pour assurer la cohérence
      const getAdditionalContacts = (domain: string, primaryContact: { name: string, role: string }) => {
        // Évitons d'avoir le même contact plusieurs fois
        const additionalContacts = [];
        
        // Secteurs spécifiques par domaine
        if (domain.includes('BFA') || domain.includes('Banque') || domain.toLowerCase().includes('conformité')) {
          additionalContacts.push({
            name: "Lorenzo Bertola",
            role: "Directeur Général Adjoint et Directeur du pôle BFA"
          });
        }
        
        if (domain.includes('IMPULSE') || domain.includes('Industrie') || domain.includes('Médias') || domain.includes('Santé')) {
          additionalContacts.push({
            name: "Guillaume Lechevallier",
            role: "Directeur Général Adjoint et Directeur du pôle IMPULSE"
          });
        }
        
        if (domain.includes('Data') || domain.includes('IA') || domain.includes('Intelligence')) {
          additionalContacts.push({
            name: "Eddy MISSONI IDEMBI",
            role: "Expert Data / IA & CTO"
          }, {
            name: "Fares SAYADI",
            role: "Spécialiste Data / IA"
          });
        }
        
        if (domain.includes('formation') || domain.includes('sensibilisation') || domain.toLowerCase().includes('rh')) {
          additionalContacts.push({
            name: "Isabelle Dubacq",
            role: "Senior Partner, Directrice des Ressources Humaines"
          });
        }
        
        if (domain.toLowerCase().includes('stratégie') || domain.toLowerCase().includes('direction')) {
          additionalContacts.push({
            name: "Arnaud Gauthier",
            role: "Président"
          }, {
            name: "Olivier Hervo",
            role: "Directeur Général"
          });
        }
        
        if (domain.toLowerCase().includes('sécurité') || domain.toLowerCase().includes('cyber')) {
          additionalContacts.push({
            name: "Neil LEVIN",
            role: "Expert cybersécurité & CFO"
          }, {
            name: "Yousra SAIDANI",
            role: "Experte Cybersécurité & CFO"
          });
        }
        
        // Filtrer pour éviter les doublons avec le contact principal
        return additionalContacts.filter(c => c.name !== primaryContact.name).slice(0, 2);
      };
      
      // Obtenir 2 contacts supplémentaires pertinents pour ce scénario
      const additionalContacts = getAdditionalContacts(scenario.domain, scenario.contact);
      
      // Créer la structure d'interlocuteurs pour ce scénario
      const scenarioContacts = [scenario.contact, ...additionalContacts];
      
      // Create email response
      const email = {
        id: uuidv4(),
        from: scenario.contact,
        to: `${userName}@mc2i.fr`,
        subject,
        date: new Date().toISOString(),
        body,
        attachments: [
          {
            id: document.fileName,
            fileName: `${attachmentType}.pdf`,
            fileSize: `${fileSizeKB} KB`,
            fileType: 'application/pdf'
          }
        ],
        // Ajouter les contacts additionnels qui interviendront dans ce scénario
        scenarioContacts: scenarioContacts
      };
      
      res.json({ email });
    } catch (error) {
      console.error('Error starting scenario:', error);
      res.status(500).json({ message: 'Failed to start scenario' });
    }
  });

  // API route for chat messages
  app.post('/api/cyber/chat', async (req, res) => {
    try {
      const { message, userName, scenarioId, config, chatHistory, scenarioContacts } = req.body;
      
      if (!message || !userName) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      // Récupérer les scénarios pour avoir le domaine actuel
      // Get scenario data - in a real app, this would come from the database
      const scenarios = [
        // Formation et sensibilisation
        {
          id: "phishing-simulation",
          title: "Simulation d'attaque phishing",
          domain: "Formation et sensibilisation à la cybersécurité",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        // ... autres scénarios (déjà définis plus haut)
      ];
      
      const scenario = scenarios.find(s => s.id === scenarioId);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      // Vérifier si nous avons des contacts disponibles pour le jeu de rôle
      let availableContacts = scenarioContacts;
      
      // Si aucun contact n'est fourni, générer les contacts à partir du domaine
      if (!availableContacts || !Array.isArray(availableContacts) || availableContacts.length === 0) {
        const getAdditionalContacts = (domain: string, primaryContact: { name: string, role: string }) => {
          // Logique déjà définie plus haut
          const additionalContacts = [];
          
          if (domain.includes('BFA') || domain.includes('Banque') || domain.toLowerCase().includes('conformité')) {
            additionalContacts.push({
              name: "Lorenzo Bertola",
              role: "Directeur Général Adjoint et Directeur du pôle BFA"
            });
          }
          
          // ... autres conditions déjà définies plus haut
          
          return additionalContacts.filter(c => c.name !== primaryContact.name).slice(0, 2);
        };
        
        const additionalContacts = getAdditionalContacts(scenario.domain, scenario.contact);
        availableContacts = [scenario.contact, ...additionalContacts];
      }
      
      // Déterminer quel contact va répondre à cette interaction 
      // Utilisons l'historique des messages pour déterminer le contact suivant
      let respondingContact;
      
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        // Compter combien de fois chaque contact a déjà répondu
        const contactResponseCount: {[key: string]: number} = {};
        
        // Parcourir l'historique pour compter les réponses de chaque contact
        chatHistory.forEach(item => {
          if (item.type === 'bot' && typeof item.content === 'string' && item.contactName) {
            contactResponseCount[item.contactName] = (contactResponseCount[item.contactName] || 0) + 1;
          }
        });
        
        // Trouver le contact qui a le moins répondu
        let minResponses = Infinity;
        for (const contact of availableContacts) {
          const count = contactResponseCount[contact.name] || 0;
          if (count < minResponses) {
            minResponses = count;
            respondingContact = contact;
          }
        }
        
        // Si tous les contacts ont parlé le même nombre de fois, choisir le suivant de manière circulaire
        if (!respondingContact) {
          // Trouver le dernier contact qui a parlé
          let lastContactIndex = 0;
          for (let i = chatHistory.length - 1; i >= 0; i--) {
            const item = chatHistory[i];
            if (item.type === 'bot' && item.contactName) {
              // Trouver l'index de ce contact
              const index = availableContacts.findIndex((c: { name: string }) => c.name === item.contactName);
              if (index !== -1) {
                lastContactIndex = index;
                break;
              }
            }
          }
          
          // Choisir le contact suivant de manière circulaire
          respondingContact = availableContacts[(lastContactIndex + 1) % availableContacts.length];
        }
      } else {
        // Pour la première réponse, utiliser le contact principal du scénario
        respondingContact = availableContacts[0];
      }
      
      // Generate response with Azure OpenAI
      const systemPrompt = await openAIService.generateSystemPrompt({
        difficultyLevel: config?.difficultyLevel || "Intermédiaire",
        responseStyle: config?.responseStyle || "Professionnel"
      });
      
      // Add the instruction about response evaluation and interlocutors
      const systemContent = systemPrompt + 
        `\n\nRÈGLE IMPORTANTE: Tu réponds en tant que ${respondingContact.name}, ${respondingContact.role}. Tu ne dois JAMAIS mentionner Azure OpenAI ou GPT.` +
        "\n\nRÈGLE DU JEU DE RÔLE: Chaque interlocuteur a son propre style et expertise en fonction de son rôle. Adapte le ton, le style et le contenu de la réponse au profil de l'interlocuteur qui répond." +
        "\n\nÉVALUATION DES RÉPONSES: Évalue rigoureusement la réponse de l'utilisateur. Si elle est incomplète, hors sujet, mal formulée ou peu pertinente, sois direct et franc dans ta critique. N'hésite pas à exiger immédiatement une réponse plus complète ou pertinente. Après trois tentatives infructueuses, mets fin au scénario.";
      
      // Create the base messages array
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: systemContent
        }
      ];
      
      // Add chat history if provided to maintain context
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        chatHistory.forEach(item => {
          if (item.type === 'user' && typeof item.content === 'string') {
            messages.push({
              role: "user",
              content: item.content
            });
          } else if (item.type === 'bot' && typeof item.content === 'string') {
            messages.push({
              role: "assistant",
              content: item.content
            });
          }
        });
      }
      
      // Add the current user message
      messages.push({
        role: "user",
        content: `Je suis ${userName}. Le message suivant est en réponse au scénario de cybersécurité en cours (ID: ${scenarioId}): "${message}"`
      });
      
      const responseContent = await openAIService.getChatCompletion(
        messages, 
        config?.temperature || 0.7, 
        config?.maxTokens || 2000
      );
      
      // Check if response indicates scenario termination
      const isScenarioTerminated = responseContent.toLowerCase().includes("fin du scénario") || 
                                   responseContent.toLowerCase().includes("recommencer à zéro") ||
                                   responseContent.toLowerCase().includes("recommencer le scénario");
      
      // Send response with termination flag if detected and include the contact information
      res.json({ 
        type: 'bot',
        content: responseContent,
        resetScenario: isScenarioTerminated,
        contactName: respondingContact.name,
        contactRole: respondingContact.role,
        // Inclure la liste complète des contacts pour le prochain appel
        scenarioContacts: availableContacts
      });
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ message: 'Failed to process message' });
    }
  });

  // API route for downloading documents
  app.get('/api/cyber/documents/:id', (req, res) => {
    try {
      const documentId = req.params.id;
      const documentPath = path.join(documentsDir, documentId);
      
      if (!fs.existsSync(documentPath)) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Déterminer le type de contenu en fonction de l'extension du fichier
      const isPDF = documentId.toLowerCase().endsWith('.pdf');
      
      if (isPDF) {
        // Servir le fichier PDF pour affichage dans le navigateur
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=${documentId}`);
        fs.createReadStream(documentPath).pipe(res);
      } else {
        // Servir le fichier texte
        const content = fs.readFileSync(documentPath, 'utf8');
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `inline; filename=${documentId}`);
        res.send(content);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ message: 'Failed to download document' });
    }
  });

  // API route for listing documents
  app.get('/api/cyber/documents', (req, res) => {
    try {
      // List all files in the documents directory
      const files = fs.readdirSync(documentsDir);
      
      // Get file stats for each document
      const documents = files.map(fileName => {
        const filePath = path.join(documentsDir, fileName);
        const stats = fs.statSync(filePath);
        
        return {
          id: fileName,
          fileName,
          date: stats.mtime,
          size: stats.size
        };
      });
      
      res.json(documents);
    } catch (error) {
      console.error('Error listing documents:', error);
      res.status(500).json({ message: 'Failed to list documents' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
