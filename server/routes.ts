import type { Express, Request, Response, NextFunction } from "express";
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
        // Ingénierie sociale et phishing
        {
          id: "phishing-awareness",
          title: "Sensibilisation aux attaques de phishing",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        {
          id: "social-engineering-incident",
          title: "Gestion d'un incident d'ingénierie sociale",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Isabelle Dubacq",
            role: "Senior Partner, Directrice des Ressources Humaines"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "advanced-social-attacks",
          title: "Prévention des attaques sophistiquées",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Stratégie cyber
        {
          id: "security-awareness",
          title: "Sensibilisation aux enjeux de la stratégie cyber",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Julien Grimault",
            role: "Senior Partner - Directeur d'unité, Sponsor du centre d'expertise Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "security-roadmap",
          title: "Feuille de route de sécurité",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Olivier Hervo",
            role: "Directeur Général"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "cyber-strategy",
          title: "Élaboration de la stratégie cybersécurité avancée",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Gestion de crise
        {
          id: "crisis-basics",
          title: "Introduction à la gestion de crise cyber",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Nosing Doeuk",
            role: "Senior Partner - Directeur du pôle DIXIT"
          },
          difficulty: "Débutant"
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
        {
          id: "ransomware-crisis",
          title: "Gestion d'une attaque avancée par ransomware",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Lorenzo Bertola",
            role: "Directeur Général Adjoint et Directeur du pôle BFA"
          },
          difficulty: "Expert"
        },
        
        // Supply Chain
        {
          id: "supply-chain-basics",
          title: "Introduction aux risques de la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Marie Bernard",
            role: "Responsable Achats"
          },
          difficulty: "Débutant"
        },
        {
          id: "vendor-assessment",
          title: "Évaluation de la sécurité des fournisseurs",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Nicolas Paolantonacci",
            role: "Senior Partner et Directeur du pôle RETAIL & LUXE"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "supply-chain-incident",
          title: "Incident de sécurité dans la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Anthony Frescal",
            role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES"
          },
          difficulty: "Expert"
        },
        
        // Données personnelles / RGPD
        {
          id: "data-classification",
          title: "Classification des données sensibles",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Yousra Benahmed",
            role: "Consultante Senior Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "data-breach-response",
          title: "Réponse à une violation de données personnelles",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Vincent Terrier",
            role: "Senior Partner, Directeur Financier"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "rgpd-compliance-program",
          title: "Programme de conformité RGPD avancé",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Vincent Pascal",
            role: "Directeur Général Adjoint et Directeur du Développement"
          },
          difficulty: "Expert"
        },
        
        // Gestion des incidents
        {
          id: "incident-basics",
          title: "Introduction à la gestion des incidents",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Neil Desai",
            role: "Consultant Senior Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "incident-response",
          title: "Mise en place d'un processus de réponse aux incidents",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Eddy MISSONI IDEMBI",
            role: "Expert Data / IA & CTO"
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
      } else if (scenarioId.includes('social-engineering')) {
        attachmentType = 'guide_prevention_ingenierie_sociale';
      } else if (scenarioId.includes('advanced-social')) {
        attachmentType = 'strategies_avancees_prevention';
      } else if (scenarioId.includes('security-awareness')) {
        attachmentType = 'guide_sensibilisation_cybersecurite';
      } else if (scenarioId.includes('roadmap')) {
        attachmentType = 'feuille_route_securite';
      } else if (scenarioId.includes('cyber-strategy')) {
        attachmentType = 'strategie_cybersecurite';
      } else if (scenarioId.includes('crisis-basics')) {
        attachmentType = 'guide_introduction_gestion_crise'; 
      } else if (scenarioId.includes('crisis-plan')) {
        attachmentType = 'plan_gestion_crise';
      } else if (scenarioId.includes('ransomware')) {
        attachmentType = 'plan_reponse_ransomware';
      } else if (scenarioId.includes('supply-chain-basics')) {
        attachmentType = 'introduction_securite_supply_chain';
      } else if (scenarioId.includes('vendor')) {
        attachmentType = 'questionnaire_fournisseurs';
      } else if (scenarioId.includes('supply-chain-incident')) {
        attachmentType = 'rapport_incident_supply_chain';
      } else if (scenarioId.includes('data-classification')) {
        attachmentType = 'guide_classification_donnees';
      } else if (scenarioId.includes('data-breach')) {
        attachmentType = 'rapport_violation_donnees';
      } else if (scenarioId.includes('rgpd-compliance')) {
        attachmentType = 'rapport_conformite_rgpd';
      } else if (scenarioId.includes('incident-basics')) {
        attachmentType = 'introduction_gestion_incidents';
      } else if (scenarioId.includes('incident-response')) {
        attachmentType = 'procedure_reponse_incidents';
      } else if (scenarioId.includes('monitoring')) {
        attachmentType = 'metriques_surveillance_securite';
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
      
      // Déterminer le secteur d'activité en fonction du domaine et du titre du scénario
      let secteurActivite = '';
      
      if (scenario.domain.toLowerCase().includes('finance') || 
          scenario.domain.toLowerCase().includes('banque') ||
          scenario.title.toLowerCase().includes('finance') ||
          scenario.title.toLowerCase().includes('banque') ||
          scenario.title.toLowerCase().includes('fraude')) {
        secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
      } 
      else if (scenario.domain.toLowerCase().includes('santé') || 
               scenario.domain.toLowerCase().includes('industriel') || 
               scenario.domain.toLowerCase().includes('public') ||
               scenario.title.toLowerCase().includes('santé') ||
               scenario.title.toLowerCase().includes('industriel') ||
               scenario.title.toLowerCase().includes('patient') ||
               scenario.title.toLowerCase().includes('médical')) {
        secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
      }
      else if (scenario.domain.toLowerCase().includes('retail') || 
               scenario.domain.toLowerCase().includes('luxe') ||
               scenario.domain.toLowerCase().includes('commerce') ||
               scenario.title.toLowerCase().includes('marque') ||
               scenario.title.toLowerCase().includes('retail')) {
        secteurActivite = 'RETAIL & LUXE';
      }
      else if (scenario.domain.toLowerCase().includes('énergie') || 
               scenario.domain.toLowerCase().includes('energie') ||
               scenario.domain.toLowerCase().includes('utilities') ||
               scenario.title.toLowerCase().includes('énergie') ||
               scenario.title.toLowerCase().includes('production')) {
        secteurActivite = 'ÉNERGIE & UTILITIES';
      }
      else {
        // Par défaut, attribuer un secteur en fonction du contact principal
        if (scenario.contact.name === "Lorenzo Bertola" || scenario.contact.name === "Vincent Terrier") {
          secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
        }
        else if (scenario.contact.name === "Guillaume Lechevallier" || scenario.contact.name === "Fares SAYADI") {
          secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
        }
        else if (scenario.contact.name === "Nicolas Paolantonacci" || scenario.contact.name === "Marion Lopez") {
          secteurActivite = 'RETAIL & LUXE';
        }
        else if (scenario.contact.name === "Anthony Frescal") {
          secteurActivite = 'ÉNERGIE & UTILITIES';
        }
        else {
          // Si toujours pas de correspondance, choisir aléatoirement
          const secteurs = ['BANCAIRE/FINANCIER (BFA)', 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)', 'RETAIL & LUXE', 'ÉNERGIE & UTILITIES'];
          secteurActivite = secteurs[Math.floor(Math.random() * secteurs.length)];
        }
      }

      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Générez un email COURT et ACCUEILLANT (maximum 150 mots) pour le scénario "${scenario.title}" dans le domaine "${scenario.domain}" avec les détails suivants:
          - L'email doit provenir de ${scenario.contact.name} (${scenario.contact.role})
          - L'email doit être adressé à ${userName} en utilisant le tutoiement ("tu") 
          - Une pièce jointe nommée "${document.fileName}" est disponible avec des informations détaillées
          - Le secteur d'activité pour ce scénario est: ${secteurActivite}
          - Inventez un nom d'entreprise cohérent pour ce secteur
          - L'email doit être un message d'accueil chaleureux où le PNJ se présente, souhaite la bienvenue à ${userName} et l'invite simplement à se présenter à son tour (parcours, expérience, niveau de connaissance sur le sujet)
          - N'incluez PAS encore de problème ou de mission spécifique à résoudre
          - Le ton doit être amical et professionnel, en utilisant le tutoiement
          - Le style d'écriture doit correspondre au rôle du contact mais rester accessible et léger
          - Rédigez uniquement l'email, pas de commentaires ou d'explications`
        }
      ];
      
      const emailContent = await openAIService.getChatCompletionWithCache(
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
      
      // Définir les interlocuteurs supplémentaires pour le scénario avec des expertises métier, technologiques et sectorielles diverses
      const getAdditionalContacts = (domain: string, primaryContact: { name: string, role: string }) => {
        // Évitons d'avoir le même contact plusieurs fois
        const additionalContacts = [];
        
        // Experts par secteur d'activité
        const sectorExperts = {
          // Secteur bancaire et financier
          BFA: [
            {
              name: "Lorenzo Bertola",
              role: "Directeur Général Adjoint et Directeur du pôle BFA",
              expertise: "Cybersécurité dans le secteur bancaire et financier",
              concern: "S'inquiète des implications réglementaires spécifiques au secteur financier (ACPR, réglementation bancaire) et de la protection des transactions"
            },
            {
              name: "Vincent Terrier",
              role: "Senior Partner, Directeur Financier",
              expertise: "Gestion des risques financiers liés aux cyber-attaques",
              concern: "Évalue l'impact financier des risques cyber et les investissements nécessaires pour s'en prémunir"
            }
          ],
          
          // Secteur IMPULSE (industrie, médias, mobilité, secteur public, santé)
          IMPULSE: [
            {
              name: "Guillaume Lechevallier",
              role: "Directeur Général Adjoint et Directeur du pôle IMPULSE",
              expertise: "Transformation numérique sécurisée dans les secteurs industriels",
              concern: "Préoccupé par la continuité d'activité des systèmes industriels et la protection des infrastructures critiques"
            },
            {
              name: "Fares SAYADI",
              role: "Spécialiste Data / IA",
              expertise: "Sécurisation des données dans le secteur public et la santé",
              concern: "Axé sur la protection des données sensibles et personnelles dans des contextes critiques (santé, défense)"
            }
          ],
          
          // Secteur Retail & Luxe
          RETAIL: [
            {
              name: "Nicolas Paolantonacci",
              role: "Senior Partner et Directeur du pôle RETAIL & LUXE",
              expertise: "Protection des actifs digitaux dans le secteur du luxe",
              concern: "Focalisé sur la protection de la propriété intellectuelle et de l'image de marque"
            },
            {
              name: "Marion Lopez",
              role: "Senior Partner et Directrice Marketing, Communication et RSE",
              expertise: "Communication de crise et gestion de la réputation",
              concern: "Préoccupée par l'impact des incidents de sécurité sur l'image et la réputation de l'entreprise"
            }
          ],
          
          // Secteur Energie & Utilities
          ENERGY: [
            {
              name: "Anthony Frescal",
              role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES",
              expertise: "Sécurité des infrastructures critiques énergétiques",
              concern: "Centré sur la protection des installations industrielles sensibles et la continuité de service des réseaux énergétiques"
            }
          ]
        };
        
        // Experts par expertise technique
        const technicalExperts = {
          // Expertise en cybersécurité
          CYBER: [
            {
              name: "Neil LEVIN",
              role: "Expert cybersécurité & CFO",
              expertise: "Stratégies de défense et solutions techniques de cybersécurité",
              concern: "Analyse les vulnérabilités techniques et propose des solutions concrètes pour renforcer la sécurité"
            },
            {
              name: "Yousra SAIDANI",
              role: "Experte Cybersécurité & CFO",
              expertise: "Analyse forensique et réponse aux incidents",
              concern: "Spécialisée dans l'investigation numérique et la résolution technique des incidents"
            }
          ],
          
          // Expertise en Data/IA
          DATA: [
            {
              name: "Eddy MISSONI IDEMBI",
              role: "Expert Data / IA & CTO",
              expertise: "Sécurisation des modèles d'IA et protection des données",
              concern: "Préoccupé par les risques spécifiques aux systèmes d'IA (empoisonnement des données, détournement des modèles)"
            }
          ],
          
          // Expertise en conformité et juridique
          COMPLIANCE: [
            {
              name: "Vincent Pascal",
              role: "Directeur Général Adjoint et Directeur du Développement",
              expertise: "Conformité réglementaire en matière de cybersécurité",
              concern: "Veille au respect des lois, normes et standards (RGPD, NIS2, ISO27001)"
            }
          ]
        };
        
        // Experts par fonction dans l'entreprise
        const roleExperts = {
          // Direction générale
          EXECUTIVE: [
            {
              name: "Arnaud Gauthier",
              role: "Président",
              expertise: "Vision stratégique et gouvernance de la cybersécurité",
              concern: "Centré sur les enjeux stratégiques à long terme et la responsabilité du conseil d'administration"
            },
            {
              name: "Olivier Hervo",
              role: "Directeur Général",
              expertise: "Arbitrage risques/opportunités en matière de sécurité",
              concern: "Recherche l'équilibre entre sécurité et développement business, protection et innovation"
            }
          ],
          
          // Ressources humaines
          HR: [
            {
              name: "Isabelle Dubacq",
              role: "Senior Partner, Directrice des Ressources Humaines",
              expertise: "Formation et sensibilisation des collaborateurs",
              concern: "Préoccupée par le facteur humain dans la cybersécurité et le développement d'une culture de sécurité"
            }
          ]
        };
        
        // Sélection des interlocuteurs en fonction du domaine du scénario
        let relevantExperts: any[] = [];
        
        // 1. Analyse du domaine pour déterminer les expertises pertinentes
        if (domain.toLowerCase().includes('finance') || domain.toLowerCase().includes('banque') || domain.toLowerCase().includes('paiement')) {
          relevantExperts = relevantExperts.concat(sectorExperts.BFA);
        }
        
        if (domain.toLowerCase().includes('industriel') || domain.toLowerCase().includes('santé') || domain.toLowerCase().includes('public')) {
          relevantExperts = relevantExperts.concat(sectorExperts.IMPULSE);
        }
        
        if (domain.toLowerCase().includes('retail') || domain.toLowerCase().includes('luxe') || domain.toLowerCase().includes('marque')) {
          relevantExperts = relevantExperts.concat(sectorExperts.RETAIL);
        }
        
        if (domain.toLowerCase().includes('énergie') || domain.toLowerCase().includes('infrastructure critique')) {
          relevantExperts = relevantExperts.concat(sectorExperts.ENERGY);
        }
        
        // Aspects techniques
        if (domain.toLowerCase().includes('technique') || domain.toLowerCase().includes('sécurité') || domain.toLowerCase().includes('cyber')) {
          relevantExperts = relevantExperts.concat(technicalExperts.CYBER);
        }
        
        if (domain.toLowerCase().includes('data') || domain.toLowerCase().includes('ia') || domain.toLowerCase().includes('intelligence')) {
          relevantExperts = relevantExperts.concat(technicalExperts.DATA);
        }
        
        if (domain.toLowerCase().includes('conformité') || domain.toLowerCase().includes('rgpd') || domain.toLowerCase().includes('juridique')) {
          relevantExperts = relevantExperts.concat(technicalExperts.COMPLIANCE);
        }
        
        // Aspects fonctionnels
        if (domain.toLowerCase().includes('stratégie') || domain.toLowerCase().includes('gouvernance')) {
          relevantExperts = relevantExperts.concat(roleExperts.EXECUTIVE);
        }
        
        if (domain.toLowerCase().includes('formation') || domain.toLowerCase().includes('sensibilisation') || domain.toLowerCase().includes('humain')) {
          relevantExperts = relevantExperts.concat(roleExperts.HR);
        }
        
        // Si aucun expert spécifique n'a été identifié, inclure des experts généraux
        if (relevantExperts.length === 0) {
          // Toujours inclure au moins un expert technique en cybersécurité
          relevantExperts = relevantExperts.concat(technicalExperts.CYBER);
          
          // Ajouter un responsable financier et un responsable communication
          relevantExperts.push(sectorExperts.BFA[1]); // Directeur Financier
          relevantExperts.push(sectorExperts.RETAIL[1]); // Directrice Communication
        }
        
        // S'assurer que nous avons une diversité de préoccupations
        additionalContacts.push(...relevantExperts);
        
        // Rendre aléatoire la sélection des PNJ pour tous les scénarios
        // Mélanger toutes les options disponibles
        const allContacts: Array<{
          name: string;
          role: string;
          expertise: string;
          concern: string;
        }> = [];
        
        // Ajouter tous les experts sectoriels disponibles
        Object.values(sectorExperts).forEach(sectorGroup => {
          allContacts.push(...sectorGroup);
        });
        
        // Ajouter tous les experts techniques disponibles
        Object.values(technicalExperts).forEach(techGroup => {
          allContacts.push(...techGroup);
        });
        
        // Ajouter les experts de rôles
        Object.values(roleExperts).forEach(roleGroup => {
          allContacts.push(...roleGroup);
        });
        
        // Filtrer pour éviter les doublons avec le contact principal
        // Et éviter les rôles similaires (pas deux experts cyber, pas deux DG, etc.)
        const usedRoles = new Set([primaryContact.role.split(',')[0].trim()]);
        
        const filtered = allContacts
          .filter(c => c.name !== primaryContact.name)
          .filter(c => {
            const baseRole = c.role.split(',')[0].trim();
            if (usedRoles.has(baseRole)) return false;
            usedRoles.add(baseRole);
            return true;
          })
          .sort(() => 0.5 - Math.random()); // Mélanger pour sélection aléatoire
        
        // Sélectionner 3-4 interlocuteurs pertinents avec des perspectives diverses
        const result = [];
        let hasTechnical = false;
        let hasBusiness = false;
        
        // Parcourir la liste filtrée et sélectionner les experts appropriés
        for (const expert of filtered) {
          if (result.length >= 3) break; // Limiter à 3 interlocuteurs supplémentaires
          
          const isTechnical = expert.expertise.toLowerCase().includes('technique') || 
                             expert.expertise.toLowerCase().includes('cyber') ||
                             expert.expertise.toLowerCase().includes('sécurité');
                             
          const isBusiness = expert.expertise.toLowerCase().includes('stratégie') || 
                            expert.expertise.toLowerCase().includes('financier') ||
                            expert.expertise.toLowerCase().includes('marketing');
          
          if (isTechnical && !hasTechnical) {
            result.push(expert);
            hasTechnical = true;
            continue;
          }
          
          if (isBusiness && !hasBusiness) {
            result.push(expert);
            hasBusiness = true;
            continue;
          }
          
          // Si nous avons déjà des experts techniques et business, ajouter d'autres experts
          if (hasTechnical && hasBusiness) {
            result.push(expert);
          }
          
          // Si nous n'avons pas encore rempli nos quotas techniques/business, ajouter quand même
          if (!hasTechnical || !hasBusiness) {
            result.push(expert);
          }
        }
        
        return result.slice(0, 3); // Limiter à 3 interlocuteurs au maximum
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
        // Ingénierie sociale et phishing
        {
          id: "phishing-awareness",
          title: "Sensibilisation aux attaques de phishing",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        {
          id: "social-engineering-incident",
          title: "Gestion d'un incident d'ingénierie sociale",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Isabelle Dubacq",
            role: "Senior Partner, Directrice des Ressources Humaines"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "advanced-social-attacks",
          title: "Prévention des attaques sophistiquées",
          domain: "Ingénierie sociale et phishing",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Stratégie cyber
        {
          id: "security-awareness",
          title: "Sensibilisation aux enjeux de la stratégie cyber",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Julien Grimault",
            role: "Senior Partner - Directeur d'unité, Sponsor du centre d'expertise Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "security-roadmap",
          title: "Feuille de route de sécurité",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Olivier Hervo",
            role: "Directeur Général"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "cyber-strategy",
          title: "Élaboration de la stratégie cybersécurité avancée",
          domain: "Stratégie et gouvernance cybersécurité",
          contact: {
            name: "Arnaud Gauthier",
            role: "Président"
          },
          difficulty: "Expert"
        },
        
        // Gestion de crise
        {
          id: "crisis-basics",
          title: "Introduction à la gestion de crise cyber",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Nosing Doeuk",
            role: "Senior Partner - Directeur du pôle DIXIT"
          },
          difficulty: "Débutant"
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
        {
          id: "ransomware-crisis",
          title: "Gestion d'une attaque avancée par ransomware",
          domain: "Gestion de crise cyber",
          contact: {
            name: "Lorenzo Bertola",
            role: "Directeur Général Adjoint et Directeur du pôle BFA"
          },
          difficulty: "Expert"
        },
        
        // Supply Chain
        {
          id: "supply-chain-basics",
          title: "Introduction aux risques de la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Marie Bernard",
            role: "Responsable Achats"
          },
          difficulty: "Débutant"
        },
        {
          id: "vendor-assessment",
          title: "Évaluation de la sécurité des fournisseurs",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Nicolas Paolantonacci",
            role: "Senior Partner et Directeur du pôle RETAIL & LUXE"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "supply-chain-incident",
          title: "Incident de sécurité dans la chaîne d'approvisionnement",
          domain: "Sécurité de la chaîne d'approvisionnement",
          contact: {
            name: "Anthony Frescal",
            role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES"
          },
          difficulty: "Expert"
        },
        
        // Données personnelles / RGPD
        {
          id: "data-classification",
          title: "Classification des données sensibles",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Débutant"
        },
        {
          id: "data-breach-response",
          title: "Réponse à une violation de données personnelles",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Vincent Terrier",
            role: "Senior Partner, Directeur Financier"
          },
          difficulty: "Intermédiaire"
        },
        {
          id: "rgpd-compliance-program",
          title: "Programme de conformité RGPD avancé",
          domain: "Protection des données personnelles / RGPD",
          contact: {
            name: "Vincent Pascal",
            role: "Directeur Général Adjoint et Directeur du Développement"
          },
          difficulty: "Expert"
        },
        
        // Gestion des incidents
        {
          id: "incident-basics",
          title: "Introduction à la gestion des incidents",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Yousra Benahmed",
            role: "Consultante Senior Cybersécurité"
          },
          difficulty: "Débutant"
        },
        {
          id: "incident-response",
          title: "Mise en place d'un processus de réponse aux incidents",
          domain: "Gestion des incidents de sécurité",
          contact: {
            name: "Eddy MISSONI IDEMBI",
            role: "Expert Data / IA & CTO"
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
        }
      ];
      
      const scenario = scenarios.find(s => s.id === scenarioId);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      // Vérifier si nous avons des contacts disponibles pour le jeu de rôle
      let availableContacts = scenarioContacts;
      
      // Si aucun contact n'est fourni, générer les contacts à partir du domaine
      if (!availableContacts || !Array.isArray(availableContacts) || availableContacts.length === 0) {
        // Réutiliser la même fonction définie plus haut pour la génération des contacts
        // mais nous la redéfinissons ici pour éviter des problèmes de portée
        const getAdditionalContacts = (domain: string, primaryContact: { name: string, role: string }) => {
          const additionalContacts = [];
          
          // Experts par secteur d'activité
          const sectorExperts = {
            // Secteur bancaire et financier
            BFA: [
              {
                name: "Lorenzo Bertola",
                role: "Directeur Général Adjoint et Directeur du pôle BFA",
                expertise: "Cybersécurité dans le secteur bancaire et financier",
                concern: "S'inquiète des implications réglementaires spécifiques au secteur financier (ACPR, réglementation bancaire) et de la protection des transactions"
              },
              {
                name: "Vincent Terrier",
                role: "Senior Partner, Directeur Financier",
                expertise: "Gestion des risques financiers liés aux cyber-attaques",
                concern: "Évalue l'impact financier des risques cyber et les investissements nécessaires pour s'en prémunir"
              }
            ],
            
            // Secteur IMPULSE (industrie, médias, mobilité, secteur public, santé)
            IMPULSE: [
              {
                name: "Guillaume Lechevallier",
                role: "Directeur Général Adjoint et Directeur du pôle IMPULSE",
                expertise: "Transformation numérique sécurisée dans les secteurs industriels",
                concern: "Préoccupé par la continuité d'activité des systèmes industriels et la protection des infrastructures critiques"
              },
              {
                name: "Fares SAYADI",
                role: "Spécialiste Data / IA",
                expertise: "Sécurisation des données dans le secteur public et la santé",
                concern: "Axé sur la protection des données sensibles et personnelles dans des contextes critiques (santé, défense)"
              }
            ],
            
            // Secteur Retail & Luxe
            RETAIL: [
              {
                name: "Nicolas Paolantonacci",
                role: "Senior Partner et Directeur du pôle RETAIL & LUXE",
                expertise: "Protection des actifs digitaux dans le secteur du luxe",
                concern: "Focalisé sur la protection de la propriété intellectuelle et de l'image de marque"
              },
              {
                name: "Julien Grimault",
                role: "Senior Partner - Directeur d'unité, Sponsor du centre d'expertise Cybersécurité",
                expertise: "Gouvernance et stratégie de cybersécurité",
                concern: "Préoccupé par la conformité aux normes et l'intégration de la cybersécurité dans la stratégie globale de l'entreprise"
              }
            ],
            
            // Secteur Energie & Utilities
            ENERGY: [
              {
                name: "Anthony Frescal",
                role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES",
                expertise: "Sécurité des infrastructures critiques énergétiques",
                concern: "Centré sur la protection des installations industrielles sensibles et la continuité de service des réseaux énergétiques"
              }
            ]
          };
          
          // Experts par expertise technique
          const technicalExperts = {
            // Expertise en cybersécurité
            CYBER: [
              {
                name: "Neil LEVIN",
                role: "Expert cybersécurité & CFO",
                expertise: "Stratégies de défense et solutions techniques de cybersécurité",
                concern: "Analyse les vulnérabilités techniques et propose des solutions concrètes pour renforcer la sécurité"
              },
              {
                name: "Yousra SAIDANI",
                role: "Experte Cybersécurité & CFO",
                expertise: "Analyse forensique et réponse aux incidents",
                concern: "Spécialisée dans l'investigation numérique et la résolution technique des incidents"
              }
            ],
            
            // Expertise en Data/IA
            DATA: [
              {
                name: "Eddy MISSONI IDEMBI",
                role: "Expert Data / IA & CTO",
                expertise: "Sécurisation des modèles d'IA et protection des données",
                concern: "Préoccupé par les risques spécifiques aux systèmes d'IA (empoisonnement des données, détournement des modèles)"
              }
            ],
            
            // Expertise en conformité et juridique
            COMPLIANCE: [
              {
                name: "Vincent Pascal",
                role: "Directeur Général Adjoint et Directeur du Développement",
                expertise: "Conformité réglementaire en matière de cybersécurité",
                concern: "Veille au respect des lois, normes et standards (RGPD, NIS2, ISO27001)"
              }
            ]
          };
          
          // Experts par fonction dans l'entreprise
          const roleExperts = {
            // Direction générale
            EXECUTIVE: [
              {
                name: "Arnaud Gauthier",
                role: "Président",
                expertise: "Vision stratégique et gouvernance de la cybersécurité",
                concern: "Centré sur les enjeux stratégiques à long terme et la responsabilité du conseil d'administration"
              },
              {
                name: "Olivier Hervo",
                role: "Directeur Général",
                expertise: "Arbitrage risques/opportunités en matière de sécurité",
                concern: "Recherche l'équilibre entre sécurité et développement business, protection et innovation"
              }
            ],
            
            // Ressources humaines
            HR: [
              {
                name: "Isabelle Dubacq",
                role: "Senior Partner, Directrice des Ressources Humaines",
                expertise: "Formation et sensibilisation des collaborateurs",
                concern: "Préoccupée par le facteur humain dans la cybersécurité et le développement d'une culture de sécurité"
              }
            ]
          };
          
          // Sélection des interlocuteurs en fonction du domaine du scénario
          let relevantExperts: any[] = [];
          
          // 1. Analyse du domaine pour déterminer les expertises pertinentes
          if (domain.toLowerCase().includes('finance') || domain.toLowerCase().includes('banque') || domain.toLowerCase().includes('paiement')) {
            relevantExperts = relevantExperts.concat(sectorExperts.BFA);
          }
          
          if (domain.toLowerCase().includes('industriel') || domain.toLowerCase().includes('santé') || domain.toLowerCase().includes('public')) {
            relevantExperts = relevantExperts.concat(sectorExperts.IMPULSE);
          }
          
          if (domain.toLowerCase().includes('retail') || domain.toLowerCase().includes('luxe') || domain.toLowerCase().includes('marque')) {
            relevantExperts = relevantExperts.concat(sectorExperts.RETAIL);
          }
          
          if (domain.toLowerCase().includes('énergie') || domain.toLowerCase().includes('infrastructure critique')) {
            relevantExperts = relevantExperts.concat(sectorExperts.ENERGY);
          }
          
          // Aspects techniques
          if (domain.toLowerCase().includes('technique') || domain.toLowerCase().includes('sécurité') || domain.toLowerCase().includes('cyber')) {
            relevantExperts = relevantExperts.concat(technicalExperts.CYBER);
          }
          
          if (domain.toLowerCase().includes('data') || domain.toLowerCase().includes('ia') || domain.toLowerCase().includes('intelligence')) {
            relevantExperts = relevantExperts.concat(technicalExperts.DATA);
          }
          
          if (domain.toLowerCase().includes('conformité') || domain.toLowerCase().includes('rgpd') || domain.toLowerCase().includes('juridique')) {
            relevantExperts = relevantExperts.concat(technicalExperts.COMPLIANCE);
          }
          
          // Aspects fonctionnels
          if (domain.toLowerCase().includes('stratégie') || domain.toLowerCase().includes('gouvernance')) {
            relevantExperts = relevantExperts.concat(roleExperts.EXECUTIVE);
          }
          
          if (domain.toLowerCase().includes('formation') || domain.toLowerCase().includes('sensibilisation') || domain.toLowerCase().includes('humain')) {
            relevantExperts = relevantExperts.concat(roleExperts.HR);
          }
          
          // Si aucun expert spécifique n'a été identifié, inclure des experts généraux
          if (relevantExperts.length === 0) {
            // Toujours inclure au moins un expert technique en cybersécurité
            relevantExperts = relevantExperts.concat(technicalExperts.CYBER);
            
            // Ajouter un responsable financier et un responsable communication
            relevantExperts.push(sectorExperts.BFA[1]); // Directeur Financier
            relevantExperts.push(sectorExperts.RETAIL[1]); // Directrice Communication
          }
          
          // S'assurer que nous avons une diversité de préoccupations
          additionalContacts.push(...relevantExperts);
          
          // Filtrer pour éviter les doublons avec le contact principal
          // Et assurer une diversité d'expertises (technique, business, réglementaire)
          const filtered = additionalContacts
            .filter(c => c.name !== primaryContact.name)
            .sort(() => 0.5 - Math.random()); // Mélanger pour varier les scénarios
          
          // Sélectionner 3-4 interlocuteurs pertinents avec des perspectives diverses
          // On s'assure d'avoir au moins un expert technique et un expert métier
          const result = [];
          let hasTechnical = false;
          let hasBusiness = false;
          
          // Parcourir la liste filtrée et sélectionner les experts appropriés
          // Nous voulons entre 1 et 3 interlocuteurs supplémentaires (2-4 au total avec le contact principal)
          for (const expert of filtered) {
            if (result.length >= Math.min(3, filtered.length)) break; // Limiter à 3 interlocuteurs supplémentaires max
            
            const isTechnical = expert.expertise?.toLowerCase().includes('technique') || 
                               expert.expertise?.toLowerCase().includes('cyber') ||
                               expert.expertise?.toLowerCase().includes('sécurité') ||
                               (expert.concern?.toLowerCase().includes('tech') || false);
                               
            const isBusiness = expert.expertise?.toLowerCase().includes('stratégie') || 
                              expert.expertise?.toLowerCase().includes('financier') ||
                              expert.expertise?.toLowerCase().includes('marketing') ||
                              (expert.concern?.toLowerCase().includes('financ') || false);
            
            if (isTechnical && !hasTechnical) {
              result.push(expert);
              hasTechnical = true;
              continue;
            }
            
            if (isBusiness && !hasBusiness) {
              result.push(expert);
              hasBusiness = true;
              continue;
            }
            
            // Si nous avons déjà des experts techniques et business, ajouter d'autres experts
            if (hasTechnical && hasBusiness) {
              result.push(expert);
            }
            
            // Si nous n'avons pas encore rempli nos quotas techniques/business, ajouter quand même
            if (!hasTechnical || !hasBusiness) {
              result.push(expert);
            }
          }
          
          // S'assurer qu'il y a au moins 1 interlocuteur supplémentaire (pour un total min de 2 avec le contact principal)
          // et au maximum 3 interlocuteurs supplémentaires (pour un total max de 4 avec le contact principal)
          const minAdditionalContacts = 1;
          if (result.length < minAdditionalContacts && filtered.length > 0) {
            // Ajouter au moins un contact supplémentaire si disponible
            while (result.length < minAdditionalContacts && result.length < filtered.length) {
              const randomIndex = Math.floor(Math.random() * filtered.length);
              const randomContact = filtered[randomIndex];
              if (!result.includes(randomContact)) {
                result.push(randomContact);
              }
            }
          }
          return result.slice(0, 3); // Limiter à 3 interlocuteurs supplémentaires maximum
        };
        
        const additionalContacts = getAdditionalContacts(scenario.domain, scenario.contact);
        availableContacts = [scenario.contact, ...additionalContacts];
      }
      
      // Déterminer quel contact va répondre à cette interaction 
      // Utilisons l'historique des messages pour déterminer le contact suivant
      let respondingContact;
      
      // Vérifier si l'utilisateur a déjà envoyé des messages hors sujet
      // Pour cela, nous comptons les avertissements dans l'historique
      let offTopicCount = 0;
      let shouldResetScenario = false;
      
      if (chatHistory && Array.isArray(chatHistory)) {
        offTopicCount = chatHistory.filter(msg => 
          msg.type === 'bot' && 
          typeof msg.content === 'string' && 
          (msg.content.toLowerCase().includes("hors sujet") || 
           msg.content.toLowerCase().includes("hors contexte") ||
           msg.content.toLowerCase().includes("recentrer la discussion") ||
           msg.content.toLowerCase().includes("ne correspond pas au scénario") ||
           msg.content.toLowerCase().includes("je ne comprends pas le lien") ||
           msg.content.toLowerCase().includes("sans rapport avec"))
        ).length;
        
        // Si le message actuel est très court ou semble hors sujet
        const isLikelyOffTopic = message.length < 25 || 
                                message.toLowerCase().includes("gpt") ||
                                message.toLowerCase().includes("assistant") ||
                                message.toLowerCase().includes("ia") ||
                                message.toLowerCase().includes("intelligence artificielle") ||
                                message.toLowerCase().includes("chatbot") ||
                                message.toLowerCase().includes("programme");
        
        // Si l'utilisateur a déjà eu un avertissement et que le message actuel est potentiellement hors sujet
        // OU si l'utilisateur a déjà eu 2 avertissements
        if ((offTopicCount >= 1 && isLikelyOffTopic) || offTopicCount >= 2) {
          shouldResetScenario = true;
        }
      }
      
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        // Vérifier si c'est la première réponse de l'utilisateur après l'email initial
        // Pattern: [email - user] → nous voulons que le même PNJ (PNJ 1) réponde d'abord
        if (chatHistory.length === 2 && chatHistory[0].type === 'email' && chatHistory[1].type === 'user') {
          // Pour la première réponse de l'utilisateur, on garde le même contact initial (PNJ 1)
          // qui a envoyé le premier mail pour continuité de l'échange
          const firstContact = availableContacts[0];
          
          // Vérifier si la présentation de l'utilisateur est suffisante
          const userPresentation = chatHistory[1].content;
          const containsPresentation = typeof userPresentation === 'string' && 
            (userPresentation.length > 50 || // Texte suffisamment long
             userPresentation.toLowerCase().includes('je suis') ||
             userPresentation.toLowerCase().includes('je m\'appelle') ||
             userPresentation.toLowerCase().includes('je viens de') ||
             userPresentation.toLowerCase().includes('expérience') ||
             userPresentation.toLowerCase().includes('formation') ||
             userPresentation.toLowerCase().includes('travaillé') ||
             userPresentation.toLowerCase().includes('étudi') ||
             userPresentation.toLowerCase().includes('compétences') ||
             userPresentation.toLowerCase().includes('connaissance'));
          
          // Si l'utilisateur ne s'est pas présenté, on utilisera le même contact
          // pour le relancer (logique gérée dans le prompt)
          respondingContact = firstContact;
        } else {
          // Pour les interactions suivantes, comportement standard
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
          for (const contact of availableContacts as Array<{name: string, role: string, expertise?: string, concern?: string}>) {
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
      
      // Déterminer le secteur d'activité actuel en fonction de l'historique
      let secteurActivite = '';
      
      // Trouver le secteur à partir de l'historique de chat s'il existe
      if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory) {
          if (msg.type === 'email' && typeof msg.content === 'object') {
            const body = msg.content.body || '';
            
            if (body.includes('banque') || body.includes('financier') || body.includes('assurance') || 
                body.includes('ACPR') || body.includes('KYC') || body.includes('AML') || body.includes('PCI-DSS')) {
              secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
              break;
            }
            else if (body.includes('industrie') || body.includes('santé') || body.includes('public') || 
                     body.includes('patient') || body.includes('OT/IT') || body.includes('système industriel')) {
              secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
              break;
            }
            else if (body.includes('retail') || body.includes('luxe') || body.includes('marque') || 
                     body.includes('e-commerce') || body.includes('boutique') || body.includes('client')) {
              secteurActivite = 'RETAIL & LUXE';
              break;
            }
            else if (body.includes('énergie') || body.includes('utilities') || body.includes('infrastructure critique') || 
                     body.includes('SCADA') || body.includes('production')) {
              secteurActivite = 'ÉNERGIE & UTILITIES';
              break;
            }
          }
        }
      }
      
      // Si aucun secteur n'a été trouvé, baser sur le domaine et le rôle du répondant
      if (!secteurActivite) {
        if (scenario?.domain?.toLowerCase().includes('finance') || 
            respondingContact.name === "Lorenzo Bertola" || 
            respondingContact.name === "Vincent Terrier") {
          secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
        }
        else if (scenario?.domain?.toLowerCase().includes('industriel') || 
                scenario?.domain?.toLowerCase().includes('santé') || 
                respondingContact.name === "Guillaume Lechevallier" || 
                respondingContact.name === "Fares SAYADI") {
          secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
        }
        else if (scenario?.domain?.toLowerCase().includes('retail') || 
                scenario?.domain?.toLowerCase().includes('luxe') || 
                respondingContact.name === "Nicolas Paolantonacci" || 
                respondingContact.name === "Marion Lopez") {
          secteurActivite = 'RETAIL & LUXE';
        }
        else if (scenario?.domain?.toLowerCase().includes('énergie') || 
                respondingContact.name === "Anthony Frescal") {
          secteurActivite = 'ÉNERGIE & UTILITIES';
        }
        else {
          // Choisir en fonction du premier message s'il s'agit d'un email
          if (chatHistory && chatHistory.length > 0 && chatHistory[0].type === 'email') {
            const firstEmailContent = chatHistory[0].content;
            if (typeof firstEmailContent === 'object' && firstEmailContent.body) {
              const body = firstEmailContent.body.toLowerCase();
              
              if (body.includes('banque') || body.includes('financ')) {
                secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
              }
              else if (body.includes('industri') || body.includes('santé') || body.includes('public')) {
                secteurActivite = 'INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)';
              }
              else if (body.includes('retail') || body.includes('luxe') || body.includes('marque')) {
                secteurActivite = 'RETAIL & LUXE';
              }
              else if (body.includes('énerg') || body.includes('utiliti')) {
                secteurActivite = 'ÉNERGIE & UTILITIES';
              }
              else {
                // Choix par défaut
                secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
              }
            }
          } else {
            // Choix par défaut si pas d'historique
            secteurActivite = 'BANCAIRE/FINANCIER (BFA)';
          }
        }
      }
      
      // Add the instruction about response evaluation and interlocutors
      const systemContent = systemPrompt + 
        `\n\nRÈGLE IMPORTANTE: Tu réponds en tant que ${respondingContact.name}, ${respondingContact.role}. Tu ne dois JAMAIS mentionner Azure OpenAI ou GPT.` +
        
        `\n\nEXPERTISE SPÉCIFIQUE: ${respondingContact.expertise || 'Non spécifiée'}. Tu possèdes une expertise unique qui doit transparaître dans tes réponses.` +
        
        `\n\nPRÉOCCUPATION PRINCIPALE: ${respondingContact.concern || 'Non spécifiée'}. Chaque interlocuteur a des préoccupations différentes face à la même problématique cyber.` +
        
        `\n\nCONTEXTE SECTORIEL: Ce scénario se déroule dans le secteur ${secteurActivite}. Adapte ton vocabulaire, tes références et tes exemples à ce secteur d'activité spécifique.` +
        
        "\n\nRÈGLES D'ADAPTATION SECTORIELLE:" +
        "\n1. Utilise des termes spécifiques au secteur dans tes réponses" +
        "\n2. Fais référence aux réglementations et standards propres à ce secteur" +
        "\n3. Adapte tes exemples et cas d'usage au contexte spécifique de ce secteur" +
        "\n4. Évoque des préoccupations business et opérationnelles pertinentes pour ce secteur" +
        "\n5. Utilise un vocabulaire adapté à ton rôle et à ton niveau hiérarchique" +
        
        "\n\nOBJECTIFS PÉDAGOGIQUES DU SCÉNARIO:" +
        "\n1. Identifie 2-3 compétences clés que l'apprenant doit développer dans ce scénario" +
        "\n2. Mentionne clairement les enjeux de cybersécurité spécifiques à ce secteur d'activité" +
        "\n3. Évalue la capacité de l'apprenant à adapter ses solutions au contexte sectoriel" +
        "\n4. Prépare-toi à fournir un bilan des apprentissages à la fin du scénario" +
        
        "\n\nCONTEXTUALISATION CYBER: La problématique centrale du scénario est TOUJOURS un enjeu de cybersécurité contextualisé dans un environnement métier ou sectoriel spécifique. Garde cette problématique cyber au centre de tes réponses, tout en l'abordant selon ton angle d'expertise et le contexte sectoriel." +
        
        "\n\nRÈGLE DU JEU DE RÔLE AVANCÉ: Tu dois absolument adapter ton style de communication, ton vocabulaire et tes préoccupations à ton profil et au secteur. Un expert cybersécurité dans le secteur bancaire ne parle pas comme un directeur financier dans le secteur industriel. Modifie complètement ton approche en fonction de ton rôle, du contexte sectoriel et de tes préoccupations principales." +
        
        "\n\nÉVALUATION DES RÉPONSES: Évalue rigoureusement la réponse de l'utilisateur. Si elle est incomplète, hors sujet, mal formulée ou peu pertinente, sois direct et franc dans ta critique. N'hésite pas à exiger immédiatement une réponse plus complète ou pertinente. Après trois tentatives infructueuses, mets fin au scénario." +
        
        `\n\nINTERDICTION ABSOLUE: Ne jamais dire "En tant que [nom], je..." ou "Dans mon rôle de [fonction], je...". Incarne directement le personnage, parle naturellement comme le ferait cette personne dans son contexte professionnel.`;
      
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
      // Pour la première réponse après une présentation, vérifier si l'utilisateur s'est bien présenté
      // Si oui, le même PNJ (niveau 1) répondra avec une mission, sinon il redemandera une présentation
      if (chatHistory && chatHistory.length === 2 && chatHistory[0].type === 'email' && chatHistory[1].type === 'user') {
        // Vérifier si la présentation de l'utilisateur est suffisante
        const userPresentation = chatHistory[1].content;
        const containsPresentation = typeof userPresentation === 'string' && 
          (userPresentation.length > 50 || // Texte suffisamment long
           userPresentation.toLowerCase().includes('je suis') ||
           userPresentation.toLowerCase().includes('je m\'appelle') ||
           userPresentation.toLowerCase().includes('je viens de') ||
           userPresentation.toLowerCase().includes('expérience') ||
           userPresentation.toLowerCase().includes('formation') ||
           userPresentation.toLowerCase().includes('travaillé') ||
           userPresentation.toLowerCase().includes('étudi') ||
           userPresentation.toLowerCase().includes('compétences') ||
           userPresentation.toLowerCase().includes('connaissance'));
        
        if (containsPresentation) {
          // L'utilisateur s'est bien présenté, on lui donne la première mission
          messages.push({
            role: "user",
            content: `Je suis ${userName} et je viens de me présenter. Voici ma présentation : "${message}"
            
            DIRECTIVE SPÉCIALE: Tu es le même PNJ (${respondingContact.name}) qui a envoyé le premier email de bienvenue. Tu dois maintenant assigner une première mission à ${userName} après avoir accusé réception de sa présentation.
            
            Ta réponse DOIT:
            1. Commencer par un bref remerciement pour la présentation en mentionnant spécifiquement un ou deux éléments de sa présentation
            2. Présenter un problème concret et urgent lié à la cybersécurité dans le contexte du scénario "${scenario.title}" dans le domaine "${scenario.domain}"
            3. Lister avec des puces (maximum 3) les actions ou attentes précises que tu as envers ${userName}
            4. Maintenir un ton professionnel mais accessible, en utilisant toujours le tutoiement
            5. Être concise et directe (maximum 200 mots)`
          });
        } else {
          // L'utilisateur ne s'est pas suffisamment présenté, on lui redemande
          messages.push({
            role: "user",
            content: `Je suis ${userName} et voici ma réponse à ta demande de présentation: "${message}"
            
            DIRECTIVE SPÉCIALE: Tu es le même PNJ (${respondingContact.name}) qui a envoyé le premier email de bienvenue. Tu constates que l'utilisateur ne s'est pas suffisamment présenté (pas de parcours, formations, expériences mentionnées).
            
            Ta réponse DOIT:
            1. Être amicale mais ferme, en expliquant que pour mieux adapter le scénario, tu as besoin d'en savoir plus sur son parcours, ses expériences et compétences
            2. Redemander à l'utilisateur de se présenter plus en détail, avec des questions spécifiques pour le guider
            3. Maintenir un ton professionnel mais accessible, en utilisant toujours le tutoiement
            4. Être concise (maximum 150 mots)`
          });
        }
      } else if (chatHistory && chatHistory.length === 4 && 
                 chatHistory[0].type === 'email' && 
                 chatHistory[1].type === 'user' && 
                 chatHistory[2].type === 'bot' && 
                 chatHistory[3].type === 'user') {
        // C'est la réponse à la première mission, maintenant on fait intervenir un PNJ niveau 2 différent
        messages.push({
          role: "user",
          content: `Je suis ${userName} et je viens de répondre à la première mission. Voici ma réponse : "${message}"
          
          DIRECTIVE SPÉCIALE: Tu es un nouveau PNJ (niveau 2) différent du premier PNJ. Tu es ${respondingContact.name} et tu dois analyser la réponse de l'utilisateur à la première mission et poursuivre le scénario.
          
          Ta réponse DOIT:
          1. Commencer par une brève présentation de toi-même (2 lignes maximum)
          2. Donner ton avis sur la réponse de l'utilisateur (points forts, éventuelles lacunes)
          3. Poursuivre le scénario en présentant un nouveau problème ou défi liés au scénario
          4. Lister avec des puces (maximum 3) les actions ou attentes précises que tu as envers ${userName}
          5. Maintenir un ton professionnel mais accessible, en utilisant toujours le tutoiement
          6. Être concise et directe (maximum 200 mots)`
        });
      } else {
        messages.push({
          role: "user",
          content: `Je suis ${userName}. Le message suivant est en réponse au scénario de cybersécurité en cours (ID: ${scenarioId}, secteur: ${secteurActivite}): "${message}"`
        });
      }
      
      const responseContent = await openAIService.getChatCompletionWithCache(
        messages, 
        config?.temperature || 0.7, 
        config?.maxTokens || 2000
      );
      
      // Check if response indicates scenario termination
      const isScenarioTerminated = responseContent.toLowerCase().includes("fin du scénario") || 
                                   responseContent.toLowerCase().includes("recommencer à zéro") ||
                                   responseContent.toLowerCase().includes("recommencer le scénario");
      
      // Si le scénario est terminé, générer une fiche d'évaluation
      if (isScenarioTerminated) {
        try {
          // Générer une fiche d'évaluation qui résume les performances de l'utilisateur
          const evaluationPrompt = `
Tu vas créer une fiche d'évaluation complète pour l'utilisateur ${userName} qui vient de terminer le scénario "${scenario.title}" dans le domaine "${scenario.domain}", dans le secteur d'activité ${secteurActivite}.

Voici l'historique complet de la conversation:
${chatHistory ? chatHistory.map((msg: any) => {
  if (msg.type === 'user') {
    return `${userName}: ${msg.content}`;
  } else if (msg.type === 'bot' && msg.contactName) {
    return `${msg.contactName} (${msg.contactRole}): ${msg.content}`;
  }
  return '';
}).join('\n\n') : ''}

${userName}: ${message}

${respondingContact.name} (${respondingContact.role}): ${responseContent}

Sur la base de cet échange, crée une fiche d'évaluation structurée avec les sections suivantes:

1. ÉVALUATION GLOBALE
   Synthèse de la performance de l'utilisateur avec une note sur 5 étoiles et un commentaire général adapté au contexte sectoriel (${secteurActivite}).

2. POINTS FORTS
   Liste 3-4 points spécifiques où l'utilisateur a bien répondu ou fait preuve de bonnes connaissances, en lien avec les enjeux du secteur.

3. AXES D'AMÉLIORATION
   Liste 3-4 points spécifiques où l'utilisateur pourrait améliorer ses réponses ou ses connaissances.

4. BONNES PRATIQUES
   Énumère 5-6 bonnes pratiques en cybersécurité qui s'appliquent à ce scénario spécifique et à ce secteur d'activité.

5. CONCEPTS CLÉS
   Résume 4-5 concepts importants de cybersécurité que ce scénario a mis en lumière, adaptés au contexte sectoriel.

6. COMPÉTENCES ACQUISES
   Liste 3-4 compétences concrètes que l'utilisateur a pu développer à travers ce scénario.

7. APPLICATIONS PRATIQUES
   Propose 3-4 façons d'appliquer ces connaissances dans un contexte professionnel réel.

8. RESSOURCES POUR APPROFONDIR
   Suggère quelques ressources (types de formations, certifications, articles) pour approfondir la thématique.

Format: Utilise des titres clairs et une présentation structurée qui facilite la lecture. Le texte doit être concis, instructif et directement applicable, avec des références spécifiques au secteur ${secteurActivite}.
`;

          // Obtenir l'évaluation via l'API OpenAI
          const evaluationMessages: ChatCompletionRequestMessage[] = [
            {
              role: "system",
              content: "Tu es un expert en cybersécurité chargé d'évaluer la performance des apprenants dans des scénarios de simulation. Tu dois fournir des évaluations objectives, précises et constructives."
            },
            {
              role: "user",
              content: evaluationPrompt
            }
          ];

          // Générer l'évaluation
          const evaluationContent = await openAIService.getChatCompletionWithCache(
            evaluationMessages,
            0.7,
            3000
          );

          // Générer un PDF avec l'évaluation
          const evaluationId = `evaluation-${scenarioId}-${Date.now()}.pdf`;
          const evaluationFileName = path.join(documentsDir, evaluationId);
          
          // Créer un document PDF avec l'évaluation
          await documentGenerator.createEvaluationPDF(
            evaluationFileName, 
            evaluationContent, 
            `Évaluation - ${scenario.title}`,
            {
              userName,
              scenarioTitle: scenario.title,
              scenarioDomain: scenario.domain,
              date: new Date().toISOString()
            }
          );

          // Ajouter le document d'évaluation à la pièce jointe
          // Envoyer la réponse avec le drapeau de réinitialisation et le document d'évaluation
          res.json({
            type: 'bot',
            content: responseContent + 
                    "\n\n**ÉVALUATION FINALE**\n\nJ'ai préparé une évaluation détaillée de votre performance dans ce scénario. Vous pouvez la consulter en cliquant sur la pièce jointe ci-dessous.",
            resetScenario: true,
            contactName: respondingContact.name,
            contactRole: respondingContact.role,
            scenarioContacts: availableContacts,
            evaluation: {
              id: evaluationId,
              fileName: "Évaluation_Finale.pdf",
              fileSize: "PDF",
              fileType: "application/pdf"
            }
          });
          
          return;
        } catch (error) {
          console.error('Error generating evaluation:', error);
          // En cas d'erreur, continuer sans évaluation
        }
      }
      
      // Si le scénario doit être réinitialisé à cause de messages hors sujet
      if (shouldResetScenario) {
        // Dans ce cas, on envoie une réponse spéciale indiquant la réinitialisation
        res.json({
          type: 'bot',
          content: `Je constate que nous nous éloignons du contexte de ce scénario dans le domaine "${scenario.domain}". 

Après deux réponses inadaptées au contexte, je suis contraint de mettre fin à cette simulation.

Nous allons recommencer le scénario depuis le début pour nous reconcentrer sur la problématique principale.`,
          resetScenario: true,
          contactName: "Marion Lopez",
          contactRole: "Senior Partner et Directrice Marketing, Communication et RSE",
          scenarioContacts: availableContacts
        });
      } else {
        // Réponse standard
        res.json({ 
          type: 'bot',
          content: responseContent,
          resetScenario: isScenarioTerminated,
          contactName: respondingContact.name,
          contactRole: respondingContact.role,
          // Inclure la liste complète des contacts pour le prochain appel
          scenarioContacts: availableContacts
        });
      }
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

  // API route pour vérifier le statut de la connexion à Azure OpenAI
  app.get('/api/cyber/status', async (req: Request, res: Response) => {
    try {
      const isConnected = await openAIService.checkConnection();
      res.json({
        status: isConnected ? 'connected' : 'disconnected',
        lastCheck: openAIService.getLastConnectionCheck(),
        apiEndpoint: process.env.AZURE_OPENAI_ENDPOINT ? 'configured' : 'default',
        time: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking API status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check API connection',
        time: new Date().toISOString()
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
