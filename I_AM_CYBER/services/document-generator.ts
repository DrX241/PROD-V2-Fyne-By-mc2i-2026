import fs from 'fs';
import path from 'path';
import { openAIService } from './openai';
import { ChatCompletionRequestMessage } from '../../shared/schema';

export class DocumentGenerator {
  private documentsDir: string;

  constructor() {
    this.documentsDir = path.join(process.cwd(), 'I_AM_CYBER', 'documents');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  async generateDocument(
    scenarioId: string,
    documentType: string,
    context: {
      domain: string;
      scenario: string;
      userName: string;
      contactName: string;
      difficultyLevel: string;
    }
  ): Promise<{ fileName: string, content: string }> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${scenarioId}_${documentType.replace(/\s+/g, '_')}_${timestamp}.txt`;
      const filePath = path.join(this.documentsDir, fileName);

      // Create prompt for document generation
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: `Vous êtes un générateur de documents techniques en cybersécurité. Créez un document ${documentType} réaliste et détaillé pour un scénario de formation. 
          Le document doit faire au maximum une page et contenir des informations techniques précises et pertinentes.
          Format: Utilisez un format structuré avec des en-têtes, des sections et des données techniques appropriées au type de document.`
        },
        {
          role: "user",
          content: `Générez un document "${documentType}" pour un scénario de formation en cybersécurité avec les détails suivants:
          - Domaine: ${context.domain}
          - Scénario: ${context.scenario}
          - Niveau de difficulté: ${context.difficultyLevel}
          - Contact: ${context.contactName}
          - Destinataire: ${context.userName}
          
          Le document doit être réaliste, comme s'il avait été produit dans un environnement professionnel d'entreprise. 
          Incluez des détails techniques suffisants pour que l'utilisateur puisse analyser et répondre de façon appropriée.`
        }
      ];

      // Generate document content
      const content = await openAIService.getChatCompletion(messages, 0.7, 1500);

      // Save document to file
      fs.writeFileSync(filePath, content);

      return {
        fileName,
        content
      };
    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error(`Failed to generate ${documentType} document`);
    }
  }

  getDocumentPath(fileName: string): string {
    return path.join(this.documentsDir, fileName);
  }

  getDocumentContent(fileName: string): string {
    const filePath = this.getDocumentPath(fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Document not found: ${fileName}`);
    }
    return fs.readFileSync(filePath, 'utf8');
  }

  listDocuments(): string[] {
    this.ensureDirectoryExists();
    return fs.readdirSync(this.documentsDir);
  }
}

export const documentGenerator = new DocumentGenerator();
