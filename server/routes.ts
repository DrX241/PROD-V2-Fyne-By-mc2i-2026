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
        {
          id: "network-intrusion",
          title: "Analyse d'une tentative d'intrusion",
          domain: "Sécurité des réseaux",
          contact: {
            name: "Neil LEVIN",
            role: "Expert cybersécurité & CFO"
          },
          difficulty: "Intermédiaire",
        },
        {
          id: "firewall-config",
          title: "Configuration d'un pare-feu nouvelle génération",
          domain: "Sécurité des réseaux",
          contact: {
            name: "Yousra SAIDANI",
            role: "Experte Cybersécurité & CFO"
          },
          difficulty: "Débutant",
        },
        {
          id: "vuln-scanning",
          title: "Audit de vulnérabilités sur un système critique",
          domain: "Gestion des vulnérabilités",
          contact: {
            name: "Lorenzo Bertola",
            role: "Directeur Général Adjoint et Directeur du pôle BFA"
          },
          difficulty: "Expert",
        },
        {
          id: "data-breach",
          title: "Gestion d'une fuite de données",
          domain: "Sécurité des données",
          contact: {
            name: "Marion Lopez",
            role: "Senior Partner et Directrice Marketing, Communication et RSE"
          },
          difficulty: "Intermédiaire",
        }
      ];
      
      const scenario = scenarios.find(s => s.id === scenarioId);
      
      if (!scenario) {
        return res.status(404).json({ message: 'Scenario not found' });
      }
      
      // Generate a document for the scenario
      let attachmentType = '';
      switch (scenarioId) {
        case 'network-intrusion':
          attachmentType = 'logs_connexion_suspects';
          break;
        case 'firewall-config':
          attachmentType = 'politique_securite_reseau';
          break;
        case 'vuln-scanning':
          attachmentType = 'rapport_vulnerabilites';
          break;
        case 'data-breach':
          attachmentType = 'rapport_incident_donnees';
          break;
        default:
          attachmentType = 'document_support';
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
      const subject = subjectMatch ? subjectMatch[1].trim() : `Concernant: ${scenario.title}`;
      
      // Remove any email headers from the content
      const body = emailContent
        .replace(/De\s*:.*?(?:\n|$)/gi, '')
        .replace(/À\s*:.*?(?:\n|$)/gi, '')
        .replace(/Objet\s*:.*?(?:\n|$)/gi, '')
        .replace(/Date\s*:.*?(?:\n|$)/gi, '')
        .trim();
      
      // Format file size based on content length
      const contentBytes = Buffer.byteLength(document.content, 'utf8');
      const fileSizeKB = Math.round(contentBytes / 1024);
      
      // Create email response
      const email = {
        id: uuidv4(),
        from: scenario.contact,
        to: userName,
        subject,
        date: new Date().toISOString(),
        body,
        attachments: [
          {
            id: document.fileName,
            fileName: `${attachmentType}.txt`,
            fileSize: `${fileSizeKB} KB`,
            fileType: 'text/plain'
          }
        ]
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
      const { message, userName, scenarioId, config, chatHistory } = req.body;
      
      if (!message || !userName) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      // Generate response with Azure OpenAI
      const systemPrompt = await openAIService.generateSystemPrompt({
        difficultyLevel: config?.difficultyLevel || "Intermédiaire",
        responseStyle: config?.responseStyle || "Professionnel"
      });
      
      // Add the instruction about response evaluation
      const systemContent = systemPrompt + 
        "\n\nRÈGLE IMPORTANTE: Réponds comme si tu étais CyberGuide, ne mentionne pas Azure OpenAI ou GPT." +
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
      
      // Send response with termination flag if detected
      res.json({ 
        type: 'bot',
        content: responseContent,
        resetScenario: isScenarioTerminated
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
      
      const content = fs.readFileSync(documentPath, 'utf8');
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=${documentId}`);
      res.send(content);
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
